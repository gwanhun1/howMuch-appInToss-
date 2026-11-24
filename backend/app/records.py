from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import Record, User
from .schemas import RecordCreate, RecordView, Totals


def lock_owner(db: Session, owner_id: UUID, *, read_only: bool = False) -> None:
    # SELECT ... FOR UPDATE는 커밋까지 이 사용자 행을 잠근다.
    # 같은 사용자의 두 쓰기가 동시에 레코드나 합계를 갱신하지 않게 한다.
    owner = db.scalar(select(User.id).where(User.id == owner_id).with_for_update(read=read_only))
    if owner is None:
        raise HTTPException(401, "사용자를 찾을 수 없습니다.")


# SQLAlchemy가 읽은 DB 행을 HTTP 응답 객체로 바꾼다. 날짜가 없으면 기존 화면처럼 빈 문자열을 준다.
def serialize(record: Record) -> RecordView:
    return RecordView(
        id=record.id, name=record.name, relation=record.relation,
        profile_icon=record.profile_icon, type=record.type, mode=record.mode,
        amount=record.amount, date=record.event_date.isoformat() if record.event_date else "",
        is_favorite=record.is_favorite, created_at=record.created_at,
    )


def totals(db: Session, owner_id: UUID) -> Totals:
    # JS 배열을 전체 다운로드해 reduce하는 대신 SQL에서 방향별로 SUM을 계산한다.
    # 한 쿼리에서 각각의 방향만 더한다. COALESCE는 결과가 NULL이면 0을 준다.
    paid, received = db.execute(select(
        func.coalesce(func.sum(Record.amount).filter(Record.mode == "paid"), 0),
        func.coalesce(func.sum(Record.amount).filter(Record.mode == "received"), 0),
    ).where(Record.owner_id == owner_id)).one()
    return Totals(total_paid=paid, total_received=received)


# 이 함수는 commit하지 않는다. 호출자가 여러 건의 저장 결과를 하나의 트랜잭션으로 확정한다.
def insert_records(db: Session, owner_id: UUID, inputs: list[RecordCreate]) -> list[Record]:
    lock_owner(db, owner_id)
    # JS에서 배열을 Map으로 만드는 것처럼, 이미 저장된 기록을 ID별 딕셔너리로 만든다.
    existing = {
        row.id: row
        for row in db.scalars(select(Record).where(
            Record.owner_id == owner_id, Record.id.in_([item.id for item in inputs]),
        ))
    }

    saved = []
    for item in inputs:
        # model_dump()는 검증된 요청을 일반 딕셔너리로 바꾼다. 같은 ID·같은 내용의 요청은 재사용한다.
        values = item.model_dump()
        record = existing.get(item.id)
        if record is None:
            record = Record(owner_id=owner_id, **values)
            db.add(record)
        elif any(getattr(record, field) != value for field, value in values.items()):
            raise HTTPException(409, "이 ID에 다른 내용의 기록이 이미 있습니다.")
        saved.append(record)

    # flush는 INSERT를 전송해 작성 시각을 얻지만, 성공 확정은 라우트의 commit에서 한다.
    # 중간에 409가 발생하면 요청 종료 시 Session이 미커밋 작업을 롤백한다.
    db.flush()
    return saved
