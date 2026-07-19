import sys
from pathlib import Path
from typing import Callable, Optional, Sequence

from sqlmodel import Session

from app.database import engine
from app.services.post_import_service import DraftImportError, import_markdown_draft


OutputFunction = Callable[[str], None]


def run_import(
    session: Session,
    path: Path,
    output_fn: OutputFunction = print,
) -> int:
    try:
        result = import_markdown_draft(session, path)
    except DraftImportError as error:
        output_fn(f"导入失败：{error}")
        return 1

    output_fn(
        f"导入成功\n操作：{result.action}\n文章 ID：{result.post_id}\nslug：{result.slug}"
    )
    return 0


def main(
    argv: Optional[Sequence[str]] = None,
    output_fn: OutputFunction = print,
) -> int:
    arguments = list(sys.argv[1:] if argv is None else argv)
    if len(arguments) != 1:
        output_fn("错误：请仅提供一个 Markdown 文件路径")
        return 2

    with Session(engine) as session:
        return run_import(session, Path(arguments[0]), output_fn=output_fn)


if __name__ == "__main__":
    raise SystemExit(main())
