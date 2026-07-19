import getpass
import sys
from typing import Callable, Optional, Sequence

from sqlmodel import Session

from app.database import engine
from app.services.user_service import AdminCreationError, create_admin


InputFunction = Callable[[str], str]
OutputFunction = Callable[[str], None]


def run_interactive(
    session: Session,
    input_fn: InputFunction = input,
    password_fn: Optional[InputFunction] = None,
    output_fn: OutputFunction = print,
) -> int:
    hidden_input = password_fn or getpass.getpass
    username = input_fn("管理员用户名：").strip()
    email = input_fn("管理员邮箱：").strip()
    password = hidden_input("密码（至少 12 个字符）：")
    confirmation = hidden_input("再次输入密码：")

    if password != confirmation:
        output_fn("创建失败：两次输入的密码不一致")
        return 1

    try:
        user = create_admin(session, username, email, password)
    except AdminCreationError as error:
        output_fn(f"创建失败：{error}")
        return 1

    output_fn(
        f"管理员创建成功\n用户名：{user.username}\n邮箱：{user.email}"
    )
    return 0


def main(
    argv: Optional[Sequence[str]] = None,
    output_fn: OutputFunction = print,
) -> int:
    arguments = list(sys.argv[1:] if argv is None else argv)
    if arguments:
        output_fn("错误：此命令不接受命令行参数")
        return 2

    with Session(engine) as session:
        return run_interactive(session, output_fn=output_fn)


if __name__ == "__main__":
    raise SystemExit(main())
