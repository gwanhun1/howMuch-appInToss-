# 얼마냈지요 (HowMuch) — Toss AIT 마이크로앱

토스 앱 내 웹뷰 전용 경조사비(마음) 기록 및 통계 관리 미니앱.

## 기술 스택

- **Framework**: React 18 + TypeScript
- **Build**: Vite + Granite (Toss AIT 전용)
- **State**: Zustand v5 (Slice Pattern, Persist Middleware)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Anonymous + Federated)
- **Styling**: Emotion (`@emotion/react`), TDS Mobile, Tailwind CSS
- **Animations**: Framer Motion
- **port**: 5173 (dev), 5174-5176 (worktree)

## 4계층 파일 구조 패턴

새 기능을 추가할 때 **반드시 이 4계층**을 따른다:

```
src/
  ├── pages/
  │   └── {page}.tsx                     # 라우팅 진입점 (최소한의 로직)
  ├── components/
  │   └── {Page}.tsx                     # UI 컴포넌트
  ├── hooks/
  │   └── use{Page}.ts                   # 상태 로직 + 데이터 페칭
  ├── apis/
  │   └── {page}/
  │       ├── index.ts                   # API 호출 함수
  │       └── type.ts                    # 요청/응답 타입
  ├── types/                             # 전역 타입
  ├── stores/                            # Zustand stores
  ├── features/                          # 도메인별 폴더
  ├── constants/                         # 상수
  └── utils/                             # 유틸 함수
```

기존 예시: `pages/Main.tsx`, `pages/Friend.tsx`, `pages/Statistics.tsx`

## API & 데이터 페칭 규칙

### Firebase Firestore 호출
```typescript
// apis/{page}/index.ts
import { getFirestore, collection, query, where } from 'firebase/firestore';

export const get{Page}Data = async (userId: string) => {
  const db = getFirestore();
  const q = query(collection(db, '{collection}'), where('userId', '==', userId));
  // 쿼리 실행
};
```

### Hook에서 데이터 페칭
```typescript
// hooks/use{Page}.ts
import { useState, useEffect } from 'react';
import { get{Page}Data } from '@apis/{page}';

export const use{Page} = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await get{Page}Data();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류 발생');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, isLoading, error };
};
```

응답 타입은 명시적으로 정의한다 (any 금지).

## Zustand 상태 관리 규칙

전역 상태가 필요한 경우 `src/stores/` 에 store 추가:

```typescript
// stores/useRecordStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecordStore {
  records: Record[];
  addRecord: (record: Record) => void;
  removeRecord: (id: string) => void;
}

export const useRecordStore = create<RecordStore>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (record) =>
        set((state) => ({ records: [...state.records, record] })),
      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),
    }),
    { name: 'record-store' }
  )
);
```

## 컴포넌트 규칙

- 공통 컴포넌트: `components/common/` (Button, Modal 등)
- 도메인별 컴포넌트: `components/{Feature}/` (기능별)
- 페이지 컴포넌트: `components/{Page}.tsx` (pages/{page}.tsx에서 import)
- 스타일: Emotion 또는 Tailwind CSS (SCSS는 필요시만)

## 타입 정의 규칙

- 전역 타입: `src/types/*.ts`
- API 응답 타입: `src/apis/{page}/type.ts`
- 컴포넌트 props 타입: 해당 컴포넌트 파일 내 정의

```typescript
// types/index.ts
export interface Record {
  id: string;
  userId: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 인증 흐름

- 익명 진입 → Firebase Anonymous Auth
- 토스 본인인증 성공 → Federated Login + 데이터 마이그레이션
- 사용자 정보: Zustand store 또는 Firebase Auth 활용

## 스크립트

```bash
npm run dev           # 개발 서버 (Granite, port 5173)
npm run build         # AIT 프로덕션 빌드
npm run lint          # ESLint
npm run qa:emulator   # Firebase Emulator 실행
npm run qa:dev        # QA 환경 dev 서버
npm run deploy        # Toss AIT 배포
```

## 루프 기법 스킬

- `/score [기능 설명]` — 3개 에이전트가 각자 구현 → Judge 채점
- `/new-page [페이지명]` — 4계층 페이지 자동 생성
- `/worktree [브랜치명]` — 격리 개발 환경 (포트 자동 분배)

예시:
```bash
/score "경조사 카테고리 필터링 추가"
/new-page "statistics"
/worktree feat/new-feature
```
