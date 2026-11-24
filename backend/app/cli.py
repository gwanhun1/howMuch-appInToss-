import argparse
import getpass
import logging
from time import monotonic

from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import passwords
from .db import engine
from .models import User
from .stats import refresh

logger = logging.getLogger("howmuch")


# 개발자가 터미널에서 테스트 계정을 만든다. getpass는 비밀번호를 화면에 표시하지 않는다.
def create_user(username: str) -> None:
    username = username.strip()
    if not 1 <= len(username) <= 80:
        raise SystemExit("아이디는 1~80자여야 합니다.")
    password = getpass.getpass("새 비밀번호: ")
    if not 12 <= len(password) <= 256:
        raise SystemExit("비밀번호는 12~256자여야 합니다.")
    with Session(engine) as db, db.begin():
        if db.scalar(select(User.id).where(User.username == username)) is not None:
            raise SystemExit("이미 존재하는 계정입니다.")
        db.add(User(username=username, password_hash=passwords.hash(password)))


# 선택한 계정 또는 전체 계정에 대해 사용자별로 트랜잭션을 열어 통계를 갱신한다.
def refresh_stats(username: str | None) -> None:
    with Session(engine) as db:
        query = select(User.id).order_by(User.id)
        if username is not None:
            query = query.where(User.username == username)
        owners = db.scalars(query).all()
        if username is not None and not owners:
            raise SystemExit("해당 계정을 찾을 수 없습니다.")
    for owner_id in owners:
        start = monotonic()
        with Session(engine) as db:
            groups, undated = refresh(db, owner_id)
        logger.info("통계 갱신 완료 groups=%s undated=%s seconds=%.3f", groups, undated, monotonic() - start)


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description="얼마냈지 운영 명령")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("create-user").add_argument("username")
    commands.add_parser("refresh-stats").add_argument("--username")
    args = parser.parse_args()
    if args.command == "create-user":
        create_user(args.username)
    else:
        refresh_stats(args.username)


# python -m app.cli로 직접 실행한 경우에만 main()을 호출한다. import하면 함수 정의만 읽는다.
if __name__ == "__main__":
    main()
