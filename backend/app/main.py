from uuid import UUID

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from . import records, stats
from .auth import Db, Owner, delete_account, login, logout, register, verify_origin
from .models import Record
from .schemas import BatchCreate, Bootstrap, MonthlyReport, RecordCreate, RecordDeleted, RecordPatch, RecordsWritten

# 이 파일이 요청의 출발점이다. Express의 app과 Router에 해당하는 객체를 만든다.
app = FastAPI(title="얼마냈지 API")
api = APIRouter(prefix="/api/v1")
origin_required = [Depends(verify_origin)]


# 모든 요청에 공통으로 적용되는 미들웨어다. await call_next는 다음 처리기로 요청을 넘긴다.
@app.middleware("http")
async def disable_api_cache(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response


@app.exception_handler(RequestValidationError)
async def validation_error(_request: Request, error: RequestValidationError):
    # 로그인 비밀번호나 기록 내용이 422 응답에 그대로 되돌아가지 않게 한다.
    return JSONResponse(status_code=422, content={"detail": [
        {"loc": item["loc"], "msg": item["msg"], "type": item["type"]}
        for item in error.errors()
    ]})


# healthz는 프로세스가 살아 있는지, readyz는 DB에도 연결할 수 있는지 확인한다.
@app.get("/healthz")
def health():
    return {"status": "ok"}


@app.get("/readyz")
def readiness(db: Db):
    try:
        db.execute(select(1))
    except SQLAlchemyError as error:
        raise HTTPException(503, "DB 연결 준비 중입니다.") from error
    return {"status": "ready"}


# Express에서 router.post("/session", login)을 등록하는 것과 같다. 204는 응답 본문이 없다는 뜻이다.
api.add_api_route("/session", login, methods=["POST"], status_code=204,
                  response_class=Response, dependencies=origin_required)
api.add_api_route("/session", logout, methods=["DELETE"], status_code=204,
                  response_class=Response, dependencies=origin_required)


# 화면 첫 로딩에 필요한 사용자, 기초 목록, 합계를 한 번에 보낸다.
# 목록과 합계 사이에 다른 요청이 기록을 변경하지 못하도록 읽기 잠금을 사용한다.
api.add_api_route("/accounts", register, methods=["POST"], status_code=204,
                  response_class=Response, dependencies=origin_required)
api.add_api_route("/accounts/me", delete_account, methods=["DELETE"], status_code=204,
                  response_class=Response, dependencies=origin_required)


@api.get("/bootstrap")
def bootstrap(db: Db, owner_id: Owner) -> Bootstrap:
    # Depends는 Express 미들웨어처럼 라우트 실행 전에 DB 세션과 로그인 사용자를 준비한다.
    records.lock_owner(db, owner_id, read_only=True)
    rows = db.scalars(select(Record).where(Record.owner_id == owner_id).order_by(
        Record.created_at.desc(), Record.id,
    ))
    return Bootstrap(
        user_id=owner_id, records=[records.serialize(row) for row in rows],
        **records.totals(db, owner_id).model_dump(),
    )


# 단건 저장과 빠른 장부가 공유하는 함수다.
# 저장 → SQL 합계 계산 → commit 순서로 실행하고, commit이 끝난 뒤 결과를 반환한다.
# **dict는 JS의 ...object처럼 딕셔너리의 키와 값을 인자로 펼친다.
def save(db: Db, owner_id: UUID, inputs: list[RecordCreate]) -> RecordsWritten:
    saved = records.insert_records(db, owner_id, inputs)
    result = RecordsWritten(
        records=[records.serialize(row) for row in saved],
        **records.totals(db, owner_id).model_dump(),
    )
    db.commit()
    return result


# @api.post는 아래 함수를 POST 요청의 처리기로 등록한다.
# data는 req.body를 검증한 값이고, db와 owner_id는 FastAPI가 준비해 준다.
# -> RecordsWritten은 함수의 반환 타입이다. FastAPI는 이를 응답 모델로도 사용한다.
@api.post("/records", dependencies=origin_required)
def create_record(data: RecordCreate, db: Db, owner_id: Owner) -> RecordsWritten:
    return save(db, owner_id, [data])


# 빠른 장부는 여러 기록을 한 번에 넘긴다. 단건과 같은 저장 함수를 한 번 호출한다.
@api.post("/records/batch", dependencies=origin_required)
def create_batch(data: BatchCreate, db: Db, owner_id: Owner) -> RecordsWritten:
    return save(db, owner_id, data.records)


# 경로의 record_id와 로그인한 owner_id를 함께 사용해 수정 대상을 찾는다.
# exclude_unset=True로 사용자가 보낸 필드만 남겨, 보낸 값만 기존 기록에 덮어쓴다.
@api.patch("/records/{record_id}", dependencies=origin_required)
def patch_record(record_id: UUID, data: RecordPatch, db: Db, owner_id: Owner) -> RecordsWritten:
    records.lock_owner(db, owner_id)
    record = db.get(Record, (owner_id, record_id))
    if record is None:
        raise HTTPException(404, "기록을 찾을 수 없습니다.")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    result = RecordsWritten(
        records=[records.serialize(record)], **records.totals(db, owner_id).model_dump(),
    )
    db.commit()
    return result


# 이미 지운 ID로 다시 요청하면 deleted=false를 반환한다. 합계는 현재 DB 기준이다.
@api.delete("/records/{record_id}", dependencies=origin_required)
def delete_record(record_id: UUID, db: Db, owner_id: Owner) -> RecordDeleted:
    records.lock_owner(db, owner_id)
    record = db.get(Record, (owner_id, record_id))
    if record is not None:
        db.delete(record)
    result = RecordDeleted(deleted=record is not None, **records.totals(db, owner_id).model_dump())
    db.commit()
    return result


# 이 API는 배치를 실행하지 않는다. 마지막으로 성공한 배치의 결과를 읽는다.
@api.get("/stats/monthly")
def monthly(db: Db, owner_id: Owner) -> MonthlyReport:
    return stats.report(db, owner_id)


app.include_router(api)
