import importlib
import os
import unittest

from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine


os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["DATABASE_URL"] = "postgresql://phase3:phase3@127.0.0.1:1/phase3"
os.environ["SECRET_KEY"] = "phase3-content-visibility-test-key"
os.environ["AUTO_CREATE_TABLES"] = "false"
os.environ.pop("PUBLIC_POSTS_ENABLED", None)
os.environ.pop("PUBLIC_POST_SLUG_ALLOWLIST", None)
os.environ.pop("PUBLIC_CHATTERS_ENABLED", None)
os.environ.pop("PUBLIC_ALBUMS_ENABLED", None)

from app.deps import get_current_user, get_session  # noqa: E402
from app.main import app  # noqa: E402
from app.models import (  # noqa: E402
    Album,
    Category,
    Chatter,
    Comment,
    Photo,
    Post,
    PostTag,
    Tag,
)
from app.public_site import PublicSiteSettings  # noqa: E402


def settings(
    *,
    posts: bool = False,
    allowlist: tuple[str, ...] = (),
    chatters: bool = False,
    albums: bool = False,
) -> PublicSiteSettings:
    return PublicSiteSettings(
        public_posts_enabled=posts,
        public_post_slug_allowlist=allowlist,
        public_chatters_enabled=chatters,
        public_albums_enabled=albums,
        public_stats_namespace="test-v1",
        site_launch_date=None,
    )


def visibility_module():
    try:
        return importlib.import_module("app.content_visibility")
    except ModuleNotFoundError as error:
        raise AssertionError("app.content_visibility module is missing") from error


def find_route(path: str, method: str):
    return next(
        route
        for route in app.routes
        if getattr(route, "path", None) == path
        and method in getattr(route, "methods", set())
    )


def route_depends_on(route, dependency) -> bool:
    return any(item.call is dependency for item in route.dependant.dependencies)


class PostVisibilityRuleTests(unittest.TestCase):
    def test_post_visibility_matrix(self):
        module = visibility_module()
        published = Post(title="Published", slug="published", status="published")
        draft = Post(title="Draft", slug="draft", status="draft")

        cases = (
            (published, settings(posts=True), True),
            (draft, settings(posts=True), False),
            (published, settings(allowlist=("published",)), True),
            (draft, settings(allowlist=("draft",)), False),
            (published, settings(), False),
        )

        for post, site_settings, expected in cases:
            with self.subTest(post=post.slug, expected=expected):
                self.assertEqual(
                    module.is_post_public(post, site_settings), expected
                )


class PublicContentEndpointTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        SQLModel.metadata.create_all(self.engine)

        with Session(self.engine) as session:
            public_category = Category(name="Public", slug="public", post_count=2)
            hidden_category = Category(name="Hidden", slug="hidden", post_count=1)
            public_tag = Tag(name="Visible", slug="visible", post_count=2)
            hidden_tag = Tag(name="Hidden", slug="hidden", post_count=1)
            session.add(public_category)
            session.add(hidden_category)
            session.add(public_tag)
            session.add(hidden_tag)
            session.flush()

            published = Post(
                title="Published",
                slug="published",
                status="published",
                category_id=public_category.id,
            )
            allowed = Post(
                title="Allowed",
                slug="allowed",
                status="published",
                category_id=public_category.id,
            )
            draft = Post(
                title="Draft",
                slug="draft",
                status="draft",
                category_id=hidden_category.id,
            )
            session.add(published)
            session.add(allowed)
            session.add(draft)
            session.flush()
            session.add(PostTag(post_id=published.id, tag_id=public_tag.id))
            session.add(PostTag(post_id=allowed.id, tag_id=public_tag.id))
            session.add(PostTag(post_id=draft.id, tag_id=hidden_tag.id))
            comment = Comment(post_id=published.id, content="Historical comment")
            session.add(comment)

            chatter = Chatter(content="Historical chatter", status="published")
            album = Album(title="Historical album", photo_count=1)
            session.add(chatter)
            session.add(album)
            session.flush()
            session.add(Photo(album_id=album.id, url="/historical.jpg"))
            session.commit()

            self.post_ids = {
                "published": published.id,
                "allowed": allowed.id,
                "draft": draft.id,
            }
            self.chatter_id = chatter.id
            self.album_id = album.id
            self.comment_id = comment.id

        def override_session():
            with Session(self.engine) as session:
                yield session

        app.dependency_overrides[get_session] = override_session
        app.dependency_overrides[get_current_user] = lambda: {
            "sub": "test-admin",
            "admin": True,
        }
        self.set_public_settings(settings())
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()
        app.dependency_overrides.clear()
        SQLModel.metadata.drop_all(self.engine)
        self.engine.dispose()

    def set_public_settings(self, site_settings: PublicSiteSettings):
        module = importlib.import_module("app.public_site")
        provider = getattr(module, "get_public_site_settings", None)
        if provider is None:
            raise AssertionError("get_public_site_settings dependency is missing")
        app.dependency_overrides[provider] = lambda: site_settings

    def test_posts_are_empty_by_default_and_query_cannot_bypass_visibility(self):
        for path in (
            "/api/posts",
            "/api/posts?status=published",
            "/api/posts?status=draft",
            "/api/posts?category=public",
            "/api/posts?tag=visible",
        ):
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json(), [])

        self.assertEqual(self.client.get("/api/posts/count").json(), {"count": 0})
        self.assertEqual(self.client.get("/api/posts/published").status_code, 404)
        self.assertEqual(self.client.get("/api/posts/allowed").status_code, 404)

    def test_allowlist_exposes_only_matching_published_post(self):
        self.set_public_settings(settings(allowlist=("allowed", "draft")))

        response = self.client.get("/api/posts")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([post["slug"] for post in response.json()], ["allowed"])
        self.assertEqual(self.client.get("/api/posts/count").json(), {"count": 1})
        self.assertEqual(self.client.get("/api/posts/allowed").status_code, 200)
        self.assertEqual(self.client.get("/api/posts/draft").status_code, 404)

    def test_enabled_posts_expose_published_but_never_drafts(self):
        self.set_public_settings(settings(posts=True))

        response = self.client.get("/api/posts")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            {post["slug"] for post in response.json()}, {"published", "allowed"}
        )
        self.assertEqual(self.client.get("/api/posts/draft").status_code, 404)

    def test_categories_and_tags_only_report_public_post_counts(self):
        self.set_public_settings(settings(allowlist=("allowed",)))

        categories = self.client.get("/api/categories").json()
        tags = self.client.get("/api/tags").json()

        self.assertEqual(
            [(item["slug"], item["post_count"]) for item in categories],
            [("public", 1)],
        )
        self.assertEqual(
            [(item["slug"], item["post_count"]) for item in tags],
            [("visible", 1)],
        )

    def test_disabled_chatters_have_no_public_read_or_interaction_surface(self):
        paths = (
            "/api/chatters",
            "/api/chatters/count",
            f"/api/chatters/{self.chatter_id}",
            f"/api/chatters/{self.chatter_id}/comments",
        )
        expected = ([], {"count": 0}, None, None)

        for path, body in zip(paths, expected):
            with self.subTest(path=path):
                response = self.client.get(path)
                if body is None:
                    self.assertEqual(response.status_code, 404)
                else:
                    self.assertEqual(response.status_code, 200)
                    self.assertEqual(response.json(), body)

        self.assertEqual(
            self.client.post(f"/api/chatters/{self.chatter_id}/like").status_code,
            404,
        )
        self.assertEqual(
            self.client.post(
                "/api/chatters/comments",
                json={"chatter_id": self.chatter_id, "content": "probe"},
            ).status_code,
            404,
        )

    def test_enabled_chatters_return_published_content(self):
        self.set_public_settings(settings(chatters=True))

        response = self.client.get("/api/chatters")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()], [self.chatter_id])
        self.assertEqual(
            self.client.get(f"/api/chatters/{self.chatter_id}").status_code, 200
        )

    def test_disabled_albums_have_no_public_read_surface(self):
        self.assertEqual(self.client.get("/api/albums").json(), [])
        self.assertEqual(
            self.client.get(f"/api/albums/{self.album_id}").status_code, 404
        )
        self.assertEqual(
            self.client.get(f"/api/albums/{self.album_id}/photos").status_code,
            404,
        )

    def test_enabled_albums_return_existing_content(self):
        self.set_public_settings(settings(albums=True))

        self.assertEqual(len(self.client.get("/api/albums").json()), 1)
        self.assertEqual(
            self.client.get(f"/api/albums/{self.album_id}").status_code, 200
        )
        self.assertEqual(
            len(self.client.get(f"/api/albums/{self.album_id}/photos").json()),
            1,
        )

    def test_non_public_post_cannot_be_liked_by_id(self):
        response = self.client.post(
            f"/api/posts/{self.post_ids['published']}/like"
        )
        self.assertEqual(response.status_code, 404)

    def test_non_public_post_comments_cannot_be_read_created_or_liked(self):
        self.assertEqual(
            self.client.get(
                f"/api/comments/post/{self.post_ids['published']}"
            ).status_code,
            404,
        )
        self.assertEqual(
            self.client.post(
                "/api/comments",
                json={
                    "post_id": self.post_ids["published"],
                    "content": "probe",
                },
            ).status_code,
            404,
        )
        self.assertEqual(
            self.client.post(f"/api/comments/{self.comment_id}/like").status_code,
            404,
        )

    def test_public_post_comments_remain_available(self):
        self.set_public_settings(settings(posts=True))

        response = self.client.get(
            f"/api/comments/post/{self.post_ids['published']}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()], [self.comment_id])

    def test_admin_read_endpoints_keep_historical_content_available(self):
        checks = (
            ("/api/posts/admin", 3),
            ("/api/categories/admin", 2),
            ("/api/tags/admin", 2),
            ("/api/chatters/admin", 1),
            ("/api/albums/admin", 1),
        )
        for path, count in checks:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(len(response.json()), count)

        self.assertEqual(
            self.client.get(
                f"/api/posts/admin/detail/{self.post_ids['draft']}"
            ).status_code,
            200,
        )
        self.assertEqual(
            self.client.get(f"/api/chatters/admin/{self.chatter_id}").status_code,
            200,
        )
        self.assertEqual(
            self.client.get(f"/api/albums/admin/{self.album_id}").status_code,
            200,
        )
        self.assertEqual(
            self.client.get(
                f"/api/albums/admin/{self.album_id}/photos"
            ).status_code,
            200,
        )


class PublicContentManagementAuthTests(unittest.TestCase):
    def setUp(self):
        app.dependency_overrides.clear()

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_admin_read_routes_require_admin_dependency(self):
        protected_routes = (
            ("/api/posts/admin", "GET"),
            ("/api/posts/admin/count", "GET"),
            ("/api/posts/admin/detail/{post_id}", "GET"),
            ("/api/posts/admin/slug/{slug}", "GET"),
            ("/api/categories/admin", "GET"),
            ("/api/tags/admin", "GET"),
            ("/api/chatters/admin", "GET"),
            ("/api/chatters/admin/{chatter_id}", "GET"),
            ("/api/albums/admin", "GET"),
            ("/api/albums/admin/{album_id}", "GET"),
            ("/api/albums/admin/{album_id}/photos", "GET"),
        )

        for path, method in protected_routes:
            with self.subTest(path=path):
                self.assertTrue(
                    route_depends_on(find_route(path, method), get_current_user)
                )

    def test_admin_read_routes_return_401_without_token(self):
        paths = (
            "/api/posts/admin",
            "/api/posts/admin/count",
            "/api/posts/admin/detail/1",
            "/api/posts/admin/slug/example",
            "/api/categories/admin",
            "/api/tags/admin",
            "/api/chatters/admin",
            "/api/chatters/admin/1",
            "/api/albums/admin",
            "/api/albums/admin/1",
            "/api/albums/admin/1/photos",
        )

        with TestClient(app) as client:
            for path in paths:
                with self.subTest(path=path):
                    self.assertEqual(client.get(path).status_code, 401)


if __name__ == "__main__":
    unittest.main()
