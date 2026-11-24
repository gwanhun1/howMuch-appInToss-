import os
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session


# os.environ은 Node의 process.env와 비슷하다. DATABASE_URL은 외부 환경에서 주입한다.
def database_url() -> str:
    return os.environ["DATABASE_URL"]


# Engine은 커넥션 풀, Session은 요청 하나에서 사용하는 DB 작업 단위다.
# Node의 공유 Pool에서 요청마다 client를 꺼내고 finally에서 돌려주는 것과 비슷하다.
engine = create_engine(database_url(), pool_pre_ping=True, hide_parameters=True)


# FastAPI가 yield 지점에서 db를 라우트에 전달하고, 요청 처리가 끝나면 with 블록을 닫는다.
# with는 JS의 try/finally처럼 정리를 보장한다. 저장 확정은 각 쓰기 라우트에서 한다.
def get_db() -> Iterator[Session]:
    with Session(engine) as db:
        yield db
