from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, Index, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


# Prisma 모델처럼 Python 클래스의 속성을 실제 PostgreSQL 열과 연결한다.
class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    username: Mapped[str] = mapped_column(String(80), unique=True)
    password_hash: Mapped[str]
    privacy_accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


# 세션의 owner_id는 users.id를 참조한다. 사용자 삭제 시 세션도 함께 삭제된다.
class LoginSession(Base):
    __tablename__ = "sessions"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


# (owner_id, id)가 한 쌍으로 고유하다. 서로 다른 계정은 같은 기록 ID를 가질 수 있다.
# CHECK 제약은 API 외부에서 SQL로 입력할 때도 금액 범위와 방향 등을 검사한다.
class Record(Base):
    __tablename__ = "records"
    __table_args__ = (
        CheckConstraint("amount BETWEEN 1 AND 100000000", name="record_amount_range"),
        CheckConstraint("mode IN ('paid', 'received')", name="record_mode_valid"),
        CheckConstraint("type IN ('용돈', '축의금', '조의금', '돌잔치')", name="record_type_valid"),
        Index("ix_records_owner_event_date", "owner_id", "event_date"),
    )

    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    relation: Mapped[str] = mapped_column(String(50))
    profile_icon: Mapped[str] = mapped_column(String(80))
    type: Mapped[str | None] = mapped_column(String(20))
    mode: Mapped[str] = mapped_column(String(8))
    amount: Mapped[int]
    event_date: Mapped[date | None]
    is_favorite: Mapped[bool]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# 원본 기록에서 만든 결과 테이블이다. 사용자·월·분류·방향당 집계 행 하나를 저장한다.
class MonthlyStats(Base):
    __tablename__ = "monthly_record_stats"

    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    month: Mapped[date] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String(20), primary_key=True)
    mode: Mapped[str] = mapped_column(String(8), primary_key=True)
    record_count: Mapped[int]
    amount: Mapped[int] = mapped_column(BigInteger)


# 집계 행이 0개인 경우에도 마지막 성공 시각과 날짜 미입력 건수를 알려준다.
class StatsRefresh(Base):
    __tablename__ = "stats_refresh_state"

    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    refreshed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    undated_count: Mapped[int]
