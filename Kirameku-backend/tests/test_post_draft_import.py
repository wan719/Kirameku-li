import importlib
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine, select


os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["DATABASE_URL"] = "postgresql://phase3:phase3@127.0.0.1:1/phase3"
os.environ["SECRET_KEY"] = "phase3-post-import-test-key"
os.environ["AUTO_CREATE_TABLES"] = "false"

from app.models import Category, Post, PostTag, Tag  # noqa: E402


def load_importer():
    try:
        return importlib.import_module("app.services.post_import_service")
    except ModuleNotFoundError as error:
        raise AssertionError("app.services.post_import_service is missing") from error


def load_command():
    try:
        return importlib.import_module("app.scripts.import_post_draft")
    except ModuleNotFoundError as error:
        raise AssertionError("app.scripts.import_post_draft is missing") from error


class PostDraftImportTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        SQLModel.metadata.create_all(self.engine)
        self.session = Session(self.engine)
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)

    def tearDown(self):
        self.session.close()
        SQLModel.metadata.drop_all(self.engine)
        self.engine.dispose()

    def write_note(self, front_matter: str, body: str) -> Path:
        path = Path(self.temp_dir.name) / "synthetic-note.md"
        path.write_text(
            f"---\n{front_matter.strip()}\n---\n\n{body}",
            encoding="utf-8",
        )
        return path

    def test_missing_file_fails_without_exposing_path(self):
        importer = load_importer()
        missing = Path(self.temp_dir.name) / "private-location" / "missing.md"

        with self.assertRaises(importer.DraftImportError) as raised:
            importer.import_markdown_draft(self.session, missing)

        self.assertNotIn(str(missing), str(raised.exception))
        self.assertEqual(self.session.exec(select(Post)).all(), [])

    def test_invalid_front_matter_fails_without_writing(self):
        importer = load_importer()
        path = self.write_note("slug: [not-valid", "# Synthetic title")

        with self.assertRaises(importer.DraftImportError):
            importer.import_markdown_draft(self.session, path)

        self.assertEqual(self.session.exec(select(Post)).all(), [])

    def test_missing_slug_fails(self):
        importer = load_importer()
        path = self.write_note("title: Synthetic title", "Synthetic body")

        with self.assertRaises(importer.DraftImportError):
            importer.import_markdown_draft(self.session, path)

        self.assertEqual(self.session.exec(select(Post)).all(), [])

    def test_missing_title_and_h1_fails(self):
        importer = load_importer()
        path = self.write_note("slug: synthetic-workflow", "Body without heading.")

        with self.assertRaises(importer.DraftImportError):
            importer.import_markdown_draft(self.session, path)

        self.assertEqual(self.session.exec(select(Post)).all(), [])

    def test_title_falls_back_to_first_h1(self):
        importer = load_importer()
        path = self.write_note(
            "slug: synthetic-workflow",
            "Intro paragraph.\n\n# Synthetic workflow\n\nBody.",
        )

        result = importer.import_markdown_draft(self.session, path)
        post = self.session.get(Post, result.post_id)

        self.assertEqual(post.title, "Synthetic workflow")
        self.assertEqual(post.status, "draft")

    def test_first_import_creates_draft_with_metadata(self):
        importer = load_importer()
        path = self.write_note(
            """
title: Synthetic workflow
slug: synthetic-workflow
summary: A fabricated summary for automated tests.
category: Methods
tags:
  - Notes
  - Automation
""",
            "# Synthetic workflow\n\nFabricated body marker.",
        )

        result = importer.import_markdown_draft(self.session, path)
        post = self.session.get(Post, result.post_id)
        category = self.session.get(Category, post.category_id)
        links = self.session.exec(
            select(PostTag).where(PostTag.post_id == post.id)
        ).all()
        tags = {self.session.get(Tag, link.tag_id).name for link in links}

        self.assertEqual(result.action, "created")
        self.assertEqual(post.slug, "synthetic-workflow")
        self.assertEqual(post.description, "A fabricated summary for automated tests.")
        self.assertEqual(post.status, "draft")
        self.assertIsNone(post.published_at)
        self.assertEqual(category.name, "Methods")
        self.assertEqual(tags, {"Notes", "Automation"})

    def test_reimport_updates_same_draft_without_duplicate(self):
        importer = load_importer()
        path = self.write_note(
            "title: First title\nslug: synthetic-workflow\ntags: [First]",
            "First fabricated body.",
        )
        first = importer.import_markdown_draft(self.session, path)
        path = self.write_note(
            "title: Updated title\nslug: synthetic-workflow\ntags: [Second]",
            "Updated fabricated body.",
        )

        second = importer.import_markdown_draft(self.session, path)
        posts = self.session.exec(select(Post)).all()

        self.assertEqual(second.action, "updated")
        self.assertEqual(second.post_id, first.post_id)
        self.assertEqual(len(posts), 1)
        self.assertEqual(posts[0].title, "Updated title")
        self.assertEqual(posts[0].content.strip(), "Updated fabricated body.")

    def test_published_post_is_never_overwritten(self):
        importer = load_importer()
        published = Post(
            title="Published title",
            slug="synthetic-workflow",
            content="Published body must remain unchanged.",
            status="published",
        )
        self.session.add(published)
        self.session.commit()
        path = self.write_note(
            "title: Replacement\nslug: synthetic-workflow",
            "Replacement body.",
        )

        with self.assertRaises(importer.DraftImportError):
            importer.import_markdown_draft(self.session, path)

        self.session.refresh(published)
        self.assertEqual(published.title, "Published title")
        self.assertEqual(published.content, "Published body must remain unchanged.")
        self.assertEqual(published.status, "published")

    def test_database_failure_rolls_back_all_rows(self):
        importer = load_importer()
        path = self.write_note(
            "title: Synthetic title\nslug: synthetic-workflow\ncategory: Methods\ntags: [Notes]",
            "Fabricated body.",
        )

        with patch.object(
            self.session,
            "commit",
            side_effect=SQLAlchemyError("synthetic database failure"),
        ):
            with self.assertRaises(importer.DraftImportError):
                importer.import_markdown_draft(self.session, path)

        self.assertEqual(self.session.exec(select(Post)).all(), [])
        self.assertEqual(self.session.exec(select(Category)).all(), [])
        self.assertEqual(self.session.exec(select(Tag)).all(), [])
        self.assertEqual(self.session.exec(select(PostTag)).all(), [])

    def test_command_output_contains_only_safe_result_summary(self):
        command = load_command()
        body = "Fabricated private body marker that must not be printed."
        path = self.write_note(
            "title: Synthetic title\nslug: synthetic-workflow",
            body,
        )
        output = []

        result = command.run_import(self.session, path, output_fn=output.append)

        text = "\n".join(output)
        self.assertEqual(result, 0)
        self.assertIn("synthetic-workflow", text)
        self.assertIn("created", text)
        self.assertNotIn(body, text)
        self.assertNotIn(str(path), text)

    def test_command_rejects_wrong_argument_count_without_echoing_paths(self):
        command = load_command()
        private_path = str(Path(self.temp_dir.name) / "private-note.md")
        output = []

        result = command.main(
            [private_path, "second-path.md"],
            output_fn=output.append,
        )

        self.assertEqual(result, 2)
        self.assertNotIn(private_path, "\n".join(output))

    def test_import_does_not_publish_or_change_public_allowlist(self):
        importer = load_importer()
        path = self.write_note(
            "title: Synthetic title\nslug: synthetic-workflow",
            "Fabricated body.",
        )

        with patch.dict(
            os.environ,
            {"PUBLIC_POST_SLUG_ALLOWLIST": "existing-public-slug"},
            clear=False,
        ):
            result = importer.import_markdown_draft(self.session, path)
            post = self.session.get(Post, result.post_id)
            self.assertEqual(
                os.environ["PUBLIC_POST_SLUG_ALLOWLIST"],
                "existing-public-slug",
            )

        self.assertEqual(post.status, "draft")
        self.assertIsNone(post.published_at)


if __name__ == "__main__":
    unittest.main()
