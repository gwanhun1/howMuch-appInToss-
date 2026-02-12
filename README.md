# 얼마냈지요 (HowMuch)

경조사비 기록 관리 앱 - 토스 앱인토스(Apps in Toss) 플랫폼용

## 주요 기능

- 경조사비 수입/지출 기록 관리
- 친구별 금액 추적
- 총 수입/지출 요약
- Firebase 기반 클라우드 동기화
- 토스 앱 내 광고 연동

## 기술 스택

- React 18 + TypeScript
- Vite + Granite (Apps in Toss 빌드 도구)
- Firebase (Auth, Firestore)
- Zustand (상태 관리)
- Toss Design System
- Framer Motion

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 토스 앱인토스 배포
npm run deploy
```

## 환경 변수

`.env.example`을 참고하여 `.env` 파일을 생성하세요:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_AD_GROUP_ID=ait-ad-test-interstitial-id
```

## 프로젝트 구조

```
src/
├── components/     # 공통 컴포넌트
├── features/       # 기능별 모듈
│   └── friend/     # 경조사 기록 기능
│       ├── apis/       # API 서비스
│       ├── components/ # UI 컴포넌트
│       ├── stores/     # Zustand 스토어
│       └── types/      # 타입 정의
└── utils/          # 유틸리티 함수
```

## 라이선스

MIT
