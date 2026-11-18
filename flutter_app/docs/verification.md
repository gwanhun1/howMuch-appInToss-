# Flutter 기능 일치 검증 보고서

검증일: 2026-11-17 (Asia/Seoul). 이번 작업은 로컬 Flutter 앱의 기능·흐름을 현재 React 미니앱과 맞추는 작업입니다. 이전의 기능 중심 시제품에서 메인/편집/금액/검색/보조 도구를 다시 구성했습니다.

## Gate 1 — 필수 기준

- Flutter 포맷/정적 분석: PASS (0 issues).
- Flutter 단위·위젯 테스트: 35개. 금액/날짜/가이드/CSV 외에 검색 정규화·정렬·D-day·금액 이력·가이드 전달·계산기 상태 유지·장부 직접 입력·중복 확인·중요 표시 실패 복원·삭제 확인·저장 후 조회 실패 재시도의 중복 방지를 포함합니다.
- iOS SQLite 통합 테스트: 기록 입력→별도 금액 화면→저장, DB 닫기/재연결, 중요 표시, 삭제.
- iOS DB 마이그레이션 테스트: PASS. 기존 v1 기록을 v2에서 유지하고, batch 중 두 번째 쓰기를 강제로 실패시켜 첫 번째 쓰기도 rollback됨을 확인했습니다.
- iOS 화면 드라이버: 실제 시뮬레이터에서 메인/편집/프로필/금액/가이드/예산/장부 화면 캡처.
- Android debug APK: 빌드 검증. Android 기기 실행은 미검증.
- 기존 React: `npx tsc -b`, `npm run lint`, `npm run build`, `npm test` PASS. 70 passed / 1 skipped (기존 Firebase Emulator 테스트).
- 신규 TypeScript any: 0. React 기능 구현/운영 설정 변경 없음. React 공통 규칙 테스트만 추가했습니다.

## Gate 2 — 크기와 의존성

- 기존 React package.json과 운영 소스는 변경하지 않았습니다. 웹 번들에 Flutter 자산을 포함하지 않습니다.
- 새 직접 의존성: unorm_dart (NFC 이름/중복 검사), shared_preferences (모드/보기 설정만 저장).
- 토스페이스 원본 TTF 약 12MB 추가. 출처/저작권 안내/라이선스 동봉. 폰트 원본 변경 없음.
- 원본 TTF SHA-256: `ec49cf31bea9c5bc0844bccf0a66435e0c12c62a6c2ee73c754c63273e5b4883`.
- 디버그 앱/APK 크기는 엔진·기호를 포함하므로 스토어 설치 크기로 해석하지 않습니다.
- 별도의 지연 시간/프레임 SLA는 지정되지 않았습니다. 대량 데이터 성능 수치는 측정하지 않았습니다.

## Gate 3 — 정성 평가

- 구조 4/5: 계산·검색·표시는 domain, SQLite는 data, 기록/도구 세션은 state, UI와 공통 위젯은 ui로 분리. 원본 React 계층은 Dart 역할에 대응. Action: 공통 JSON 업무 규칙을 양 언어 테스트에서 검증.
- 사용자 흐름 4/5: 기록 편집→금액→편집 복귀, 가이드→기록 및 계산기 복귀, 장부 편집/CSV→저장, 확인 전 삭제 취소, 실패 시 폼 유지. Evidence: 위젯·실제 SQLite 테스트 및 iOS 화면 캡처. Action: 인라인 이모지/전체 화면 폼을 별도 선택창/바텀시트로 교체.
- 상태 4/5: 영구 기록과 화면 초안 분리. 미저장 장부/계산기는 앱 실행 동안 유지. 중요 표시 실패 시 UI 복구. Evidence: 세션/실패/트랜잭션 테스트. Action: SQLite v1→v2 마이그레이션 검증.

## 자산과 독립 앱 범위

TDS 전용 SVG는 포함하지 않았습니다. 토스페이스만 별도 라이선스에 따라 원본 폰트로 적용하고 앱 화면/라이선스에 출처를 표시했습니다. 15개의 일반 이모지가 기존 TDS 캐릭터와 같은 그림이라는 의미는 아닙니다.

토스 식별/Firestore/토스 Analytics는 독립 로컬 저장·OS 기능으로 대체했습니다. 서비스 데이터 이관이나 서버 변경은 없습니다. 외부 배포/계정 결제/커밋/푸시는 하지 않았습니다.

