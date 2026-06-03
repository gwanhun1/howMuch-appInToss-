<img src="https://github.com/user-attachments/assets/cadea33a-e11e-4e85-b74c-c68528081aa9" width="100%" alt="얼마냈지요 배너" />

<br/>
<br/>

# <img src="https://github.com/user-attachments/assets/5ff764e1-b719-4348-b527-29b903e0318d" width="48" align="center" alt="로고" /> 얼마냈지요 (HowMuch)

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-443E38?style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white" alt="Playwright" />
</p>

> **토스(Toss) 인앱 미니앱 플랫폼(AIT) 기반의 보낸/받은 마음(경조사비) 기록 및 요약 관리 서비스**

> [!IMPORTANT]
> 본 서비스는 토스 앱 내 웹뷰(WebView) 전용으로 빌드 및 배포되어, **데스크톱(PC/노트북) 브라우저 환경에서는 직접적인 접속 및 실행이 제한**됩니다. 서비스 동작과 핵심 UI/UX는 아래의 스크린샷 및 시연 화면을 통해 확인하실 수 있습니다.

---

<br/>

## 📱 서비스 진입 경로 (접근 방법)

사용자가 토스 앱 내에서 '얼마냈지요' 서비스에 진입하기 위한 4가지 접근 경로입니다.

|                                                     1. 토스창 검색                                                      |                                                        2. 토스 검색창                                                        |                                                        3. 어플 검색창                                                        |                                                        4. 미니앱 검색창                                                        |
| :---------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------: |
| <img src="https://github.com/user-attachments/assets/9bc60c46-44a1-4829-b587-6b4a4ac84059" width="100%" alt="토스창" /> | <img src="https://github.com/user-attachments/assets/e4b8a24c-e81e-4d9f-b3f7-44ae3bcd7b3a" width="100%" alt="토스 검색창" /> | <img src="https://github.com/user-attachments/assets/7de8c9e4-8c54-4be6-99c2-3dfcd56fbc91" width="100%" alt="어플 검색창" /> | <img src="https://github.com/user-attachments/assets/db8e236c-f63c-487a-af5d-00c0da3e1104" width="100%" alt="미니앱 검색창" /> |
|                                                 _토스 전체 탭 및 진입_                                                  |                                                   _토스 통합 검색창 검색_                                                    |                                                     _앱 내 서비스 검색_                                                      |                                                     _미니앱 스토어/검색창_                                                     |

---

<br/>

## 📸 주요 서비스 화면

|                                                         메인 페이지                                                          |                                                         금액 입력창                                                          |                                                         경조사금 선택                                                          |                                                         금액 추천창                                                          |
| :--------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: |
| <img src="https://github.com/user-attachments/assets/ddbaaa37-5c75-4da2-adde-ccef4d1c77c2" width="100%" alt="메인 페이지" /> | <img src="https://github.com/user-attachments/assets/3922f6f6-5a3d-48fe-9764-0136be4b8dfc" width="100%" alt="금액 입력창" /> | <img src="https://github.com/user-attachments/assets/16b5a1e8-57f1-4184-9655-226af6d56594" width="100%" alt="경조사금 선택" /> | <img src="https://github.com/user-attachments/assets/61ef5a04-a8af-4192-a79b-288d2c0eff95" width="100%" alt="금액 추천창" /> |
|                                                  _수입/지출 통합 대시보드_                                                   |                                                _간편하고 직관적인 금액 입력_                                                 |                                                 _카테고리 및 경조사 세부 선택_                                                 |                                                _AI/통계 기반 적정 금액 추천_                                                 |

---

<br/>

## ✨ 핵심 기능

- 💸 **경조사비 수입/지출 이원화 관리**: 보낸 마음(지출)과 받은 마음(수입)을 모바일 스와이프 제스처로 빠르게 오가며 조회 가능

- 📊 **직관적인 통계 요약**: 전체 누적 수입 및 지출을 직관적인 카드로 집계하고 카테고리 필터링 제공

- 🗺️ **대화형 온보딩 가이드**: 신규 진입 사용자를 위해 주요 기능 안내 및 액션을 유도하는 온보딩 가이드 상태 머신 내장

- 🎲 **축하금 랜덤 추첨기(Picker)**: 재미 요소와 유저 리텐션 유도를 위한 애니메이션 카드 뒤집기 및 카운트업 추첨 기능

- 🔄 **토스 하이브리드 연동**: 익명 진입 유저 식별자 확보 및 토스 본인인증 성공 시 데이터 병합 마이그레이션

