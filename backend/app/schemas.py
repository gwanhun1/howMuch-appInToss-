import re
from datetime import date, datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, StringConstraints, model_validator
from pydantic.alias_generators import to_camel

# Literal은 TS의 "paid" | "received"와 비슷하다. Pydantic은 실제 요청값도 검사한다.
# Field의 strict=True는 JS에서 보낸 "50000"이나 true를 금액 정수로 바꾸지 않게 한다.
Mode = Literal["paid", "received"]
Category = Literal["용돈", "축의금", "조의금", "돌잔치"]
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]
Relation = Annotated[str, StringConstraints(strip_whitespace=True, max_length=50)]
Icon = Annotated[str, StringConstraints(min_length=1, max_length=80)]
Amount = Annotated[int, Field(strict=True, ge=1, le=100_000_000)]


def parse_event_date(value: object) -> date | None:
    # React가 보내는 빈 문자열을 SQL NULL로 바꾼다. 숫자나 타임스탬프는 받지 않는다.
    if value is None or value == "":
        return None
    if not isinstance(value, str) or not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", value):
        raise ValueError("날짜는 YYYY-MM-DD 형식이어야 합니다.")
    return date.fromisoformat(value)


EventDate = Annotated[date | None, BeforeValidator(parse_event_date)]


class ApiModel(BaseModel):
    # Zod 스키마처럼 런타임에 검사한다. Python은 snake_case, HTTP는 camelCase를 쓴다.
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")


class Credentials(ApiModel):
    username: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]
    password: Annotated[str, StringConstraints(min_length=1, max_length=256)]


class Registration(Credentials):
    username: Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^[a-zA-Z0-9_-]{3,40}$")]
    password: Annotated[str, StringConstraints(min_length=12, max_length=256)]
    privacy_consent: Literal[True]

    @model_validator(mode="before")
    @classmethod
    def require_explicit_consent(cls, values):
        if isinstance(values, dict) and values.get("privacyConsent", values.get("privacy_consent")) is not True:
            raise ValueError("개인정보 수집 및 이용에 명시적으로 동의해야 합니다.")
        return values


class AccountDeletion(ApiModel):
    password: Annotated[str, StringConstraints(min_length=1, max_length=256)]


# 생성 요청의 입력 규격이다. id는 프론트에서 만든 UUID이고 createdAt은 서버가 부여한다.
class RecordCreate(ApiModel):
    id: UUID
    name: Name
    relation: Relation
    profile_icon: Icon
    type: Category | None
    mode: Mode
    amount: Amount
    event_date: EventDate = Field(default=None, alias="date")
    is_favorite: bool = False


# Pydantic은 전달된 필드를 model_fields_set에 남긴다. 날짜와 유형은 null로 초기화할 수 있다.
class RecordPatch(ApiModel):
    name: Name | None = None
    relation: Relation | None = None
    profile_icon: Icon | None = None
    type: Category | None = None
    mode: Mode | None = None
    amount: Amount | None = None
    event_date: EventDate = Field(default=None, alias="date")
    is_favorite: bool | None = None

    @model_validator(mode="after")
    def reject_invalid_nulls(self):
        # JS의 undefined와 null처럼 생략과 명시적 null은 뜻이 다르다.
        for field in self.model_fields_set - {"type", "event_date"}:
            if getattr(self, field) is None:
                raise ValueError(f"{field} 필드는 비울 수 없습니다.")
        return self


# 배열의 길이를 먼저 검사하고, 그다음 같은 ID가 있는지와 받은 축의금인지 확인한다.
class BatchCreate(ApiModel):
    records: Annotated[list[RecordCreate], Field(min_length=1, max_length=25)]

    @model_validator(mode="after")
    def validate_wedding_records(self):
        if len({record.id for record in self.records}) != len(self.records):
            raise ValueError("같은 기록 ID가 두 번 들어 있습니다.")
        if any(r.mode != "received" or r.type != "축의금" or r.event_date is None for r in self.records):
            raise ValueError("일괄 저장에는 날짜가 있는 받은 축의금만 넣을 수 있습니다.")
        return self


class Totals(ApiModel):
    total_paid: int
    total_received: int


# DB 모델과 응답을 분리한다. 화면에 필요한 값만 기존 camelCase 형태로 내보낸다.
class RecordView(ApiModel):
    id: UUID
    name: str
    relation: str
    profile_icon: str
    type: Category | None
    mode: Mode
    amount: int
    date: str
    is_favorite: bool
    created_at: datetime


class Bootstrap(Totals):
    user_id: UUID
    records: list[RecordView]


class RecordsWritten(Totals):
    records: list[RecordView]


class RecordDeleted(Totals):
    deleted: bool


class MonthlyRow(ApiModel):
    month: date
    category: Category | None
    mode: Mode
    record_count: int
    amount: int


class MonthlyReport(ApiModel):
    refreshed_at: datetime | None
    undated_count: int
    rows: list[MonthlyRow]
