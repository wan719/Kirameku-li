from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.deps import get_session
from app.schemas import PostCreate, PostUpdate, PostOut, PostDetail
from app.services import post_service
from app.deps import get_current_user
from app.public_site import PublicSiteSettings, get_public_site_settings

router = APIRouter(prefix="/api/posts", tags=["文章"])


@router.get("", response_model=list[PostOut])
def list_posts(
    status: str | None = None,
    category: str | None = None,
    tag: str | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=200),
    session: Session = Depends(get_session),
    settings: PublicSiteSettings = Depends(get_public_site_settings),
):
    return post_service.get_public_posts(session, settings, category, tag, page, size)


@router.get("/count")
def post_count(
    status: str | None = None,
    session: Session = Depends(get_session),
    settings: PublicSiteSettings = Depends(get_public_site_settings),
):
    return {"count": post_service.count_public_posts(session, settings)}


@router.get("/admin", response_model=list[PostOut])
def admin_list_posts(
    status: str | None = None,
    category: str | None = None,
    tag: str | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=200),
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return post_service.get_posts(session, status, category, tag, page, size)


@router.get("/admin/count")
def admin_post_count(
    status: str | None = None,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return {"count": post_service.count_posts(session, status)}


@router.get("/admin/detail/{post_id}", response_model=PostDetail)
def admin_get_post_by_id(
    post_id: int,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return post_service.get_post_by_id(session, post_id)


@router.get("/admin/slug/{slug}", response_model=PostDetail)
def admin_get_post_by_slug(
    slug: str,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return post_service.get_post_by_slug(session, slug)


@router.get("/detail/{post_id}", response_model=PostDetail)
def get_post_by_id(
    post_id: int,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return post_service.get_post_by_id(session, post_id)


@router.get("/{slug}", response_model=PostDetail)
def get_post(
    slug: str,
    session: Session = Depends(get_session),
    settings: PublicSiteSettings = Depends(get_public_site_settings),
):
    return post_service.get_public_post_by_slug(session, slug, settings)


@router.post("", response_model=PostOut)
def create_post(
    data: PostCreate,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return post_service.create_post(session, data)


@router.put("/{post_id}", response_model=PostOut)
def update_post(
    post_id: int,
    data: PostUpdate,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return post_service.update_post(session, post_id, data)


@router.post("/{post_id}/like")
def like_post(
    post_id: int,
    session: Session = Depends(get_session),
    settings: PublicSiteSettings = Depends(get_public_site_settings),
):
    return post_service.toggle_public_like(session, post_id, settings, unlike=False)


@router.post("/{post_id}/unlike")
def unlike_post(
    post_id: int,
    session: Session = Depends(get_session),
    settings: PublicSiteSettings = Depends(get_public_site_settings),
):
    return post_service.toggle_public_like(session, post_id, settings, unlike=True)


@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    post_service.delete_post(session, post_id)
    return {"ok": True}
