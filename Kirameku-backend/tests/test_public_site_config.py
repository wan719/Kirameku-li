import importlib
import os
import unittest

from fastapi.testclient import TestClient


os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["DATABASE_URL"] = "postgresql://phase3:phase3@127.0.0.1:1/phase3"
os.environ["SECRET_KEY"] = "phase3-public-config-test-key"
os.environ["AUTO_CREATE_TABLES"] = "false"


def load_settings_module():
    try:
        return importlib.import_module("app.public_site")
    except ModuleNotFoundError as error:
        raise AssertionError("app.public_site settings module is missing") from error


class PublicSiteSettingsTests(unittest.TestCase):
    def test_safe_defaults_disable_public_content(self):
        module = load_settings_module()

        settings = module.load_public_site_settings({})

        self.assertFalse(settings.public_posts_enabled)
        self.assertEqual(settings.public_post_slug_allowlist, ())
        self.assertFalse(settings.public_chatters_enabled)
        self.assertFalse(settings.public_albums_enabled)
        self.assertEqual(settings.public_stats_namespace, "kirameku-wan-v1")
        self.assertIsNone(settings.site_launch_date)

    def test_allowlist_is_trimmed_deduplicated_and_empty_entries_removed(self):
        module = load_settings_module()

        settings = module.load_public_site_settings(
            {
                "PUBLIC_POST_SLUG_ALLOWLIST": (
                    " first-post,second-post, first-post, ,third-post "
                )
            }
        )

        self.assertEqual(
            settings.public_post_slug_allowlist,
            ("first-post", "second-post", "third-post"),
        )

    def test_boolean_values_are_parsed_without_enabling_unknown_values(self):
        module = load_settings_module()

        settings = module.load_public_site_settings(
            {
                "PUBLIC_POSTS_ENABLED": "true",
                "PUBLIC_CHATTERS_ENABLED": "1",
                "PUBLIC_ALBUMS_ENABLED": "unexpected",
            }
        )

        self.assertTrue(settings.public_posts_enabled)
        self.assertTrue(settings.public_chatters_enabled)
        self.assertFalse(settings.public_albums_enabled)

    def test_launch_date_accepts_iso_date_and_ignores_invalid_value(self):
        module = load_settings_module()

        valid = module.load_public_site_settings({"SITE_LAUNCH_DATE": "2026-08-01"})
        invalid = module.load_public_site_settings({"SITE_LAUNCH_DATE": "not-a-date"})

        self.assertEqual(valid.site_launch_date.isoformat(), "2026-08-01")
        self.assertIsNone(invalid.site_launch_date)


class PublicSiteConfigEndpointTests(unittest.TestCase):
    def test_endpoint_is_public_typed_and_does_not_expose_sensitive_settings(self):
        try:
            app = importlib.import_module("app.main").app
        except ModuleNotFoundError as error:
            self.fail(f"public site route is missing: {error}")

        with TestClient(app) as client:
            response = client.get("/api/site/public-config")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "contentVisibility": {
                    "posts": False,
                    "chatters": False,
                    "albums": False,
                },
                "siteStats": {"launchDateConfigured": False},
            },
        )
        serialized = response.text.lower()
        for forbidden in (
            "allowlist",
            "namespace",
            "environment",
            "admin",
            "database",
            "secret",
        ):
            self.assertNotIn(forbidden, serialized)


if __name__ == "__main__":
    unittest.main()
