from fastapi import APIRouter

from app.public_site import PUBLIC_SITE_SETTINGS
from app.schemas.public_site import (
    ContentVisibility,
    PublicSiteConfigOut,
    PublicSiteStats,
)


router = APIRouter(prefix="/api/site", tags=["site"])


@router.get("/public-config", response_model=PublicSiteConfigOut)
def get_public_site_config() -> PublicSiteConfigOut:
    return PublicSiteConfigOut(
        contentVisibility=ContentVisibility(
            posts=PUBLIC_SITE_SETTINGS.public_posts_enabled,
            chatters=PUBLIC_SITE_SETTINGS.public_chatters_enabled,
            albums=PUBLIC_SITE_SETTINGS.public_albums_enabled,
        ),
        siteStats=PublicSiteStats(
            launchDateConfigured=PUBLIC_SITE_SETTINGS.site_launch_date is not None
        ),
    )
