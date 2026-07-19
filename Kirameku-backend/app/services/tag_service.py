from sqlmodel import Session, select
from fastapi import HTTPException

from app.content_visibility import is_post_public
from app.models import Post, PostTag, Tag
from app.public_site import PublicSiteSettings
from app.schemas import TagCreate, TagUpdate


def get_tags(session: Session) -> list[Tag]:
    return list(session.exec(select(Tag).order_by(Tag.post_count.desc())).all())


def get_public_tags(session: Session, settings: PublicSiteSettings) -> list[dict]:
    public_post_ids = {
        post.id
        for post in session.exec(select(Post)).all()
        if post.id is not None and is_post_public(post, settings)
    }
    if not public_post_ids:
        return []

    counts: dict[int, int] = {}
    for item in session.exec(select(PostTag)).all():
        if item.post_id in public_post_ids:
            counts[item.tag_id] = counts.get(item.tag_id, 0) + 1

    tags = session.exec(select(Tag)).all()
    result = [
        {
            "id": tag.id,
            "name": tag.name,
            "slug": tag.slug,
            "post_count": counts[tag.id],
        }
        for tag in tags
        if tag.id in counts
    ]
    return sorted(result, key=lambda item: (-item["post_count"], item["name"]))


def create_tag(session: Session, data: TagCreate) -> Tag:
    tag = Tag(**data.model_dump())
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


def update_tag(session: Session, tag_id: int, data: TagUpdate) -> Tag:
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(tag, k, v)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


def delete_tag(session: Session, tag_id: int):
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")
    session.delete(tag)
    session.commit()
