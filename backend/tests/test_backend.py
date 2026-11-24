import os
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest

test_url = os.environ.get("TEST_DATABASE_URL")
if not test_url:
    pytest.exit("마이그레이션된 테스트 전용 PostgreSQL의 TEST_DATABASE_URL을 설정하세요.", returncode=2)
os.environ["DATABASE_URL"] = test_url

from fastapi.testclient import TestClient
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.auth import PUBLIC_ORIGIN, passwords
from app.db import engine
from app.main import app
from app.models import LoginSession, Record, User
from app.stats import refresh

ORIGIN = {"Origin": PUBLIC_ORIGIN}
PASSWORD = "temporary-test-password"


@pytest.fixture
def accounts():
    # 테스트가 만든 사용자만 삭제한다. FK CASCADE로 해당 세션·기록도 정리된다.
    prepared = [(uuid4(), f"test-{uuid4()}") for _ in range(2)]
    with Session(engine) as db, db.begin():
        db.add_all([
            User(id=user_id, username=name, password_hash=passwords.hash(PASSWORD))
            for user_id, name in prepared
        ])
    try:
        yield prepared
    finally:
        with Session(engine) as db, db.begin():
            db.execute(delete(User).where(User.id.in_([user_id for user_id, _ in prepared])))


def sign_in(client, username):
    return client.post("/api/v1/session", json={"username": username, "password": PASSWORD})


def record(**values):
    return {
        "id": str(uuid4()), "name": "테스트", "relation": "", "profileIcon": "icon-face-cap",
        "type": "축의금", "mode": "received", "amount": 50_000, "date": "2026-11-24",
        **values,
    }


def test_session_origin_and_owner_isolation(accounts):
    with TestClient(app, base_url=PUBLIC_ORIGIN, headers=ORIGIN) as alice, TestClient(
        app, base_url=PUBLIC_ORIGIN, headers=ORIGIN,
    ) as bob:
        assert alice.get("/api/v1/bootstrap").status_code == 401
        assert sign_in(alice, "missing").status_code == 401
        login = sign_in(alice, accounts[0][1])
        assert login.status_code == 204
        assert "HttpOnly" in login.headers["set-cookie"]
        assert sign_in(bob, accounts[1][1]).status_code == 204

        entry = record()
        assert alice.post("/api/v1/records", json=entry, headers={"Origin": "https://other.example"}).status_code == 403
        assert alice.post("/api/v1/records", json=entry).status_code == 200
        path = f"/api/v1/records/{entry['id']}"
        assert bob.patch(path, json={"amount": 1}).status_code == 404
        assert bob.delete(path).json()["deleted"] is False
        assert bob.get("/api/v1/bootstrap").json()["records"] == []
        assert alice.get("/api/v1/bootstrap").json()["totalReceived"] == 50_000
        assert alice.delete("/api/v1/session").status_code == 204
        assert alice.get("/api/v1/bootstrap").status_code == 401


def test_same_id_concurrent_retry_and_atomic_batch(accounts):
    with TestClient(app, base_url=PUBLIC_ORIGIN, headers=ORIGIN) as client:
        assert sign_in(client, accounts[0][1]).status_code == 204
        entry = record()
        with ThreadPoolExecutor(max_workers=2) as executor:
            requests = [executor.submit(client.post, "/api/v1/records", json=entry) for _ in range(2)]
            for request in requests:
                result = request.result()
                assert result.status_code == 200, result.text
                assert result.json()["totalReceived"] == 50_000

        other = record()
        response = client.post("/api/v1/records/batch", json={
            "records": [other, {**entry, "amount": 80_000}],
        })
        assert response.status_code == 409
        assert len(client.get("/api/v1/bootstrap").json()["records"]) == 1

        batch = {"records": [entry, other]}
        assert client.post("/api/v1/records/batch", json=batch).json()["totalReceived"] == 100_000
        assert client.post("/api/v1/records/batch", json=batch).json()["totalReceived"] == 100_000
        assert client.post("/api/v1/records/batch", json={"records": [entry, entry]}).status_code == 422


