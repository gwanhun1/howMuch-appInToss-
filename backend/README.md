# 얼마냈지 FastAPI 백엔드

React에서 보던 기록 데이터를 FastAPI로 받고, SQLAlchemy로 PostgreSQL에 저장합니다.
통계는 Python 배치가 읽고 변환해 별도 테이블에 적재합니다.

## 실행

```sh
cd backend
cp .env.example .env
openssl rand -hex 24
```

생성한 값을 `.env`의 `POSTGRES_PASSWORD`에 넣습니다.

```sh
docker compose up -d --wait db
docker compose run --build --rm api alembic upgrade head
docker compose up -d --wait api
docker compose exec api python -m app.cli create-user demo
```

[Swagger UI](http://127.0.0.1:8010/docs)는 API 계약을 확인하는 곳입니다.
아래 예제는 변경 요청에 Origin 헤더를 명시하고 로그인 쿠키를 재사용합니다.

```sh
curl -i -c .cookies.local http://127.0.0.1:8010/api/v1/session \
  -H 'Origin: http://127.0.0.1:8010' -H 'Content-Type: application/json' \
  --data '{"username":"demo","password":"여기에 생성한 데모 비밀번호 입력"}'

curl -b .cookies.local http://127.0.0.1:8010/api/v1/records \
  -H 'Origin: http://127.0.0.1:8010' -H 'Content-Type: application/json' \
  --data '{"id":"42857b21-a513-4015-9939-1612b3131a4e","name":"데모","relation":"","profileIcon":"icon-face-cap","type":"축의금","mode":"received","amount":50000,"date":"2026-11-24"}'

curl -b .cookies.local http://127.0.0.1:8010/api/v1/bootstrap
docker compose exec api python -m app.cli refresh-stats --username demo
curl -b .cookies.local http://127.0.0.1:8010/api/v1/stats/monthly
```

## JavaScript 개발자를 위한 읽는 순서

1. [app/main.py](app/main.py)에서 Express의 `router.post`에 해당하는 `@api.post`를 찾습니다. `Depends`가 요청에 사용할 DB 세션과 로그인 사용자를 준비합니다.
2. [app/schemas.py](app/schemas.py)는 Zod에 가까운 역할을 합니다. HTTP 입력을 런타임에 검사하고 `profileIcon`을 Python의 `profile_icon`으로 매핑합니다.
3. [app/models.py](app/models.py)는 Prisma 스키마처럼 열과 제약을 정의합니다. [Alembic 마이그레이션](migrations/versions/0001_create_record_and_statistics_tables.py)은 이 정의를 DB에 적용합니다.
4. [app/records.py](app/records.py)의 `flush`는 SQL을 전송하고 `commit`은 변경을 확정합니다. 같은 사용자 쓰기는 행 잠금으로 직렬화합니다. 누적 합계는 SQL `SUM`으로 계산합니다.
5. [app/stats.py](app/stats.py)에서 Extract, Transform, Load 순으로 살펴봅니다. 배치가 실패하면 이전 통계를 보존하고, 기록을 삭제한 뒤 다시 돌리면 오래된 통계가 제거됩니다.

## PostgreSQL 통합 테스트

Python 가상환경에 `requirements-dev.txt`를 설치하고 별도의 테스트 DB를 준비합니다.

```sh
export TEST_DATABASE_URL='postgresql+psycopg://USER:PASSWORD@HOST:PORT/TEST_DB'
DATABASE_URL="$TEST_DATABASE_URL" python -m alembic upgrade head
python -m pytest -q
```

Oracle에서는 이 디렉터리를 LogMe와 별도 Compose 프로젝트로 실행합니다.
호스트 프록시를 사용하는 경우 API는 기본적으로 루프백 포트 8010에 연결합니다.
`PUBLIC_ORIGIN`은 브라우저에서 접속하는 HTTPS 주소로 지정합니다. 외부 데모 공개 전 기존 프록시에서 로그인 요청 제한과 실제 TLS 라우팅을 확인합니다.

### 기존 Oracle VM에서 인터뷰용으로 실행

`compose.oci.yml`을 함께 사용하면 API 192MiB, PostgreSQL 128MiB 한도를 적용합니다.
x86_64 VM에 배포하는 API 이미지는 개발 머신에서 `linux/amd64`로 빌드한 뒤
`docker save`와 `docker load`로 옮깁니다. 서버에서는 아래 명령으로 기동합니다.

```sh
docker compose -f compose.yml -f compose.oci.yml up -d --wait db
docker compose -f compose.yml -f compose.oci.yml run --pull never --rm api alembic upgrade head
docker compose -f compose.yml -f compose.oci.yml up -d --no-build --wait api
```

API는 VM 루프백에 바인딩합니다. 기존 SSH 접속 옵션을 사용해 로컬 포트를 연결하면
VM의 별도 인바운드 포트나 공개 URL 없이 시연할 수 있습니다.

```sh
ssh -N -o ExitOnForwardFailure=yes -L 18010:127.0.0.1:8010 USER@ORACLE_HOST
curl -fsS http://127.0.0.1:18010/readyz
```

터널에서 쓰기 요청을 보내는 curl은 서버의 `PUBLIC_ORIGIN`과 같은 Origin을 명시합니다.
이 설정의 기본값은 `http://127.0.0.1:8010`입니다. 실제 브라우저에서 Swagger로 쓰기까지
하려면 로컬 포트도 8010을 사용하거나 서버의 `PUBLIC_ORIGIN`을 터널 주소에 맞춥니다.

11월 24일 OCI 실측에서는 PostgreSQL과 API가 healthy 상태였고 Alembic은 `0001 (head)`였습니다.
Mac의 SSH 터널에서 `/readyz`와 Swagger에 접속했고, 서버에서 데모 로그인, 50,000원 기록 동일
요청 두 번, 월별 통계 50,000원, API 재시작 뒤 기록 재조회를 확인했습니다.
검증용 계정과 기록은 정리했으며 LogMe는 배포 전후 헬스 체크에서 HTTP 200을 반환했습니다.
