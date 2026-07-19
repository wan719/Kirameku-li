import os
from dataclasses import dataclass
from datetime import date
from typing import Mapping, Optional, Tuple


_TRUE_VALUES = {"1", "true", "yes", "on"}


def _parse_bool(value: Optional[str]) -> bool:
    return (value or "").strip().lower() in _TRUE_VALUES


def _parse_allowlist(value: Optional[str]) -> Tuple[str, ...]:
    slugs = []
    seen = set()
    for item in (value or "").split(","):
        slug = item.strip()
        if slug and slug not in seen:
            seen.add(slug)
            slugs.append(slug)
    return tuple(slugs)


def _parse_date(value: Optional[str]) -> Optional[date]:
    if not value or not value.strip():
        return None
    try:
        return date.fromisoformat(value.strip())
    except ValueError:
        return None


@dataclass(frozen=True)
class PublicSiteSettings:
    public_posts_enabled: bool
    public_post_slug_allowlist: Tuple[str, ...]
    public_chatters_enabled: bool
    public_albums_enabled: bool
    public_stats_namespace: str
    site_launch_date: Optional[date]


def load_public_site_settings(environ: Mapping[str, str]) -> PublicSiteSettings:
    namespace = environ.get("PUBLIC_STATS_NAMESPACE", "").strip()
    return PublicSiteSettings(
        public_posts_enabled=_parse_bool(environ.get("PUBLIC_POSTS_ENABLED")),
        public_post_slug_allowlist=_parse_allowlist(
            environ.get("PUBLIC_POST_SLUG_ALLOWLIST")
        ),
        public_chatters_enabled=_parse_bool(environ.get("PUBLIC_CHATTERS_ENABLED")),
        public_albums_enabled=_parse_bool(environ.get("PUBLIC_ALBUMS_ENABLED")),
        public_stats_namespace=namespace or "kirameku-wan-v1",
        site_launch_date=_parse_date(environ.get("SITE_LAUNCH_DATE")),
    )


PUBLIC_SITE_SETTINGS = load_public_site_settings(os.environ)


def get_public_site_settings() -> PublicSiteSettings:
    return PUBLIC_SITE_SETTINGS
