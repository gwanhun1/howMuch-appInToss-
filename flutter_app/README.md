# 얼마냈지요 · Flutter

기존 토스 미니앱의 기능·사용 흐름을 Android/iOS에서 독립 구현한 앱입니다. Flutter 3.50.0 / Dart 3.14.0. 로그인 없이 SQLite에 저장하며 기존 토스 사용자·Firebase 데이터와 연결하지 않습니다.

## Mac에서 실행

```sh
cd flutter_app
flutter pub get
./scripts/run_ios.sh
```

이미 이 Mac에 Flutter, Xcode, CocoaPods, iPhone 시뮬레이터와 Android 빌드용 SDK/Java를 준비했습니다. `flutter doctor -v`로 확인할 수 있습니다. 실행 중 `r`은 hot reload, `R`은 hot restart, `q`는 종료입니다. VS Code에서 이 폴더를 열고 권장 Flutter/Dart 확장을 설치해 실행할 수도 있습니다.

## iPhone 실기기

1. USB로 연결하고 잠금을 해제한 뒤 ‘이 컴퓨터를 신뢰’를 허용합니다.
2. iPhone 설정 → 개인정보 보호 및 보안 → 개발자 모드를 켭니다.
3. `open ios/Runner.xcworkspace`로 Xcode를 엽니다.
4. Xcode Settings → Accounts에서 본인 Apple 계정을 등록합니다.
5. Runner → Signing & Capabilities → Team에 Personal Team을 선택합니다.
6. 필요하면 Bundle Identifier를 본인 고유 ID로 바꿉니다. 현재는 개발용 `com.howmuchjournal.howmuch`입니다.
7. 연결한 기기를 선택해 Run하거나 `flutter devices`, `flutter run -d <기기-ID>`를 사용합니다.

무료 계정은 기기 실행과 서명 기간에 제한이 있습니다. Apple 로그인·기기 신뢰·개발자 모드는 사용자가 설정해야 합니다. 사용자가 Apple 멤버십 구매와 Xcode 계정 로그인을 완료했으며, 확인 시점에는 유료 Team 활성화 대기 상태입니다. 스토어 배포는 아직 하지 않았습니다.

## 기능

- 보낸/받은 마음 토글·스와이프, 카테고리 필터, 카드 그리드/목록 보기, 카테고리별 합계
- 즐겨찾기·날짜·작성일 순 정렬, D-day, 모드/보기 설정 유지
- 이름·관계별 검색 그룹, 양 모드 합계, 그룹 내 기록 편집
- 기록 바텀시트, 프로필 선택/저장/취소, 관계·날짜 펼치기, 중요 표시, 수정·삭제 확인
- 별도 금액 화면, 간편 금액, 최근/최빈 금액, 입력 검증, 저장 실패 시 입력 유지
- 금액 가이드: 행사·관계·친밀도·참석, 같은 이름 내역/최근 지출, 기록 및 계산기 연결
- 예정 비용: 계획 월, 예산, 최대 50행, 빠른 금액, 행사별 건수, 미입력/범위 초과 제외, 초과/잔액
- 축의금 장부: 날짜별 내역·합계, 최대 25명 직접 입력, CSV 추가·검증·중복 확인·트랜잭션 저장·내보내기
- 장부/계산기 미저장 입력은 앱의 현재 실행 동안 화면을 다녀와도 유지
- 전체 기록 JSON 백업·복원: 미리보기, 기존 기록 보존, 반복 복원 중복 방지
- 설정에서 공개 개인정보처리방침·고객지원 열기, 브라우저 실행 실패 시 주소 복사
- 금액 카드 뽑기·다시 섞기·클립보드 복사, 사용법 재생, 이용 안내/개인정보/전체 삭제

[기능 대응표](docs/feature-parity.md)와 [검증 보고서](docs/verification.md)에 구현 범위와 남은 실기기 확인을 기록했습니다.

## 프로필 자산

