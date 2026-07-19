import importlib
import os
import unittest
from pathlib import Path
from unittest.mock import patch

from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine, select


os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["DATABASE_URL"] = "postgresql://phase3:phase3@127.0.0.1:1/phase3"
os.environ["SECRET_KEY"] = "phase3-admin-bootstrap-test-key"
os.environ["AUTO_CREATE_TABLES"] = "false"

from app.models import User  # noqa: E402
from app.utils.auth import verify_password  # noqa: E402


def load_user_service():
    try:
        return importlib.import_module("app.services.user_service")
    except ModuleNotFoundError as error:
        raise AssertionError("app.services.user_service is missing") from error


def load_command():
    try:
        return importlib.import_module("app.scripts.create_admin")
    except ModuleNotFoundError as error:
        raise AssertionError("app.scripts.create_admin is missing") from error


class AdminBootstrapTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        SQLModel.metadata.create_all(self.engine)
        self.session = Session(self.engine)

    def tearDown(self):
        self.session.close()
        SQLModel.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_init_sql_does_not_seed_default_admin_or_password(self):
        sql = (
            Path(__file__).resolve().parents[1] / "init_db.sql"
        ).read_text(encoding="utf-8")
        lowered = sql.lower()

        self.assertNotIn("insert into \"user\"", lowered)
        self.assertNotIn("admin123", lowered)
        self.assertNotIn("bcrypt hash", lowered)

    def test_service_creates_admin_with_hashed_password(self):
        service = load_user_service()
        password = "LocalOnly!Pass123"

        user = service.create_admin(
            self.session,
            username="site-owner",
            email="owner@example.test",
            password=password,
        )

        self.assertIsNotNone(user.id)
        self.assertTrue(user.is_admin)
        self.assertNotEqual(user.hashed_password, password)
        self.assertTrue(verify_password(password, user.hashed_password))

    def test_duplicate_username_fails_without_creating_another_user(self):
        service = load_user_service()
        service.create_admin(
            self.session,
            username="site-owner",
            email="first@example.test",
            password="LocalOnly!Pass123",
        )

        with self.assertRaises(service.AdminCreationError):
            service.create_admin(
                self.session,
                username="site-owner",
                email="second@example.test",
                password="AnotherLocal!Pass123",
            )

        self.assertEqual(len(self.session.exec(select(User)).all()), 1)

    def test_duplicate_email_fails_without_creating_another_user(self):
        service = load_user_service()
        service.create_admin(
            self.session,
            username="first-owner",
            email="owner@example.test",
            password="LocalOnly!Pass123",
        )

        with self.assertRaises(service.AdminCreationError):
            service.create_admin(
                self.session,
                username="second-owner",
                email="owner@example.test",
                password="AnotherLocal!Pass123",
            )

        self.assertEqual(len(self.session.exec(select(User)).all()), 1)

    def test_password_mismatch_fails_without_writing_or_echoing_password(self):
        command = load_command()
        password = "LocalOnly!Pass123"
        output = []
        answers = iter(("site-owner", "owner@example.test"))
        passwords = iter((password, "DifferentLocal!Pass123"))

        result = command.run_interactive(
            self.session,
            input_fn=lambda _prompt: next(answers),
            password_fn=lambda _prompt: next(passwords),
            output_fn=output.append,
        )

        self.assertEqual(result, 1)
        self.assertEqual(len(self.session.exec(select(User)).all()), 0)
        self.assertNotIn(password, "\n".join(output))

    def test_interactive_success_uses_hidden_input_and_safe_output(self):
        command = load_command()
        password = "LocalOnly!Pass123"
        output = []
        answers = iter(("site-owner", "owner@example.test"))

        with patch.object(
            command.getpass,
            "getpass",
            side_effect=(password, password),
        ) as hidden_input:
            result = command.run_interactive(
                self.session,
                input_fn=lambda _prompt: next(answers),
                output_fn=output.append,
            )

        text = "\n".join(output)
        self.assertEqual(result, 0)
        self.assertEqual(hidden_input.call_count, 2)
        self.assertIn("site-owner", text)
        self.assertIn("owner@example.test", text)
        self.assertNotIn(password, text)

    def test_command_rejects_all_cli_arguments_without_echoing_them(self):
        command = load_command()
        password = "ShouldNeverAppear!123"
        output = []

        result = command.main(
            ["--password", password],
            output_fn=output.append,
        )

        self.assertEqual(result, 2)
        self.assertNotIn(password, "\n".join(output))

    def test_admin_frontend_has_no_default_credentials_or_mock_login(self):
        admin_dir = Path(__file__).resolve().parents[1] / "admin"
        login_view = (admin_dir / "src/views/login/index.vue").read_text(
            encoding="utf-8"
        )
        plugins = (admin_dir / "build/plugins.ts").read_text(encoding="utf-8")
        mock_login = (admin_dir / "mock/login.ts").read_text(encoding="utf-8")

        self.assertIn('username: ""', login_view)
        self.assertIn('password: ""', login_view)
        self.assertIn("enableProd: false", plugins)
        self.assertNotIn("accessToken", mock_login)

        scanned_roots = [admin_dir / "src", admin_dir / "mock", admin_dir / "build"]
        for root in scanned_roots:
            for path in root.rglob("*"):
                if path.is_file() and path.suffix in {".js", ".ts", ".vue"}:
                    self.assertNotIn(
                        "admin123",
                        path.read_text(encoding="utf-8"),
                        f"default password remains in {path.relative_to(admin_dir)}",
                    )


if __name__ == "__main__":
    unittest.main()
