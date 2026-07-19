from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, func, select

from app.models import User
from app.utils.auth import hash_password


class AdminCreationError(ValueError):
    pass


def create_admin(
    session: Session,
    username: str,
    email: str,
    password: str,
) -> User:
    normalized_username = username.strip()
    normalized_email = email.strip().lower()

    if not normalized_username:
        raise AdminCreationError("用户名不能为空")
    if not normalized_email or "@" not in normalized_email:
        raise AdminCreationError("邮箱格式无效")
    if len(password) < 12:
        raise AdminCreationError("密码至少需要 12 个字符")

    existing_username = session.exec(
        select(User).where(
            func.lower(User.username) == normalized_username.lower()
        )
    ).first()
    if existing_username:
        raise AdminCreationError("用户名已存在")

    existing_email = session.exec(
        select(User).where(func.lower(User.email) == normalized_email)
    ).first()
    if existing_email:
        raise AdminCreationError("邮箱已存在")

    user = User(
        username=normalized_username,
        email=normalized_email,
        nickname=normalized_username,
        hashed_password=hash_password(password),
        is_admin=True,
    )
    session.add(user)
    try:
        session.commit()
        session.refresh(user)
    except SQLAlchemyError:
        session.rollback()
        raise AdminCreationError("管理员创建失败")
    return user
