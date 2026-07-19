from fastapi import HTTPException

from app.models import Post
from app.public_site import PublicSiteSettings


def is_post_public(post: Post, settings: PublicSiteSettings) -> bool:
    if post.status != "published":
        return False
    if settings.public_posts_enabled:
        return True
    return post.slug in settings.public_post_slug_allowlist


def require_chatters_public(settings: PublicSiteSettings) -> None:
    if not settings.public_chatters_enabled:
        raise HTTPException(status_code=404, detail="内容不存在")


def require_albums_public(settings: PublicSiteSettings) -> None:
    if not settings.public_albums_enabled:
        raise HTTPException(status_code=404, detail="内容不存在")