## 남은 수동 QA

실물 iPhone의 키보드/접근성/파일 선택/공유·파일 저장, Android 실기기, 다양한 글자 크기를 추가로 확인해야 합니다. 클라우드 백업·전체 기록 백업·스토어 출시 준비는 별도입니다. 장식 애니메이션/온보딩 강조 마스크와 일부 시각 표현은 원본과 다릅니다. 구체적인 차이는 [기능 대응표](feature-parity.md)를 참고하세요.

[수정된 화면 모음](screenshots/overview.png) · [메인](screenshots/home-record.png) · [프로필](screenshots/profile-picker.png)

## 금액·뽑기·장부 UI 전체 점검

사용자 화면 피드백을 기준으로 추가 수정했습니다.

- 금액: 테마의 흰 박스 배경 제거. 숫자/원/지우기를 독립 배치하고 크기·수직 정렬·44px 터치 영역을 조정. 천 단위 구분, 금액 읽기, 커서 유지, 쉼표 backspace, 1억 상한 적용. 빠른 금액은 셀 전체를 채우며 작은 화면/큰 글자에서는 2열로 전환.
- 뽑기: 번호 버튼과 기본 시트 대신 짙은 그라데이션 대화상자, 5장 카드, 섞기/선택/결과/다시 뽑기, 닫기, 복사 실패 처리, 애니메이션 줄이기 설정 반영.
- 장부: 입력칸 간격과 불필요한 글자수 카운터 정리. 저장된 장부/미저장 하객 구분. 합계·입력 안내와 전체 폭 저장 버튼. 저장된 내역은 금액을 아래 줄에 표시해 큰 글자에서도 겹침 방지.
- 공통: 메인 합계 헤더 줄바꿈, 큰 글자 카드 높이 확장, 목록의 금액 배치 개선. 검색/가이드 이력도 세로 상세 표시로 통일. 토스페이스 프로필은 아이콘 크기를 유지.
- 자동 검사: 정적 분석 0 issues, 단위/위젯 33개. 320×640 화면, 글자 크기 1.5/1.8배, 키보드 inset 260px, 긴 이름·1억 기록, 뽑기 중복 선택/재시작을 포함. 모든 기기의 실제 키보드를 검증했다는 의미는 아님.
- iOS 화면 드라이버로 금액·뽑기 전/후·장부 입력을 포함한 실제 시뮬레이터 캡처 확인. 금액 원단위 계산/운영 Firebase/React 기능 변경 없음. 새 패키지 없음.
- 정성 점검: 구조/흐름/상태 각 4/5. 근거: 전용 금액 formatter와 뽑기 위젯 분리, 소형 화면 회귀 테스트, 시뮬레이터 캡처. 액션: 발견된 overflow와 금액 테마 문제 수정. 실물 기기 파일/공유 QA는 남음.

[금액·뽑기·장부 UI 수정 화면](screenshots/ui-polish-overview.png)

## 세 보조 도구와 메인 간격 재구성

- 대상: 금액 가이드, 예정 비용, 축의금 장부 내부 화면 + 메인 진입 영역.
- `widgets/tool_layout.dart`에 공통 페이지/소개/카드/라벨/입력/선택/날짜 컴포넌트를 추가. 수평 여백 20px, 카드 내부 20px, 라벨→입력 8px, 필드 사이 20px, 주요 섹션 사이 24px로 기준화.
- 입력칸 안의 떠오르는 라벨을 외부 라벨로 분리하고 회색 입력면·통일된 모서리·포커스 테두리를 적용. 카드마다 달랐던 기본 ListTile/입력 장식과 불규칙 여백을 제거.
- 가이드: 질문 카드, 참고 결과 카드, 이름/이력 카드 구분. 친밀도는 전체 폭 선택지. 하단 주요 동작 고정.
- 계산기: 계획 월/예산, 합계, 예정 행사 입력을 구분. 이름/종류 사이에 없던 여백 추가. 빠른 금액과 가이드 진입 간격 분리.
- 장부: 결혼식 날짜/저장 합계를 한 카드로 정리. 하객 이름/금액/관계는 같은 외부 라벨/입력 규격으로 통일. CSV 영역도 같은 규격 적용.
- 메인: 모드/도구/검색 사이 20px, 검색→필터도 20px 기준. 잘리던 카테고리 가로 목록을 선택 메뉴로 변경. 선택값/기록 수/보기 전환을 한 행에 정렬.
- 검증: `flutter analyze` 0 issues, 35개 단위/위젯 테스트 PASS. 실제 라벨/입력/필드 간 좌표를 검증하는 테스트 2개 추가. iOS 화면 드라이버 및 Android APK 빌드 확인.
- 기능/계산식/DB/새 의존성 변경 없음. 공통 컴포넌트 구조, 사용자 흐름, 상태 관리 자가 평가 각 4/5. 근거: 사용자 피드백 영역을 공통 규격으로 교체하고 좌표·작은 화면 회귀 검사. 액션: 화면 캡처를 기준으로 간격 확인.