def test_validation_and_etl_replaces_stale_groups(accounts, monkeypatch):
    owner, username = accounts[0]
    with TestClient(app, base_url=PUBLIC_ORIGIN, headers=ORIGIN) as client:
        assert sign_in(client, username).status_code == 204
        for invalid in [record(amount="50000"), record(date="2026-02-30"), record(amount=True)]:
            assert client.post("/api/v1/records", json=invalid).status_code == 422
        dated = record()
        undated = record(date="", mode="paid", type=None)
        assert client.post("/api/v1/records", json=dated).status_code == 200
        assert client.post("/api/v1/records", json=undated).status_code == 200
        with Session(engine) as db:
            assert refresh(db, owner) == (1, 1)
            assert refresh(db, owner) == (1, 1)

        stats_path = "/api/v1/stats/monthly"
        original = client.get(stats_path).json()
        assert original["rows"] == [{
            "month": "2026-11-01", "category": "축의금", "mode": "received",
            "recordCount": 1, "amount": 50_000,
        }]
        assert original["undatedCount"] == 1
        assert client.get("/api/v1/bootstrap").json()["totalPaid"] == 50_000

        path = f"/api/v1/records/{dated['id']}"
        assert client.patch(path, json={"date": "2026-12-01", "type": None}).status_code == 200
        assert client.patch(path, json={"amount": None}).status_code == 422

        def fail_at_load(*_args):
            raise RuntimeError("simulated load failure")

        with Session(engine) as db, monkeypatch.context() as patch:
            patch.setattr(db, "merge", fail_at_load)
            with pytest.raises(RuntimeError, match="simulated load failure"):
                refresh(db, owner)
        assert client.get(stats_path).json() == original

        with Session(engine) as db:
            refresh(db, owner)
        rows = client.get(stats_path).json()["rows"]
        assert [row["month"] for row in rows] == ["2026-12-01"]
        assert rows[0]["category"] is None
        assert client.delete(path).json()["totalReceived"] == 0
        assert client.delete(path).json()["deleted"] is False
        with Session(engine) as db:
            refresh(db, owner)
        assert client.get(stats_path).json()["rows"] == []


def test_self_service_account_consent_and_deletion():
    username = f"test-{uuid4().hex}"
    body = {"username": username, "password": PASSWORD}
    with TestClient(app, base_url=PUBLIC_ORIGIN, headers=ORIGIN) as client:
        try:
            assert client.post("/api/v1/accounts", json=body).status_code == 422
            assert client.post("/api/v1/accounts", json={**body, "privacyConsent": False}).status_code == 422
            assert client.post("/api/v1/accounts", json={**body, "privacyConsent": 1}).status_code == 422
            consent = {**body, "privacyConsent": True}
            assert client.post("/api/v1/accounts", json=consent).status_code == 204
            assert client.post("/api/v1/accounts", json=consent).status_code == 409
            assert sign_in(client, username).status_code == 204
            saved = client.post("/api/v1/records", json=record())
            assert saved.status_code == 200
            with Session(engine) as db:
                user = db.scalar(select(User).where(User.username == username))
                assert user.privacy_accepted_at is not None
                user_id = user.id

            wrong = client.request("DELETE", "/api/v1/accounts/me", json={"password": "wrong"})
            assert wrong.status_code == 403
            assert client.request("DELETE", "/api/v1/accounts/me", json={"password": PASSWORD}).status_code == 204
            assert client.get("/api/v1/bootstrap").status_code == 401
            assert sign_in(client, username).status_code == 401

            with Session(engine) as db:
                assert db.get(User, user_id) is None
                assert db.scalar(select(Record).where(Record.owner_id == user_id)) is None
                assert db.scalar(select(LoginSession).where(LoginSession.owner_id == user_id)) is None
        finally:
            with Session(engine) as db, db.begin():
                db.execute(delete(User).where(User.username == username))
