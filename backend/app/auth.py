import hashlib
import os
import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated
from uuid import UUID

from fastapi import Cookie, Depends, HTTPException, Request, Response
from pwdlib import PasswordHash
from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from .db import get_db
from .models import LoginSession, User
from .schemas import AccountDeletion, Credentials, Registration

Db = Annotated[Session, Depends(get_db)]
COOKIE_NAME = "howmuch_session"
SESSION_TTL = timedelta(hours=12)
PUBLIC_ORIGIN = os.environ.get("PUBLIC_ORIGIN", "http://127.0.0.1:8010")
passwords = PasswordHash.recommended()
DUMMY_PASSWORD_HASH = passwords.hash(secrets.token_urlsafe(32))


def verify_origin(request: Request) -> None:
    # 쿠키는 브라우저가 자동 전송한다. 쓰기 API는 허용된 화면에서 온 요청만 받는다.
    if request.headers.get("origin") != PUBLIC_ORIGIN:
        raise HTTPException(403, "허용되지 않은 요청 출처입니다.")


# 로그인 쿠키의 원본 토큰 대신 해시를 DB에 저장하고, 조회할 때는 같은 해시를 계산한다.
def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# Annotated는 타입에 FastAPI용 정보를 덧붙인다. 이 값은 HTTP 쿠키에서 읽는다.
Token = Annotated[str | None, Cookie(alias=COOKIE_NAME)]


# Express 인증 미들웨어처럼 실행된다. 살아 있는 세션을 찾으면 서버가 사용자 ID를 결정한다.
# 이후 API는 사용자가 요청 본문에 적은 ID 대신 이 값을 조회 조건으로 사용한다.
def current_user(db: Db, token: Token = None) -> UUID:
    if token is not None:
        owner_id = db.scalar(
            select(LoginSession.owner_id).where(
                LoginSession.token_hash == hash_token(token),
                LoginSession.expires_at > func.now(),
            )
        )
        if owner_id is not None:
            return owner_id
    raise HTTPException(401, "로그인이 필요합니다.")


Owner = Annotated[UUID, Depends(current_user)]


# 로그인 요청은 DB의 비밀번호 해시를 검증하고 새 세션을 만든다.
def login(data: Credentials, db: Db, response: Response, previous_token: Token = None):
    user = db.scalar(select(User).where(User.username == data.username))
    # 계정이 없는 경우에도 비밀번호 해시 검증 비용을 들인다.
    valid = passwords.verify(data.password, user.password_hash if user else DUMMY_PASSWORD_HASH)
    if not valid or user is None:
        raise HTTPException(401, "아이디 또는 비밀번호를 확인해주세요.")

    # 새 랜덤 토큰을 발급하고, 이번 요청에 이전 쿠키가 있으면 그 세션을 교체한다.
    token = secrets.token_urlsafe(32)
    if previous_token is not None:
        db.execute(delete(LoginSession).where(LoginSession.token_hash == hash_token(previous_token)))
    db.execute(delete(LoginSession).where(LoginSession.expires_at <= func.now()))
    db.add(LoginSession(
        token_hash=hash_token(token),
        owner_id=user.id,
        expires_at=datetime.now(UTC) + SESSION_TTL,
    ))
    db.commit()
    # HttpOnly는 프론트 JS가 쿠키 값을 읽지 못하게 한다. 브라우저가 요청에 자동 첨부한다.
    response.set_cookie(
        COOKIE_NAME, token, httponly=True, secure=PUBLIC_ORIGIN.startswith("https://"),
        samesite="strict", max_age=int(SESSION_TTL.total_seconds()),
    )


# DB 세션을 삭제해 토큰을 무효화하고 브라우저에도 쿠키 삭제를 요청한다.
def logout(db: Db, response: Response, token: Token = None):
    if token is not None:
        db.execute(delete(LoginSession).where(LoginSession.token_hash == hash_token(token)))
        db.commit()
    response.delete_cookie(COOKIE_NAME, secure=PUBLIC_ORIGIN.startswith("https://"), httponly=True, samesite="strict")


# 가입 요청이 겹쳐도 DB의 username UNIQUE 제약이 한 계정만 만든다.
def register(data: Registration, db: Db) -> None:
    user_id = db.scalar(insert(User).values(
        username=data.username,
        password_hash=passwords.hash(data.password),
        privacy_accepted_at=func.now(),
    ).on_conflict_do_nothing(index_elements=[User.username]).returning(User.id))
    if user_id is None:
        raise HTTPException(409, "사용할 수 없는 아이디입니다.")
    db.commit()


# 로그인한 계정의 비밀번호를 다시 확인한다. FK CASCADE로 해당 계정의 데이터만 지운다.
def delete_account(data: AccountDeletion, db: Db, owner_id: Owner, response: Response) -> None:
    user = db.scalar(select(User).where(User.id == owner_id).with_for_update())
    if user is None or not passwords.verify(data.password, user.password_hash):
        raise HTTPException(403, "비밀번호를 확인해주세요.")
    db.delete(user)
    db.commit()
    response.delete_cookie(COOKIE_NAME, secure=PUBLIC_ORIGIN.startswith("https://"), httponly=True, samesite="strict")