[메인·가이드·예정 비용·장부 간격 수정 캡처](screenshots/tool-layout-overview.png). 가이드 결과와 예정 행사 입력까지 스크롤해 확인했으며, 전체 폭 하단 버튼을 반영한 iOS 캡처입니다. 최신 앱을 iPhone 17 Pro 시뮬레이터에 다시 빌드해 실행했습니다.

## 2026-11-18 — 독립 앱 전체 기록 백업·복원

- 사용자 확인: 기존 버전의 iPhone 실기기 점검 완료. 앱인토스 연동은 하지 않으며 포트폴리오 작업은 배포 완료 후 진행.
- 설정 → 기록 백업·복원: 보낸/받은 모든 기록을 버전 1 JSON 파일로 내보내기. 이름·관계·금액·날짜·프로필·중요 표시·ID·작성일 보존. 보기 설정과 미저장 초안 제외. 암호화되지 않은 개인정보 파일임을 화면에 안내.
- 파일 선택 뒤 전체/추가/동일/충돌 건수와 추가 금액 확인. 같은 ID는 현재 기록을 유지하며 없는 ID만 추가. 반복 복원으로 중복이 생기지 않음. 취소/잘못된 파일/실패 시 기존 기록 유지. 새 파일 선택 시 이전 미리보기 제거.
- UTF-8/BOM, 형식 식별자, 버전, 필드 타입, ID 중복, 금액/날짜, 최대 10MB/10,000건 검증. 복원 목록 전체를 검증한 뒤 SQLite 트랜잭션으로 일괄 추가. DB 스키마 변경 없음.
- Gate 1 PASS: Dart 포맷, `flutter analyze` 0 issues, 단위/위젯 41개 통과. Android debug APK 빌드 성공. React 소스/TypeScript/의존성은 변경하지 않았으며 이 작업에서 root 빌드는 재실행하지 않음.
- Gate 2: 신규 의존성 없음. 기존 file_picker/share_plus 사용. 파일/건수 상한 적용. 성능 SLA와 release 크기 목표는 지정되지 않았으며 처리 시간 벤치마크는 하지 않음.
- Gate 3: 구조 4/5 — domain codec/preview, data 파일/SQLite 경계, Riverpod 갱신, UI 분리. 흐름 4/5 — 명시적 복원 버튼 전 미리보기, 취소·재시도, 기존 ID 보존. 상태 4/5 — 복원 트랜잭션 성공 뒤 조회 실패를 저장 실패와 구분. Evidence: codec·위젯·실제 SQLite 테스트. Action: 작은 화면 320px/글자 1.8배, 실패 재시도/반복 복원 회귀 검사 추가.
- iOS 통합 검사 PASS: 실제 임시 JSON 파일과 SQLite로 백업→기존 기록 수정→복원→기존 값 보존→반복 복원 방지. 별도 `howmuch-backup-test.db`만 사용. migration_test에서 복원 도중 trigger 오류를 발생시켜 rollback 및 기존 DB 보존, 재실행 후 유지 검증.
- OS 공유·파일 선택 경계는 통합 테스트에서 대체했음. 새 기능의 iPhone 실제 공유 창/파일 선택은 추가 수동 확인 대상. 이전 버전 실기기 확인과 구분.
- 계산 규칙/운영 Firebase/토스 연동/배포 변경 없음. 사용자 기기 데이터 삭제 없이 별도 테스트 DB 사용.

[백업·미리보기·복원 결과 캡처](screenshots/backup-overview.png)

## 2026-11-18 — 지정 로고·파란 시작 화면