TDS 전용 SVG는 앱인토스 외부 이용이 제한되어 포함하지 않았습니다. 공식 배포의 **토스페이스 원본 TTF**를 수정 없이 포함하고, 15개 일반 이모지로 대체했습니다. 기존 쿼카·드래곤 등과 동일한 그림은 아닙니다. 기존 이모지 기록도 표시할 수 있습니다.

출처는 앱 화면/설정에, 저작권 안내와 라이선스는 `assets/licenses/` 및 앱 라이선스 화면에 포함했습니다. [공식 라이선스](https://toss.im/tossface/copyright), [공식 원본](https://github.com/toss/tossface). 폰트는 약 12MB입니다. [사용 범위 조사](docs/profile-assets-review.md).

## 구조와 React 간 공유

```text
lib/domain/  기록 모델·계산·검색·CSV·표시 규칙
lib/data/    저장소 인터페이스, SQLite 및 마이그레이션
lib/state/   Riverpod 기록 상태·장부/계산기 세션
lib/ui/      메인·편집·금액·가이드·예산·장부·공통 위젯
```

React hook/Zustand와 Flutter Riverpod은 런타임이 달라 직접 공유하지 않습니다. `../shared/business-rules.json`의 같은 예제를 Vitest와 Flutter 테스트가 각각 읽어 결과를 검증합니다. `../shared/design-tokens.json`에서 `python3 scripts/generate_design_tokens.py`로 Dart 색상을 생성합니다. React는 기존 TDS 색상 구현을 유지합니다.

## 테스트

```sh
./scripts/check.sh
./scripts/test_ios.sh
flutter test integration_test/migration_test.dart -d <기기-ID>
flutter test integration_test/backup_test.dart -d <기기-ID>
flutter drive --driver=test_driver/screenshots.dart --target=integration_test/app_test.dart --dart-define=CAPTURE_SCREENSHOTS=true -d <기기-ID>
flutter build ios --simulator --debug
flutter build apk --debug
```

스크린샷 드라이버는 `docs/screenshots/`에 실제 iOS 화면을 저장합니다. DB 테스트는 `howmuch-integration.db`, `howmuch-migration-test.db`, `howmuch-backup-test.db`만 초기화합니다. 일반 앱 `howmuch.db`는 유지합니다. GitHub Actions는 정적 분석·단위·위젯 테스트를 실행합니다. iOS 테스트는 로컬에서 실행합니다.

CSV 연습 파일: `examples/wedding-guests.csv` (UTF-8, 예시 이름, 날짜 열이 없어 선택 날짜로 입력).

## 저장과 출시 범위

일반 기록은 SQLite에 영구 저장합니다. DB v1→v2는 기존 기록을 보존하며 정렬용 작성일 열을 추가합니다. 보기 설정만 SharedPreferences에 저장합니다. 미저장 장부/계산기는 현재 앱 실행 중에만 유지합니다.

앱을 삭제하면 기록이 사라질 수 있습니다. OS 설정에 따라 운영체제 백업이 적용될 수 있습니다. CSV는 축의금 장부 전용입니다. 설정 → 기록 백업·복원에서 전체 기록을 JSON 파일로 보관할 수 있습니다. 버전 1 백업은 최대 10MB/10,000건이며 이름·관계·금액·날짜·프로필·중요 표시·작성일·ID를 보존합니다. 보기 설정과 미저장 초안은 제외합니다. 파일은 암호화되지 않으며 사용자가 보관 위치를 선택합니다. 복원 전 추가/동일/충돌 건수를 표시하고, 같은 ID는 현재 기기의 기록을 보존합니다. 새 기록은 하나의 SQLite 트랜잭션으로 추가하며 같은 백업을 반복해도 중복 저장되지 않습니다. 로그인·클라우드 동기화·토스 기록 이전·토스 Analytics는 적용하지 않습니다.

기존 버전 iPhone 실기기 점검은 사용자 확인으로 완료했습니다. 새 백업 기능의 파일 선택·공유 시트와 Android 실기기는 추가 확인 대상입니다. 앱 아이콘·공개 정책/지원 페이지·스토어 자료는 준비했습니다. Bundle ID 등록과 배포 서명은 유료 Team 활성화 확인 후 진행합니다. Android release 설정은 아직 개발용 서명입니다.

2026-11-18: 사용자가 기존 버전의 iPhone 실기기 점검 완료를 알려주었습니다. 이후 추가된 백업 기능의 OS 공유 창/파일 선택은 별도 실기기 확인이 필요합니다. 앱인토스 연동은 진행하지 않으며 포트폴리오 정리는 배포 완료 뒤 진행합니다.

## 앱 아이콘과 시작 화면

사용자가 지정한 파란 꽃·봉투·원화 로고를 `assets/branding/app-icon-source.png`에 보관합니다. 원본은 600×600이며 1024px 스토어 파일은 원본을 리사이즈한 것입니다. 그림을 재생성하거나 라운드 모서리를 원본에 추가하지 않습니다.

`python3 scripts/generate_brand_assets.py`로 iOS AppIcon/LaunchImage, Android 밀도별 런처·adaptive icon·시작 화면, Google Play용 512px 이미지를 생성합니다(Pillow 필요). 시작 배경은 원본 가장자리의 `#0C67F5`, 로고는 중앙 240pt/dp 기준입니다. Android 12 이상은 시스템 스플래시 규격에 맞춘 캔버스를 사용합니다. OS가 첫 화면을 표시할 때까지 유지하며 인위적인 대기 시간을 추가하지 않습니다.

## 스토어 등록 문구·이미지 원본

기존 앱인토스 콘솔에서 복사한 미리보기 4장·로고·등록 문구와 iOS 복사용 텍스트는 [store/README.md](store/README.md)에 정리했습니다. 기존 이미지와 iOS 제출 전 교체할 항목을 구분합니다.

노션 두 문서 공개 게시·비로그인 열람 확인과 앱 설정 연결을 완료했습니다. iPhone/iPad 등록 규격별 기존 홍보 이미지·공개 URL·문구 묶음은 [iOS 등록 자료](store/ios-upload/README.md), [다운로드 ZIP](store/ios-submission-assets.zip)에 있습니다. 사용자가 Apple 멤버십 구매를 완료했습니다. 스토어 등록/심사 제출은 아직 하지 않았습니다.

## Release 빌드 환경

`bash scripts/prepare_ios_release.sh`로 필수 검사 → 서명 없는 iOS Release 아카이브 → 구조 검사를 실행합니다. VS Code Run Task에도 등록했습니다. 현재 계정/서명 상태와 활성화 후 절차는 [배포 준비 상태](store/release/README.md)에 있습니다.

## Oracle API 데모 모드

`HOWMUCH_API_URL`에 디버그용 HTTP 주소를 지정하면 앱 시작 시 서버 데모 로그인이 표시됩니다. HTTPS 주소를 지정한 배포 빌드는 기기 기록을 먼저 열며, 설정에서 **서버 기록 사용하기**를 선택할 수 있습니다. 배포 빌드의 계정 생성에는 HTTPS 개인정보처리방침 주소인 `HOWMUCH_PRIVACY_URL`이 필요합니다.
로그인한 계정의 기록은 Oracle의 FastAPI와 PostgreSQL을 사용합니다.
이 옵션을 생략한 실행은 별도 로그인 없이 기존 SQLite 저장소를 사용합니다.

~~~sh
# 별도 터미널에서 LogMe 서버에 연결합니다.
ssh -N -o ExitOnForwardFailure=yes -L 18010:127.0.0.1:8010 USER@ORACLE_HOST

# iOS 시뮬레이터
flutter run -d IOS_SIMULATOR_ID \
  --dart-define=HOWMUCH_API_URL=http://127.0.0.1:18010 \
  --dart-define=HOWMUCH_API_ORIGIN=http://127.0.0.1:8010
~~~

Android 에뮬레이터에서는 API URL의 호스트를 `10.0.2.2`로 바꾸고 Origin은 그대로 둡니다.
로그인 정보는 서버 관리자가 생성한 데모 계정을 사용합니다.
로컬 백업·복원 및 전체 삭제는 SQLite 모드에서 제공합니다.
