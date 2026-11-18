# iOS 배포 준비 상태

확인일: 2026-11-18

## 완료한 로컬 환경

- Flutter 3.50.0 / Dart 3.14.0, Xcode 26.4 / iOS SDK 26.4, CocoaPods 1.16.2.
- Android SDK 36 / JDK 17, Android SDK 라이선스 동의 확인.
- `flutter doctor -v`: 모든 항목 정상.
- 사용자 직접 Xcode Apple 계정 로그인 완료. Runner.xcworkspace를 Xcode에서 열어둠.
- 현재 Xcode에는 Personal Team만 표시. 유료 개발 팀과 배포 인증서는 활성화 확인 후 연결.
- 포맷·정적 분석·44개 단위/위젯 테스트 통과.
- 실제 iOS 기기 SDK의 Release/AOT 아카이브 생성과 구조 검사 통과. 시뮬레이터 빌드와 구분.

## 실행 방법

flutter_app 폴더에서:

```sh
# 개발 실행
bash scripts/run_ios.sh

# 포맷·분석·테스트 → 서명 없는 Release 아카이브 → 구조 검사
bash scripts/prepare_ios_release.sh

# 이미 만들어진 Release 아카이브만 재검사
python3 scripts/inspect_ios_archive.py
```

VS Code에서는 flutter_app 폴더를 열고 Terminal → Run Task에서 같은 작업을 선택할 수 있습니다. Xcode 작업 파일은 `ios/Runner.xcworkspace`입니다.

생성 위치:

- 아카이브: `build/ios/archive/Runner.xcarchive`
- 검사 보고서: `build/ios/release-readiness.json`

아카이브에는 버전 1.0.0(1), Bundle ID `com.howmuchjournal.howmuch`, iOS 15.0 이상, iPhone/iPad 대상이 반영돼 있습니다. 앱 AOT 프레임워크·Flutter 엔진·디버그 심볼과 패키지 PrivacyInfo 6개를 확인합니다. 프레임워크의 개인정보 manifest 존재 확인은 심사 승인이나 App Store Connect 신고 완료를 뜻하지 않습니다.

현재 아카이브는 **서명 없는 준비 빌드**입니다. 설치·업로드용 IPA가 아니며, 유료 Team/프로비저닝 연결 후 다시 서명 빌드해야 합니다. 인증서/프로파일/비밀번호/키는 저장소에 보관하지 않습니다.

## Apple 계정 상태

사용자가 멤버십 구매를 완료했습니다. 확인 시점에 Developer 계정은 ‘대기 중’, Xcode는 Personal Team만 표시했고 App Store Connect에는 앱 생성 메뉴가 나타나지 않았습니다. 계정 페이지에는 구입 처리에 최대 48시간이 걸릴 수 있다고 안내돼 있었습니다. 이 상태만으로 중복 구입할 필요는 없습니다.

연결된 메일에서 확인된 것은 구매 주문 확인 메일입니다. 실제 계정의 멤버십 활성화·유료 Team 표시·App Store Connect 접근 상태로 다음 단계 가능 여부를 확인합니다. 주문 번호나 청구 주소 등 결제 정보는 이 문서에 기록하지 않습니다.

## 활성화 후 진행 순서

1. Apple Developer 계정에서 유료 멤버십/Team 정보를 확인하고 Xcode 계정 정보를 새로 불러옵니다.
2. Bundle ID 가용성을 확인하고 App ID 등록을 진행합니다. 현재 ID가 가용하지 않으면 코드 변경과 등록 정보를 함께 맞춥니다.
3. Xcode Runner의 Signing & Capabilities에서 유료 Team/자동 서명을 연결합니다. 현재 프로젝트에는 확인되지 않은 Team ID를 쓰지 않았습니다.
4. App Store Connect 앱 레코드를 생성합니다. 입력 준비값은 `app-record-draft.json`에 있습니다. 아직 생성한 레코드가 아닙니다.
5. `flutter build ipa --release`로 배포 서명 빌드, Xcode Validate App, 업로드를 진행합니다.
6. 개인정보/연령/배포 지역/가격/암호화 질문 등 등록 항목을 확인하고 작성합니다. TestFlight는 선택 사항이며 직접 출시 심사 제출도 가능합니다.
7. 최종 등록 화면과 빌드 상태를 확인하고 심사 제출을 진행합니다.

## 배포 전 점검

- [x] 로컬 필수 검사 44개 및 분석 통과
- [x] 현재 실행 파일 기준 Release 아카이브 구조 검사
- [x] 공개 개인정보/지원 URL과 앱 내 연결 확인
- [x] 기존 이미지 iPhone/iPad 규격 출력·원본 보존 검사
- [x] SDK 최소 업로드 기준 확인: Xcode 26+/iOS 26 SDK+에 현재 환경이 해당
- [ ] Flutter GitHub Actions의 최신 원격 결과 확인: GitHub CLI 미인증이며 연결 도구의 combined status에는 Vercel 성공만 반환됨. Flutter CI 성공으로 간주하지 않음
- [ ] 유료 Team 활성화·배포 서명·프로비저닝
- [ ] Apple App Store 배포 검증/업로드 처리 완료
- [ ] 최종 등록 정보와 심사 제출

## 중단·복구 기준

저장·삭제·백업/복원 중 데이터 손실, 실행 실패 또는 재현 가능한 치명적 오류가 발견되면 제출/출시를 중단하고 수정 후 다시 빌드합니다. 스토어에서 이미 배포한 버전은 Git을 되돌리는 것만으로 사용자 기기에 롤백되지 않으므로 새 버전/새 빌드 번호로 수정 업데이트를 제출해야 합니다. 일반 데이터베이스를 삭제하는 방식으로 문제를 해결하지 않습니다.

근거:

- https://docs.flutter.dev/deployment/ios
- https://developer.apple.com/news/upcoming-requirements/?id=04282026a
- https://developer.apple.com/help/glossary/testflight-beta-testing/
