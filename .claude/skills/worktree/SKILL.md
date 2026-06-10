---
name: worktree
description: git worktree 격리 환경을 생성한다. 포트 자동 분배, 상태 파일 생성.
---

# /worktree [브랜치명]

병렬 개발을 위한 격리된 git worktree 환경을 생성한다.

## 포트 분배 규칙

| worktree | 포트 | 상태 |
|---|---|---|
| main | 5173 | 기본 |
| worktree-1 | 5174 | 격리 환경 |
| worktree-2 | 5175 | 격리 환경 |
| worktree-3 | 5176 | 격리 환경 |

## 실행 단계

### 1. 현재 worktree 목록 확인
```bash
git worktree list
```

### 2. 브랜치명으로 포트 번호 결정
- `.claude/worktree-status.md` 파일을 읽어 현재 사용 중인 포트 확인
- 사용 중이지 않은 가장 낮은 번호 선택

### 3. worktree 생성
```bash
git worktree add ../howMuch-{branch} -b {branch}
```

### 4. 환경변수 복사
```bash
cp .env.local ../howMuch-{branch}/.env.local
cp .env.development ../howMuch-{branch}/.env.development (있으면)
```

### 5. 포트 설정
`../howMuch-{branch}/vite.config.ts` 의 server port를 수정:
```typescript
server: {
  port: {assigned_port}
}
```

또는 dev 명령 실행 시:
```bash
cd ../howMuch-{branch} && granite dev --port {assigned_port}
```

### 6. 의존성 설치
```bash
cd ../howMuch-{branch} && npm install
```

### 7. 상태 파일 업데이트
`.claude/worktree-status.md` 를 생성 또는 업데이트:

```markdown
# Worktree 현황

| 브랜치 | 디렉토리 | 포트 | 작업 내용 | 생성일 |
|---|---|---|---|---|
| main | howMuch-appInToss- | 5173 | 메인 | - |
| {branch} | howMuch-{branch} | {assigned_port} | {작업내용} | {date} |
```

## 완료 후 안내 메시지

```
✅ Worktree 생성 완료

📁 디렉토리: howMuch-{branch} (port {assigned_port})

시작 방법:
  cd howMuch-{branch} && npm install && granite dev

작업 완료 후 정리:
  git worktree remove howMuch-{branch}
```

## 주의사항

- Firebase Firestore 공유 사용 — 테스트 데이터 충돌 주의
- worktree 간 node_modules 공유 없음 (각자 설치)
- 작업 완료 후 반드시 `git worktree remove` 로 정리
