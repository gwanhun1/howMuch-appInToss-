---
name: new-page
description: React 페이지 4계층(page/component/hook/api-service) 일괄 생성
---

# /new-page [페이지명]

`src/` 에 새 React 페이지를 4계층 구조로 추가한다.

## 생성할 파일 목록

```
src/pages/{page}.tsx                          ← 페이지 (진입점)
src/components/{Page}.tsx                     ← 컴포넌트
src/hooks/use{Page}.ts                        ← 커스텀 훅 (상태 & 로직)
src/apis/{page}/                              ← API 서비스
  ├── index.ts                                (API 호출 함수)
  └── type.ts                                 (API 응답 타입)
```

## 각 파일 패턴

### pages/{page}.tsx
```tsx
import { {Page} } from '@components/{Page}';

const {Page}Page = () => {
  return <{Page} />;
};

export default {Page}Page;
```

### components/{Page}.tsx
```tsx
import { use{Page} } from '@hooks/use{Page}';

export const {Page} = () => {
  const { data, isLoading, error } = use{Page}();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>오류 발생: {error}</div>;

  return (
    <div>
      {/* 컴포넌트 내용 */}
    </div>
  );
};
```

### hooks/use{Page}.ts
```typescript
import { useState, useEffect } from 'react';
import { get{Page}Data } from '@apis/{page}';
import type { {Page}Response } from '@apis/{page}/type';

export const use{Page} = () => {
  const [data, setData] = useState<{Page}Response | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await get{Page}Data();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};
```

### apis/{page}/index.ts
```typescript
import { get{Page}Data } from './type';

export const get{Page}Data = async (): Promise<{Page}Response> => {
  // Firebase Firestore 호출 또는 REST API 호출
  // 예시:
  // const response = await fetch('/api/{page}');
  // return response.json();
  
  return {} as {Page}Response;
};
```

### apis/{page}/type.ts
```typescript
export interface {Page}Response {
  id: string;
  // 필드 추가
}

export interface Create{Page}Req {
  // 요청 필드 추가
}
```

## 주의사항

- 경로는 `@components`, `@hooks`, `@apis` 등 Vite alias 사용
- Firebase Firestore에서 데이터 조회 시 auth guard 추가
- 타입은 명시적으로 정의 (any 금지)
- Zustand store가 필요하면 `src/stores/` 에 별도 추가

## 기존 패턴 참고

기존 페이지들:
- `src/pages/*.tsx` — 페이지 진입점
- `src/components/*.tsx` — 도메인별 컴포넌트
- `src/hooks/use*.ts` — 페이지 로직
- `src/apis/{feature}/*.ts` — API 호출 & 타입