- 사용자가 지정한 로고와 일치하는 로컬 600×600 PNG를 원본으로 보관. iOS AppIcon 15종, Android 5밀도 런처/adaptive icon, 1024px/512px 스토어 파일 생성. 1024px 파일은 업스케일이며 새 고해상도 그림을 재생성하지 않음.
- iOS LaunchScreen: 원본 테두리 색 #0C67F5 전체 배경, 240×240pt 로고를 화면 중심에 제약조건으로 고정. Android 레거시/12+ 및 다크 모드에도 같은 배경과 중앙 로고 적용. Android 12+와 adaptive icon은 시스템 안전 영역을 고려한 캔버스 사용.
- Gate 1 PASS: iOS 시뮬레이터 debug 빌드, Android debug APK 빌드 성공. iOS 모든 PNG 규격/불투명 RGB 확인, 네이티브 XML 파싱과 git diff whitespace 확인. Dart/TS 로직 및 의존성 변경 없음. 앱 테스트 41개는 직전 백업 작업에서 통과했으며 네이티브 이미지 교체만으로 재실행하지 않음.
- Gate 2: 새 런타임 의존성 없음. Python 생성 스크립트는 기존 환경의 Pillow 사용. branding 원본/스토어 약 1.6MB, Android res 전체 약 4.2MB, iOS xcassets 전체 약 2.1MB. release 번들 증감은 측정하지 않음.
- Gate 3: 구조 4/5 — 원본과 재생성 스크립트 보관. 흐름 4/5 — OS 시작 화면에서 Flutter 첫 화면으로 전환, 인위적 지연 없음. 상태 4/5 — 데이터/상태 수정 없이 네이티브 리소스만 교체. Action/Evidence: 실제 iOS cold launch 연속 캡처에서 앱 아이콘→파란 중앙 로고→메인 화면 전환을 확인. debugger 대기 중 배경만 보인 캡처는 정상 실행 프레임으로 대체.
- Android는 빌드와 마스크 미리보기까지 확인했으며 실제 기기 시작 화면/런처는 미확인. 스토어 제출/계정·서명 변경 없음.

[실제 iOS 시작 화면](screenshots/ios-launch.png) · [아이콘·시작 배치 미리보기](screenshots/branding-preview.png)

