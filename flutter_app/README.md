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

무료 계정은 기기 실행과 서명 기간에 제한이 있습니다. Apple 로그인·기기 신뢰·개발자 모드는 사용자가 설정해야 합니다. 유료 등록이나 스토어 배포는 하지 않았습니다.

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
flutter drive --driver=test_driver/screenshots.dart --target=integration_test/app_test.dart --dart-define=CAPTURE_SCREENSHOTS=true -d <기기-ID>
flutter build ios --simulator --debug
flutter build apk --debug
```

스크린샷 드라이버는 `docs/screenshots/`에 실제 iOS 화면을 저장합니다. DB 테스트는 `howmuch-integration.db`, `howmuch-migration-test.db`만 초기화합니다. 일반 앱 `howmuch.db`는 유지합니다. GitHub Actions는 정적 분석·단위·위젯 테스트를 실행합니다. iOS 테스트는 로컬에서 실행합니다.

CSV 연습 파일: `examples/wedding-guests.csv` (UTF-8, 예시 이름, 날짜 열이 없어 선택 날짜로 입력).

## 저장과 출시 범위

일반 기록은 SQLite에 영구 저장합니다. DB v1→v2는 기존 기록을 보존하며 정렬용 작성일 열을 추가합니다. 보기 설정만 SharedPreferences에 저장합니다. 미저장 장부/계산기는 현재 앱 실행 중에만 유지합니다.

앱을 삭제하면 기록이 사라질 수 있습니다. OS 설정에 따라 운영체제 백업이 적용될 수 있습니다. CSV는 축의금 장부 전용으로 전체 기록 백업은 아닙니다. 로그인·클라우드 동기화·토스 기록 이전·토스 Analytics는 적용하지 않습니다.

실제 iPhone의 키보드·파일 선택·공유 시트, Android 실기기는 추가 검증이 필요합니다. 정식 앱 아이콘, 공개 개인정보처리방침/지원 페이지, 고유 앱 ID, 배포 서명과 스토어 자료도 출시 전에 준비해야 합니다. Android release 설정은 아직 개발용 서명입니다.
