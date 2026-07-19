from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from hashlib import sha256
from pathlib import Path
import re
from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, func, select
import yaml

from app.models import Category, Post, PostTag, Tag


FRONT_MATTER_PATTERN = re.compile(
    r"\A\ufeff?---[ \t]*\r?\n(?P<yaml>.*?)(?:\r?\n)---[ \t]*(?:\r?\n|\Z)",
    re.DOTALL,
)
H1_PATTERN = re.compile(r"^#\s+(.+?)\s*$", re.MULTILINE)
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class DraftImportError(ValueError):
    pass


@dataclass(frozen=True)
class ParsedDraft:
    title: str
    slug: str
    summary: str
    category: str
    tags: tuple[str, ...]
    content: str


@dataclass(frozen=True)
class DraftImportResult:
    post_id: int
    slug: str
    action: str


def _optional_text(metadata: dict[str, Any], key: str, max_length: int) -> str:
    value = metadata.get(key)
    if value is None:
        return ""
    if not isinstance(value, str):
        raise DraftImportError(f"Front Matter 字段 {key} 必须是文本")
    value = value.strip()
    if len(value) > max_length:
        raise DraftImportError(f"Front Matter 字段 {key} 过长")
    return value


def _parse_tags(metadata: dict[str, Any]) -> tuple[str, ...]:
    value = metadata.get("tags")
    if value is None:
        return ()
    if not isinstance(value, list):
        raise DraftImportError("Front Matter 字段 tags 必须是列表")

    tags = []
    seen = set()
    for item in value:
        if not isinstance(item, str) or not item.strip():
            raise DraftImportError("Front Matter 中的标签必须是非空文本")
        tag = item.strip()
        if len(tag) > 50:
            raise DraftImportError("Front Matter 中的标签过长")
        key = tag.casefold()
        if key not in seen:
            tags.append(tag)
            seen.add(key)
    return tuple(tags)


def parse_markdown_draft(path: Path) -> ParsedDraft:
    if not path.is_file():
        raise DraftImportError("Markdown 文件不存在")
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        raise DraftImportError("Markdown 文件无法读取") from error

    match = FRONT_MATTER_PATTERN.match(text)
    if not match:
        raise DraftImportError("Markdown 缺少有效的 YAML Front Matter")
    try:
        metadata = yaml.safe_load(match.group("yaml"))
    except yaml.YAMLError as error:
        raise DraftImportError("YAML Front Matter 无法解析") from error
    if not isinstance(metadata, dict):
        raise DraftImportError("YAML Front Matter 必须是对象")

    slug = _optional_text(metadata, "slug", 200)
    if not slug:
        raise DraftImportError("Front Matter 缺少 slug")
    if not SLUG_PATTERN.fullmatch(slug):
        raise DraftImportError("slug 只能包含小写字母、数字和连字符")

    content = text[match.end() :].lstrip("\r\n")
    title = _optional_text(metadata, "title", 200)
    if not title:
        heading = H1_PATTERN.search(content)
        title = heading.group(1).strip() if heading else ""
    if not title:
        raise DraftImportError("无法从 Front Matter 或一级标题解析标题")
    if len(title) > 200:
        raise DraftImportError("文章标题过长")

    return ParsedDraft(
        title=title,
        slug=slug,
        summary=_optional_text(metadata, "summary", 500),
        category=_optional_text(metadata, "category", 50),
        tags=_parse_tags(metadata),
        content=content,
    )


def _metadata_slug(name: str) -> str:
    normalized = re.sub(r"\s+", "-", name.strip().lower())
    normalized = re.sub(r"[^\w\u4e00-\u9fff-]", "", normalized)
    normalized = normalized.strip("-")
    if normalized:
        return normalized[:50]
    return f"item-{sha256(name.encode('utf-8')).hexdigest()[:12]}"


def _unique_metadata_slug(
    session: Session,
    model: type[Category] | type[Tag],
    name: str,
) -> str:
    base = _metadata_slug(name)
    existing = session.exec(select(model).where(model.slug == base)).first()
    if not existing or existing.name == name:
        return base
    suffix = sha256(name.encode("utf-8")).hexdigest()[:8]
    return f"{base[:41]}-{suffix}"


def _get_or_create_category(session: Session, name: str) -> Category | None:
    if not name:
        return None
    category = session.exec(
        select(Category).where(func.lower(Category.name) == name.lower())
    ).first()
    if category:
        return category
    category = Category(
        name=name,
        slug=_unique_metadata_slug(session, Category, name),
    )
    session.add(category)
    session.flush()
    return category


def _get_or_create_tag(session: Session, name: str) -> Tag:
    tag = session.exec(
        select(Tag).where(func.lower(Tag.name) == name.lower())
    ).first()
    if tag:
        return tag
    tag = Tag(name=name, slug=_unique_metadata_slug(session, Tag, name))
    session.add(tag)
    session.flush()
    return tag


def _replace_tags(session: Session, post_id: int, tag_names: tuple[str, ...]) -> None:
    old_links = session.exec(
        select(PostTag).where(PostTag.post_id == post_id)
    ).all()
    for link in old_links:
        session.delete(link)
    session.flush()

    for name in tag_names:
        tag = _get_or_create_tag(session, name)
        if tag.id is None:
            raise DraftImportError("标签写入失败")
        session.add(PostTag(post_id=post_id, tag_id=tag.id))
    session.flush()

    for tag in session.exec(select(Tag)).all():
        tag.post_count = session.exec(
            select(func.count(PostTag.post_id)).where(PostTag.tag_id == tag.id)
        ).one()
        session.add(tag)


def _update_category_counts(session: Session, category_ids: set[int | None]) -> None:
    for category_id in category_ids:
        if category_id is None:
            continue
        category = session.get(Category, category_id)
        if category:
            category.post_count = session.exec(
                select(func.count(Post.id)).where(Post.category_id == category_id)
            ).one()
            session.add(category)


def import_markdown_draft(session: Session, path: Path) -> DraftImportResult:
    draft = parse_markdown_draft(path)
    try:
        post = session.exec(select(Post).where(Post.slug == draft.slug)).first()
        if post and post.status == "published":
            raise DraftImportError("同 slug 的文章已经发布，拒绝覆盖")

        category = _get_or_create_category(session, draft.category)
        old_category_id = post.category_id if post else None
        action = "updated" if post else "created"
        if post is None:
            post = Post(slug=draft.slug, title=draft.title)

        post.title = draft.title
        post.description = draft.summary
        post.content = draft.content
        post.category_id = category.id if category else None
        post.status = "draft"
        post.published_at = None
        post.word_count = len(draft.content)
        post.reading_time = max(1, post.word_count // 300) if draft.content else 0
        post.updated_at = datetime.now()
        session.add(post)
        session.flush()
        if post.id is None:
            raise DraftImportError("文章写入失败")

        _replace_tags(session, post.id, draft.tags)
        _update_category_counts(
            session,
            {old_category_id, post.category_id},
        )
        session.commit()
        session.refresh(post)
    except DraftImportError:
        session.rollback()
        raise
    except SQLAlchemyError as error:
        session.rollback()
        raise DraftImportError("数据库写入失败，事务已回滚") from error

    return DraftImportResult(post_id=post.id, slug=post.slug, action=action)
