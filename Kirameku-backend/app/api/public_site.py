from fastapi import APIRouter, Depends

from app.public_site import PublicSiteSettings, get_public_site_settings
from app.schemas.public_site import (
    ContentVisibility,
    PublicSiteConfigOut,
    PublicSiteStats,
)


router = APIRouter(prefix="/api/site", tags=["site"])


@router.get("/public-config", response_model=PublicSiteConfigOut)
def get_public_site_config(
    settings: PublicSiteSettings = Depends(get_public_site_settings),
) -> PublicSiteConfigOut:
    return PublicSiteConfigOut(
        contentVisibility=ContentVisibility(
            posts=settings.public_posts_enabled,
            chatters=settings.public_chatters_enabled,
            albums=settings.public_albums_enabled,
        ),
        siteStats=PublicSiteStats(
            launchDateConfigured=settings.site_launch_date is not None
        ),
    )