---

<br/>

## 🛠️ 기술 스택

### Frontend

- **Framework**: React 18 + TypeScript
- **State Management**: Zustand 5 (Slice Pattern, Persist Middleware)
- **Styling & Icons**: Emotion (`@emotion/react`), `@toss/tds-colors`, `@toss/tds-mobile`
- **Build Tool**: Vite + Granite (Apps in Toss 전용 빌드 도구)

### Backend & Cloud

- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Anonymous & Federated Login)

### Testing

- **E2E Test Harness**: Playwright (`aitMock.ts` 활용 SDK 모킹)

---

<br/>

## 🚀 핵심 기술적 도전과 성과

### 1️⃣ 하이브리드 사용자 식별 및 심리스 데이터 마이그레이션

- `@apps-in-toss/web-framework`의 Bridge API를 활용해 인앱 기기 식별자(`getDeviceId`) 및 폴백 익명 UUID를 획득하여 최초 진입 장벽 제거.
- 비회원(익명 로그인) 상태에서 경조사를 기록한 뒤, 토스 본인인증 성공 시 Firestore의 기존 익명 유저 문서를 토스 고유 해시 키 계정과 동적으로 매핑 및 안전하게 데이터를 이전(User Merge)하는 안정적인 인증 구조 설계.

### 2️⃣ Zustand Slice 패턴을 통한 모듈화 및 낙관적 업데이트 (Optimistic Update)

- 상태 모델의 복잡성을 낮추기 위해 `RecordSlice`, `UISlice`, `AdSlice`, `AuthSlice`로 상태 및 액션을 완벽히 격리 및 모듈화.
- 지연 시간이 발생할 수 있는 클라우드 DB 통신 시, UI 화면을 즉시 갱신하고 백엔드 처리 실패 시 롤백(Rollback)하는 낙관적 업데이트를 적용하여 웹뷰 환경에서 네이티브 앱 수준의 반응 속도 달성.

### 3️⃣ Firestore writeBatch를 통한 트랜잭션 데이터 무결성 보장

- 개별 경조사 내역 기록(`users/{uid}/records`) 추가/수정/삭제 시, 상위 문서(`users/{uid}`) 내 총 누적 수입/지출 금액을 연산하여 **Firestore `writeBatch`**로 원자적(Atomic) 처리함으로써 데이터의 불일치 현상 원천 차단.

### 4️⃣ Playwright E2E 테스트를 위한 토스 SDK 모킹 아키텍처

- 토스 웹뷰 밖 브라우저 환경에서도 자동화 E2E 테스트가 정상 수행될 수 있도록 `addInitScript` 방식으로 가상 SDK 모킹 레이어(`aitMock.ts`) 구축.
- 전역 `__QA_PERSONA__`를 통해 다채로운 사용자 케이스를 모킹 주입하고, 콘솔 에러 및 `unhandledrejection` 이벤트를 `__QA_TRACE__` 버퍼에 축적하여 모니터링 환경 구현.

### 5️⃣ 저사양 디바이스 성능 최적화 및 모바일 제스처 제어

- RAM 4GB 이하의 저사양 기기에서 입체 애니메이션 렌더링 부하로 인한 프레임 드롭을 해결하기 위해 GPU 점유율이 높은 3D 연산을 제어하고 파티클 개수를 40개 이하로 제한하여 쾌적한 렌더링 달성.
- 스와이프를 통한 뷰 체인지 시 경계면 댐핑(damping) 효과 구현 및 모달/바텀시트 오픈 시 뒷배경 바운스 간섭을 차단하기 위한 스크롤 락(`overflow`/`touchAction`) 파이프라인 개발.

---

<br/>

## 📂 프로젝트 구조

```
src/
├── apis/            # Firebase, Toss Auth 등 서버 통신 서비스
├── components/      # 글로벌 공통 UI 컴포넌트
├── hooks/           # 스와이프, 기능 온보딩 등 커스텀 훅
├── pages/           # 메인 페이지 및 금액 입력 서브 페이지
├── stores/          # Zustand 스토어 (Slice 패턴 기반)
├── test-harness/    # Playwright E2E 테스트용 Mock Script
├── types/           # 공통 TypeScript Type 정의
└── utils/           # Firebase SDK 인스턴스화 및 헬퍼 함수
```

---

<br/><br/><br/>

<p align="center">
  <img src="https://github.com/user-attachments/assets/ad2e8219-bb69-41d1-9521-6d539ae02b0d" width="80%" alt="얼마냈지요 서비스 화면" />
</p>
