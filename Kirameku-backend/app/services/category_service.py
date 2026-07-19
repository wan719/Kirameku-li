from datetime import datetime
from sqlmodel import Session, select
from fastapi import HTTPException

from app.content_visibility import is_post_public
from app.models import Category, Post
from app.public_site import PublicSiteSettings
from app.schemas import CategoryCreate, CategoryUpdate


def get_categories(session: Session) -> list[Category]:
    return list(session.exec(select(Category).order_by(Category.sort)).all())


def get_public_categories(
    session: Session, settings: PublicSiteSettings
) -> list[dict]:
    counts: dict[int, int] = {}
    for post in session.exec(select(Post)).all():
        if post.category_id is not None and is_post_public(post, settings):
            counts[post.category_id] = counts.get(post.category_id, 0) + 1

    categories = session.exec(select(Category).order_by(Category.sort)).all()
    return [
        {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
            "sort": category.sort,
            "post_count": counts[category.id],
            "created_at": category.created_at,
            "updated_at": category.updated_at,
        }
        for category in categories
        if category.id in counts
    ]


def get_category_by_id(session: Session, cat_id: int) -> Category:
    cat = session.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")
    return cat


def create_category(session: Session, data: CategoryCreate) -> Category:
    cat = Category(**data.model_dump())
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


def update_category(session: Session, cat_id: int, data: CategoryUpdate) -> Category:
    cat = session.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(cat, k, v)
    cat.updated_at = datetime.now()
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


def delete_category(session: Session, cat_id: int):
    cat = session.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")
    session.delete(cat)
    session.commit()