플랫폼 기준: [Android adaptive icon](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive), [Android SplashScreen](https://developer.android.com/reference/androidx/core/splashscreen/SplashScreen).

## 2026-11-18 — 기존 앱인토스 등록 자료 보관

- 사용자가 열어둔 Chrome 콘솔 탭만 조작. 기본 정보/노출 단계의 앱 이름·영어 이름·부제·상세 설명·문의 이메일·키워드·주요 기능·출처별 항목을 `store/appintoss-reference/metadata/original.json`에 복사. 임시저장/검토 요청/필드 수정 없음.
- 미리보기 이미지 4장을 Chrome ‘이미지를 다른 이름으로 저장’으로 원본 다운로드. 각 636×1048. 원본 파일명/바이트/SHA-256을 manifest에 보존하고 전체 파일 열기/해시 확인 PASS. 콘솔 로고 원본도 보관.
- `store/ios-draft/ko/`에 복사 가능한 텍스트 파일 생성. 원문과 iOS 준비 메모를 구분. 기존 토스 UI/TDS 그림은 Flutter 실제 화면으로 교체가 필요한 참고 자료임을 명시. 앱인토스 연령/카테고리/딥링크를 iOS로 자동 매핑하지 않음.
- Gate 1: JSON 파싱, PNG 무결성/해상도, 4개 파일 SHA-256, 텍스트 원문 일치 확인 PASS. 자료·문서만 추가했으므로 코드 테스트/빌드는 재실행하지 않음.
- Gate 2: 런타임 의존성/번들 영향 없음. 자료는 native/Dart asset manifest에 등록하지 않음.
- Gate 3: 구조 4/5 — 원본/복사용 문구/출처 분리. 흐름 4/5 — 순서 있는 contact sheet와 안내. 상태 4/5 — 콘솔 상태 보존, 로컬 복사만 수행. Evidence/Action: 다운로드 파일을 실제 열어 확인하고 원본 해시/해상도 기록.

## 2026-11-18 — 독립 앱 노션 개인정보처리방침·고객지원

- 기존 앱인토스 약관을 변경하지 않고 개인정보처리방침·고객지원 두 페이지를 Notion MCP로 생성. 두 문서에 상호 링크를 추가하고 다시 읽어 마지막 절과 주요 내용 저장을 확인. 목적지가 지정되지 않아 MCP 기본 규칙에 따라 비공개 초안으로 생성. 웹 게시 도구가 없어 공개 URL/앱 내 링크 연결은 미완료 상태로 명시.
- 현재 Flutter 코드의 로컬 기록/설정/초안, JSON/CSV·OS 공유·OS 백업, 광고/추적 SDK 미적용, 이메일 문의, 삭제/복원 동작을 문서에 반영. 공개 서비스 약관의 토스 로그인·정산 문구는 가져오지 않음.
- Gate 1 PASS: 문서 저장/내용 readback, 로컬 JSON·Markdown 사본, 압축파일 무결성, git whitespace 검사. 실행 코드 변경이 없어 앱 테스트·빌드는 반복하지 않음.
- Gate 2: 런타임 의존성/앱 asset 등록 변경 없음.
- Gate 3: 구조 4/5 — 기존 미니앱/독립 앱 문서와 공개 상태 분리. 흐름 4/5 — 사용법·백업·복원·삭제 FAQ와 문의처. 상태 4/5 — 공개 URL은 null로 기록하고 공개 완료로 표시하지 않음. Evidence/Action: 공개 상태를 store/legal/notion-pages.json에 기록하고 두 문서 readback 확인.
- 사용자 선호 반영: 홍보 이미지 디자인 유지, 필요 시 규격 조정만 검토. Apple 멤버십 미결제, 포트폴리오는 배포 뒤. 스토어 등록·약관 수락·공개 권한 변경 없음.

## 2026-11-18 — 노션 공개 게시·앱 링크·기존 이미지 iOS 규격 준비

- 사용자 요청 1~3 단계 수행. 기존 Chrome 창의 Notion 게시 기능으로 개인정보처리방침/고객지원 두 페이지만 공개. 검색 엔진 인덱싱은 기본 꺼짐 유지. 기존 앱인토스 약관/다른 페이지 권한 변경 없음.
- 공개 주소는 small-heather-964.notion.site의 각 페이지 ID 경로. 로그인 없는 별도 브라우저에서 두 문서 본문과 상호 링크를 확인. 단순 HTTP 수집기는 Notion 자동화 차단으로 403이므로 브라우저 실제 표시를 기준으로 판정.
- 설정에 개인정보처리방침/고객지원·문의 버튼 추가. 외부 브라우저 실행 실패/예외 시 복사 가능한 주소와 복사 버튼 제공. URL은 data/service_links.dart에 모으고 실행 함수를 Riverpod으로 주입해 위젯 흐름 검증.
- 기존 홍보 이미지 4장을 자르거나 늘이거나 그림/문구를 변경하지 않고 contain 방식으로 배치. iPhone 1320×2868, 1284×2778, iPad 2048×2732 각 4장(총 12장), RGB 불투명 PNG로 생성. 원본 대비 종횡비 차이는 #232832 여백으로 처리. 원본 이미지의 선명도 한계는 유지.
- Gate 1 PASS: Dart 포맷, flutter analyze 0 issues, 단위/위젯 44개 통과. iOS native smoke는 개인정보/고객지원 각각 앱을 foreground로 실행해 launchUrl 성공 확인. iOS 빌드 및 Android debug APK 빌드 성공. 기존 이미지 해시/규격/출력 픽셀 비교와 ZIP 무결성 검사 PASS. React 소스 변경 없어 root 빌드는 반복하지 않음.
- 첫 iOS smoke에서 Safari를 연 뒤 앱이 백그라운드인 채 두 번째 URL 실행이 false를 반환함. 실제 사용자 흐름과 맞게 각 URL을 별도 foreground 실행에서 검사하도록 고쳐 두 실행 모두 통과. 앱 동작을 테스트 성공을 위해 바꾸지 않음.
- Gate 2: 새 직접 의존성 url_launcher 6.3.3(공식 Flutter URL 실행 플러그인), 추가 플랫폼 구현 android/ios/macos 3개. 분석/광고 SDK 추가 없음. 홍보 출력 파일은 스토어 자료에만 보관하며 앱 asset manifest에 등록하지 않음. release 용량/성능 SLA는 측정하지 않음.
- Gate 3: 구조 4/5 — 공개 URL/OS 실행 경계 분리, 원본·출력·manifest·재생성 스크립트 보관. 흐름 4/5 — 설정에서 외부 페이지 진입, 실패 시 복사 대안. 상태 4/5 — 공개 확인 상태와 URL을 JSON/등록 파일에 기록. Evidence/Action: 실제 iOS 설정 캡처·네이티브 URL 실행, 위젯 실패/예외 검사, 이미지 원본 전체 영역 픽셀 비교.
- 제출 자료: store/ios-submission-assets.zip에 12장 이미지·아이콘·문구·공개 URL·안내 포함. App Store Connect에 업로드하거나 심사 승인을 받은 상태는 아님. Apple 멤버십 결제/가입·약관 동의·배포 서명·스토어 등록은 수행하지 않음.

[설정의 공개 링크](screenshots/settings-service-links.png) · [iPhone 이미지 미리보기](../store/ios-upload/iphone-large-1320x2868-preview.jpg) · [제출 파일 ZIP](../store/ios-submission-assets.zip)

## 2026-11-18 — Mac 환경·iOS Release 준비 마무리

- 사용자 요청에 따라 Apple 멤버십 처리 대기 중 독립적으로 가능한 환경 구성을 마무리. 사용자가 Xcode Apple 계정 로그인/이중 인증을 직접 완료했고, Apple Accounts에서 Personal Team 표시를 확인. Runner.xcworkspace를 Xcode에서 열어둠. 유료 Team은 아직 확인되지 않아 임의 Team ID/배포 인증서 생성 없이 기록.
- flutter doctor -v: Flutter 3.50.0/Dart 3.14.0, Android SDK 36/JDK 17/라이선스, Xcode 26.4/iOS SDK 26.4/CocoaPods 1.16.2 등 모든 항목 정상. Apple 현재 업로드 최소 SDK 기준(Xcode 26+/iOS 26 SDK+) 확인.
- scripts/prepare_ios_release.sh: 필수 검사 → flutter build ipa --release --no-codesign → archive 구조 검사. VS Code tasks.json에 검사/Release 준비/기존 archive 검사 명령 등록.
- scripts/inspect_ios_archive.py: Bundle ID·버전·빌드·기기 SDK·AOT 프레임워크·엔진·debug kernel 제외·dSYM·PrivacyInfo 검사. 기기용 Release 아카이브와 시뮬레이터 빌드를 구분. 결과는 ignored build/ios/release-readiness.json에 저장. 단순 구조 검사와 Apple 배포 검증을 구분하며 업로드 완료로 표시하지 않음.
- Gate 1 PASS: 새 Release 준비 스크립트를 실제 끝까지 실행. 포맷 0 변경, analyze 0 issues, 44개 테스트 통과. Xcode Release archive 성공(180.2MB), 현재 버전 1.0.0(1), Bundle ID com.howmuchjournal.howmuch, iOS 15.0 이상, iPhone/iPad. 검사 스크립트의 추가 device SDK 검사도 별도 실행해 통과.
- Gate 2: 앱 기능/DB/직접 의존성 변경 없음. build 산출물은 ignored이며 git에 추가하지 않음. Release 아카이브 180.2MB는 dSYM 등을 포함한 개발 산출물 크기로 다운로드 IPA 크기가 아님. 개인정보 manifest 6개 포함 확인.
- Gate 3: 구조 4/5 — 반복 가능한 준비 명령과 별도 read-only archive 검사. 흐름 4/5 — VS Code/Xcode 진입점, 활성화 후 절차 문서화. 상태 4/5 — 결제 완료와 멤버십 활성화를 분리하고 유료 Team ID/앱 레코드 ID는 미확인 null 유지. Evidence/Action: 실제 전체 스크립트 실행과 archive 파일 검사, Xcode 계정/프로젝트 UI 확인.
- 원격 combined status에는 Vercel success만 반환. GitHub CLI 미인증이므로 Flutter Actions 성공으로 간주하지 않음. 최신 Flutter 검증은 로컬 44개 통과로 구분.
- Apple 계정 페이지는 마지막 확인 시 ‘대기 중’과 최대 48시간 처리 안내. 연결된 메일에서 확인한 메시지는 구매 주문 확인. App Store Connect에서 앱 생성 메뉴가 나타나지 않은 상태. 계정/결제 개인정보·비밀번호/인증서/프로비저닝은 저장소에 기록하지 않음.
- 미수행: 배포용 서명과 IPA export, Apple Validate App, App ID/앱 레코드 등록, 업로드/심사 제출. 현재 환경 준비 완료와 실제 배포 완료를 구분.
