from collections import defaultdict
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .models import MonthlyStats, Record, StatsRefresh
from .records import lock_owner
from .schemas import MonthlyReport, MonthlyRow

UNCATEGORIZED = "미분류"


# CLI에서 호출하는 배치 진입점이다. 결과는 (통계 그룹 수, 날짜 미입력 건수) 순서로 돌려준다.
def refresh(db: Session, owner_id: UUID) -> tuple[int, int]:
    # with db.begin()은 블록이 성공하면 commit, 예외가 나면 rollback 한다.
    with db.begin():
        # CRUD와 같은 사용자 잠금을 공유한다. 집계 중에는 같은 사용자의 기록이 바뀌지 않는다.
        lock_owner(db, owner_id)

        # Extract: 이름이나 관계는 필요 없으므로 집계에 쓰는 열만 읽는다.
        source = db.execute(select(
            Record.event_date, Record.type, Record.mode, Record.amount,
        ).where(Record.owner_id == owner_id))

        # Transform: JS Map처럼 복합 키로 그룹핑한다. 날짜가 없으면 별도로 센다.
        # defaultdict(int)는 처음 보는 키의 값을 0으로 만들어 JS의 (map.get(key) ?? 0)처럼 쓸 수 있다.
        amounts = defaultdict(int)
        counts = defaultdict(int)
        undated_count = 0
        for event_date, category, mode, amount in source:
            if event_date is None:
                undated_count += 1
                continue
            # 날짜를 그 달의 1일로 통일한다. 튜플을 키로 써 같은 월·유형·방향을 합친다.
            key = (event_date.replace(day=1), category or UNCATEGORIZED, mode)
            amounts[key] += amount
            counts[key] += 1

        # Load: 이전 결과를 한 트랜잭션에서 교체해 삭제된 달의 통계도 사라진다.
        db.execute(delete(MonthlyStats).where(MonthlyStats.owner_id == owner_id))
        db.add_all([
            MonthlyStats(
                owner_id=owner_id, month=month, category=category, mode=mode,
                record_count=counts[(month, category, mode)], amount=amount,
            )
            for (month, category, mode), amount in amounts.items()
        ])
        # 성공 시각과 집계 결과는 같은 트랜잭션에 있다. 두 값이 함께 반영되거나 함께 취소된다.
        db.merge(StatsRefresh(
            owner_id=owner_id, refreshed_at=datetime.now(UTC), undated_count=undated_count,
        ))
    return len(amounts), undated_count


# 배치 결과와 배치 상태를 함께 읽는다. 배치 실행 전에는 갱신 시각이 null이다.
def report(db: Session, owner_id: UUID) -> MonthlyReport:
    lock_owner(db, owner_id, read_only=True)
    state = db.get(StatsRefresh, owner_id)
    rows = db.scalars(select(MonthlyStats).where(MonthlyStats.owner_id == owner_id).order_by(
        MonthlyStats.month, MonthlyStats.category, MonthlyStats.mode,
    ))
    return MonthlyReport(
        refreshed_at=state.refreshed_at if state else None,
        undated_count=state.undated_count if state else 0,
        rows=[
            MonthlyRow(
                month=row.month, category=None if row.category == UNCATEGORIZED else row.category,
                mode=row.mode, record_count=row.record_count, amount=row.amount,
            )
            for row in rows
        ],
    )
