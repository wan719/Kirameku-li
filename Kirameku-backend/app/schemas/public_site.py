from typing import Optional

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


class PublicVisitorStatsOut(BaseModel):
    code: int
    count: int
    launchDate: Optional[str]
    runningDays: Optional[int]
