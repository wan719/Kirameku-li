from pydantic import BaseModel


class ContentVisibility(BaseModel):
    posts: bool
    chatters: bool
    albums: bool


class PublicSiteStats(BaseModel):
    launchDateConfigured: bool


class PublicSiteConfigOut(BaseModel):
    contentVisibility: ContentVisibility
    siteStats: PublicSiteStats
