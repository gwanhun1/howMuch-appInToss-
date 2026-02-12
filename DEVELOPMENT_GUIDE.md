# 얼마냈지요 앱 개발 가이드

> **Apps in Toss 정석 개발 패턴**  
> 이 문서는 토스 인앱 WebView 환경에서 안정적이고 일관된 개발을 위한 필수 규칙과 패턴을 정리합니다.

---

## 📋 목차

1. [핵심 원칙](#핵심-원칙)
2. [프로젝트 구조](#프로젝트-구조)
3. [필수 환경 설정](#필수-환경-설정)
4. [컴포넌트 개발 규칙](#컴포넌트-개발-규칙)
5. [상태 관리 패턴](#상태-관리-패턴)
6. [Import 규칙](#import-규칙)
7. [금지 사항](#금지-사항)
8. [예외 허용 케이스](#예외-허용-케이스)

---

## 🎯 핵심 원칙

### 1. **TDS-only 원칙**

- UI는 `@toss/tds-mobile` 컴포넌트로만 구성
- 커스텀 CSS 파일 추가 금지
- `div` + 인라인 스타일은 **필수 레이아웃만 최소 허용**

### 2. **단일 상태 관리**

- UI 상태(페이지, BottomSheet 오픈 등)도 Zustand store로 통합
- 로컬 `useState`는 폼 입력값 등 컴포넌트 내부 상태만 사용

### 3. **정적 import만 사용**

- `import * as TDS from '@toss/tds-mobile'` 금지
- `as any` 우회 금지
- examples에서 실제로 사용되는 컴포넌트만 import

### 4. **공식 런타임 환경 필수**

- `@toss/tds-mobile-ait` Provider로 앱 전체 감싸기
- WebView 컨텍스트를 TDS 컴포넌트가 안정적으로 받도록 보장

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── common/          # 공통 컴포넌트 (AppHeader 등)
│   └── friend/          # 도메인별 컴포넌트 (BottomSheet 등)
├── pages/               # 페이지 컴포넌트
├── stores/              # Zustand 상태 관리
├── types/               # TypeScript 타입 정의
├── App.tsx              # 앱 진입점
├── main.tsx             # React 렌더링 + Provider
└── index.css            # 최소 글로벌 스타일 (Safe Area 등)
```

---

## ⚙️ 필수 환경 설정

### 1. **Provider 적용** (`src/main.tsx`)

```tsx
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>
  </StrictMode>,
);
```

### 2. **경로 별칭 설정**

**tsconfig.app.json**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**vite.config.ts**

```ts
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

### 3. **패키지 설치**

```bash
npm install @toss/tds-mobile-ait@^2.2.0 --legacy-peer-deps
```

---

## 🧩 컴포넌트 개발 규칙

### ✅ **올바른 패턴**

#### 1. TDS 컴포넌트 정적 import

```tsx
import { Asset, Spacing, Text, BottomSheet, Button } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
```

#### 2. 레이아웃은 TDS 컴포넌트 우선

```tsx
// ✅ 좋은 예
<>
  <AppHeader title="금액 입력" />
  <Spacing size={12} />
  <Top title={<Top.TitleParagraph>제목</Top.TitleParagraph>} />
  <List>
    <ListRow contents={<ListRow.Texts type="1RowTypeA" top="이름" />} />
  </List>
</>
```

#### 3. 필수 레이아웃만 최소 div 허용

```tsx
// ✅ 허용: 수평 배치 (TDS에 Flex 컴포넌트 없음)
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <Text>제목</Text>
  <Asset.Icon name="icon-home-mono" />
</div>

// ✅ 허용: 그리드 레이아웃 (MainPage 친구 선택 등)
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
  {items.map(item => <Card key={item.id} />)}
</div>
```

### ❌ **금지 패턴**

```tsx
// ❌ 나쁜 예: 동적 import + any 우회
import * as TDS from "@toss/tds-mobile";
const { Asset, Text } = TDS as any;

// ❌ 나쁜 예: 존재하지 않는 컴포넌트 추측
const { Navigation, NewTop } = TDS as any; // 런타임 undefined 위험

// ❌ 나쁜 예: 불필요한 div + 복잡한 인라인 스타일
<div
  style={{
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  }}
>
  {/* TDS 컴포넌트로 대체 가능 */}
</div>;
```

---

## 🗂️ 상태 관리 패턴

### Zustand Store 구조 (`stores/useFriendStore.ts`)

```tsx
import { create } from "zustand";
import type { Friend } from "@/types/friend";

interface FriendStore {
  // 데이터 상태
  friends: Friend[];
  selectedFriendId: string | null;

  // UI 상태 (중요!)
  currentPage: "main" | "amountInput";
  isFriendFormOpen: boolean;
  isProfileImageSheetOpen: boolean;

  // 데이터 액션
  addFriend: (friend: Friend) => void;
  updateFriend: (id: string, updates: Partial<Friend>) => void;

  // UI 액션
  openFriendForm: (id: string) => void;
  closeFriendForm: () => void;
  openAmountInput: () => void;
  closeAmountInput: () => void;

  // 공통 액션 (중요!)
  resetToMain: () => void; // 어디서든 메인으로 복귀
}

export const useFriendStore = create<FriendStore>((set) => ({
  friends: [],
  selectedFriendId: null,
  currentPage: "main",
  isFriendFormOpen: false,
  isProfileImageSheetOpen: false,

  openFriendForm: (id) =>
    set({ selectedFriendId: id, isFriendFormOpen: true, currentPage: "main" }),

  resetToMain: () =>
    set({
      currentPage: "main",
      selectedFriendId: null,
      isFriendFormOpen: false,
      isProfileImageSheetOpen: false,
    }),

  // ... 나머지 액션
}));
```

### 컴포넌트에서 사용

```tsx
export function MainPage() {
  const {
    friends,
    currentPage,
    isFriendFormOpen,
    openFriendForm,
    closeFriendForm,
    resetToMain,
  } = useFriendStore();

  if (currentPage === "amountInput") {
    return <AmountInputPage onHome={resetToMain} />;
  }

  return (
    <>
      <AppHeader onClose={resetToMain} />
      {/* ... */}
      <FriendFormBottomSheet
        open={isFriendFormOpen}
        onClose={closeFriendForm}
        onHome={resetToMain}
      />
    </>
  );
}
```

---

## 📦 Import 규칙

### ✅ **올바른 import**

```tsx
// 1. 외부 라이브러리
import { useState } from "react";
import { create } from "zustand";

// 2. TDS 컴포넌트 (정적 import)
import { Asset, Spacing, Text, BottomSheet } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

// 3. 내부 모듈 (@ alias 사용)
import { AppHeader } from "@/components/common/AppHeader";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Friend } from "@/types/friend";
```

### ❌ **금지 import**

```tsx
// ❌ 상대경로 사용
import { AppHeader } from "../components/common/AppHeader";
import { useFriendStore } from "../../stores/useFriendStore";

// ❌ 동적 import + any
import * as TDS from "@toss/tds-mobile";
const { Asset } = TDS as any;
```

---

## 🚫 금지 사항

### 1. **커스텀 CSS 파일 추가**

```css
/* ❌ src/components/MyComponent.css - 금지 */
.my-custom-class {
  background: #fff;
}
```

### 2. **React Native 컴포넌트 사용**

```tsx
// ❌ WebView 환경에서 React Native는 동작하지 않음
import { View, Text } from "react-native";
```

### 3. **존재하지 않는 TDS 컴포넌트 추측**

```tsx
// ❌ 사용 전 반드시 examples에서 확인
import { Navigation, NewTop, CustomButton } from "@toss/tds-mobile";
```

### 4. **로컬 상태로 UI 전환 관리**

```tsx
// ❌ 나쁜 예
function MainPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("main");
  // → store로 통합 필요
}
```

---

## ⚠️ 예외 허용 케이스

### 1. **MainPage 친구 그리드**

```tsx
// ✅ 허용: 3열 그리드는 TDS에 없음
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  }}
>
  {friends.map((friend) => (
    <div key={friend.id} onClick={() => openFriendForm(friend.id)}>
      <Asset.Image src={friend.profileIcon} />
      <Text>{friend.name}</Text>
    </div>
  ))}
</div>
```

### 2. **수평 배치 (Flex)**

```tsx
// ✅ 허용: TDS에 Flex 컴포넌트 없음
<div style={{ display: "flex", justifyContent: "space-between" }}>
  <Text>제목</Text>
  <Asset.Icon name="icon-home-mono" onClick={onHome} />
</div>
```

### 3. **원형 프로필 아이콘**

```tsx
// ✅ 허용: 특수 레이아웃
<div
  style={{
    width: 80,
    height: 80,
    borderRadius: "50%",
    backgroundColor: "#D6E6FB",
  }}
>
  <Asset.Image src={profileIcon} />
</div>
```

---

## 🔍 개발 전 체크리스트

### 새 컴포넌트 추가 시

- [ ] TDS 컴포넌트 정적 import 사용
- [ ] `@/` alias로 내부 모듈 import
- [ ] UI 상태는 store로 관리
- [ ] `div` 사용은 필수 레이아웃만
- [ ] 홈 이동은 `resetToMain()` 사용

### 새 페이지 추가 시

- [ ] `currentPage` 타입에 추가
- [ ] store에 open/close 액션 추가
- [ ] `onHome` prop으로 `resetToMain` 전달
- [ ] AppHeader 또는 TDS Navigation 사용

### BottomSheet 추가 시

- [ ] `open` 상태는 store로 관리
- [ ] `onClose`, `onHome` prop 필수
- [ ] 헤더는 최소 div + TDS 컴포넌트 조합
- [ ] CTA는 `BottomSheet.DoubleCTA` 또는 `FixedBottomCTA` 사용

---

## 🛠️ 트러블슈팅

### "Element type is invalid" 에러

**원인**: TDS 컴포넌트를 동적 import하거나 존재하지 않는 컴포넌트 사용  
**해결**: 정적 import로 변경 + examples에서 실제 사용 확인

```tsx
// ❌ 문제
import * as TDS from "@toss/tds-mobile";
const { Navigation } = TDS as any; // Navigation이 undefined일 수 있음

// ✅ 해결
import { Top, Spacing, ListRow } from "@toss/tds-mobile";
```

### "Cannot find module '@/...'" 에러

**원인**: Vite alias 미설정 또는 dev 서버 재시작 필요  
**해결**: `vite.config.ts` 확인 후 dev 서버 재시작

### BottomSheet가 열리지 않음

**원인**: `open` 상태가 로컬 useState로 관리되어 동기화 안 됨  
**해결**: store의 `isXXXOpen` 상태 사용

---

## 📚 참고 자료

- [Apps in Toss 공식 문서](https://developers-apps-in-toss.toss.im/)
- [TDS Mobile 컴포넌트](https://tossmini-docs.toss.im/tds-mobile/)
- [apps-in-toss-examples-main](https://github.com/toss/apps-in-toss-examples) (참고용)

---

## 🎓 AI 개발 가이드

### AI에게 요청할 때 포함할 내용

1. **"정석 패턴 유지"** 명시
2. 사용할 TDS 컴포넌트 지정 (예: `ListRow`, `BottomSheet`)
3. 상태 관리 방식 (store 사용 여부)
4. 예외 허용 여부 (그리드, Flex 등)

### 좋은 요청 예시

```
"친구 삭제 기능을 추가해줘.
- FriendFormBottomSheet에 삭제 버튼 추가
- store에 deleteFriend 액션 추가
- 정석 패턴(TDS-only, @/ alias) 유지
- 삭제 확인은 BottomSheet 사용"
```

### 나쁜 요청 예시

```
"친구 삭제 기능 만들어줘"
// → 구체적인 패턴 지정 없음
```

---

**마지막 업데이트**: 2026-01-27  
**프로젝트**: 얼마냈지요 (Apps in Toss)  
**환경**: React 19 + Vite + @toss/tds-mobile 2.2.x
