from __future__ import annotations

import os
import unittest
from datetime import date

from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine, select


os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["DATABASE_URL"] = "postgresql://phase3:phase3@127.0.0.1:1/phase3"
os.environ["SECRET_KEY"] = "phase3-public-statistics-test-key"
os.environ["AUTO_CREATE_TABLES"] = "false"

from app.deps import get_session  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Visitor  # noqa: E402
from app.public_site import (  # noqa: E402
    PublicSiteSettings,
    get_public_site_settings,
    load_public_site_settings,
)


def settings(
    namespace: str = "kirameku-wan-v1", launch_date: date | None = None
) -> PublicSiteSettings:
    return PublicSiteSettings(
        public_posts_enabled=False,
        public_post_slug_allowlist=(),
        public_chatters_enabled=False,
        public_albums_enabled=False,
        public_stats_namespace=namespace,
        site_launch_date=launch_date,
    )


class PublicSiteStatisticsTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        SQLModel.metadata.create_all(self.engine)
        with Session(self.engine) as session:
            session.add(Visitor(ip="198.51.100.10", path="/legacy"))
            session.commit()

        def override_session():
            with Session(self.engine) as session:
                yield session

        app.dependency_overrides[get_session] = override_session
        self.set_settings(settings())
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()
        app.dependency_overrides.clear()
        SQLModel.metadata.drop_all(self.engine)
        self.engine.dispose()

    def set_settings(self, site_settings: PublicSiteSettings):
        app.dependency_overrides[get_public_site_settings] = lambda: site_settings

    def test_new_namespace_starts_at_zero_and_does_not_expose_legacy_count(self):
        response = self.client.get("/api/visitors/count")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "code": 0,
                "count": 0,
                "launchDate": None,
                "runningDays": None,
            },
        )

    def test_old_namespace_value_does_not_affect_current_namespace(self):
        try:
            from app.models import PublicVisitorStat
        except ImportError as error:
            raise AssertionError("PublicVisitorStat model is missing") from error

        with Session(self.engine) as session:
            session.add(PublicVisitorStat(namespace="legacy-v1", count=37))
            session.commit()

        self.assertEqual(self.client.get("/api/visitors/count").json()["count"], 0)

    def test_record_increments_only_current_public_namespace(self):
        try:
            from app.models import PublicVisitorStat
        except ImportError as error:
            raise AssertionError("PublicVisitorStat model is missing") from error

        with Session(self.engine) as session:
            session.add(PublicVisitorStat(namespace="legacy-v1", count=37))
            session.commit()

        response = self.client.post(
            "/api/visitors/record",
            headers={"x-path": "/", "user-agent": "Phase3Test/1.0"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get("/api/visitors/count").json()["count"], 1)

        with Session(self.engine) as session:
            legacy = session.get(PublicVisitorStat, "legacy-v1")
            current = session.get(PublicVisitorStat, "kirameku-wan-v1")
            visitors = session.exec(select(Visitor)).all()

        self.assertEqual(legacy.count, 37)
        self.assertEqual(current.count, 1)
        self.assertEqual(len(visitors), 2)

    def test_valid_launch_date_returns_server_calculated_runtime(self):
        self.set_settings(settings(launch_date=date(2020, 1, 2)))

        body = self.client.get("/api/visitors/count").json()

        self.assertEqual(body["launchDate"], "2020-01-02")
        self.assertIsInstance(body["runningDays"], int)
        self.assertGreaterEqual(body["runningDays"], 0)

    def test_invalid_launch_date_is_treated_as_unconfigured_without_500(self):
        self.set_settings(
            load_public_site_settings({"SITE_LAUNCH_DATE": "not-a-date"})
        )

        response = self.client.get("/api/visitors/count")

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["launchDate"])
        self.assertIsNone(response.json()["runningDays"])

    def test_public_statistics_never_include_content_history_or_namespace(self):
        body = self.client.get("/api/visitors/count").json()

        for forbidden in (
            "namespace",
            "posts",
            "drafts",
            "chatters",
            "albums",
            "categories",
            "tags",
        ):
            self.assertNotIn(forbidden, body)


if __name__ == "__main__":
    unittest.main()
