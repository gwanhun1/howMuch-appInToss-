# 스토어 등록 자료

2026-11-18, 사용자가 열어둔 Google Chrome의 앱인토스 콘솔 탭에서 복사했습니다. 새 브라우저/탭을 만들지 않고 기존 등록 편집 화면의 기본 정보·카테고리/노출 정보를 읽고 이미지 원본을 저장했습니다. 콘솔 저장·검토 요청은 실행하지 않았습니다. 현재 공개된 앱 설명과 동일한지는 별도로 확인하지 않았습니다.

## 보관 자료

- [등록 이미지 4장 한눈에 보기](appintoss-reference/contact-sheet.jpg)
- [이미지 원본](appintoss-reference/screenshots/): 01~04.png, 모두 636×1048. 리사이즈/문구 수정 없이 다운로드 원본 보관.
- [콘솔 앱 로고 원본](appintoss-reference/app-logo.png)
- [등록 정보 원문 JSON](appintoss-reference/metadata/original.json)
- [원본 파일명·해상도·SHA-256](appintoss-reference/assets-manifest.json)
- [iOS 복사·붙여넣기 문구](ios-draft/ko/): 이름, 영어 이름, 부제, 설명, 키워드, 문의 이메일. 원문에서 복사한 초안이며 iOS 제출 확정본은 아닙니다.

## 복사한 기본 정보

| 항목 | 원문 |
|---|---|
| 한국어 앱 이름 | 얼마냈지요 |
| 영어 앱 이름 | Howmuchmoney |
| 부제 | 경조사에서 오간 금액을 기록 |
| 고객 문의 이메일 | wjdrhksgns7602@gmail.com |
| 앱인토스 식별 이름 | howmuch-money |
| 앱인토스 사용 연령 | 만 19세 이상 |
| 앱인토스 카테고리 | 일상·생활 > 결혼·경조사 > 경조사비 |
| 한국어 주요 기능 | 축의금과 부의금 기록하기 |
| 영어 주요 기능 | Record Gift Money |
| 앱인토스 주요 기능 진입 | intoss://howmuch-money/main |
| 다크 모드 전용 로고 | 등록된 파일 없음 |

### 상세 설명 원문

```text
경조사에서 주고받은 돈을 기록하고 관리할 수 있어요.
이름, 카테고리, 금액을 입력하면 기록이 완료돼요.
보낸 돈과 받은 돈을 스와이프로 전환하며 확인할 수 있어요.
축의금·조의금·돌잔치·용돈별로 필터링해서 볼 수 있어요.
총 얼마를 주고받았는지 한눈에 요약해서 보여줘요.
```

### 검색 키워드 원문

```text
축의금,경조사,부조금,결혼,장례,조의금,용돈,돌잔치,부의금,기록
```

## 이미지 순서

1. 경조사비를 간편하게 기록하고 관리 — 메인 카드 화면.
2. 프로필 아이콘 선택.
3. 이름·카테고리·금액 입력, 관계·날짜 저장.
4. 금액 입력과 빠른 금액 선택.

## iOS 제출 전 정리할 항목

- 문구는 `ios-draft/ko/`에서 바로 복사할 수 있습니다. 새로 추가한 JSON 백업·복원이나 오프라인 저장 설명은 아직 원문에 덧붙이지 않았습니다.
- 이미지 4장은 사용자 결정에 따라 기존 디자인을 유지합니다. iOS 업로드 규격에 맞춘 크기 조정이 필요한지는 제출 전에 확인합니다. 원본에는 토스 상단바·기존 프로필 그림·현재 Flutter 버전과 다른 화면이 포함돼 있다는 출처 기록을 남깁니다.
- 원본 해상도는 636×1048입니다. [iOS 업로드용](ios-upload/README.md)에 iPhone 1320×2868·1284×2778, iPad 2048×2732 파일을 각각 4장 준비했습니다. 원본 비율과 전체 그림을 보존하며 여백만 추가했습니다.
- 앱인토스 `intoss://` 주소, 카테고리, ‘만 19세 이상’은 출처 보존용입니다. 독립 iOS 앱의 링크·카테고리·연령 등급으로 자동 이전하지 않습니다.
- 개인정보처리방침과 고객지원은 독립 앱용 노션 문서로 새로 작성했습니다. [문서 및 공개 상태](legal/README.md)를 확인하세요. 두 페이지는 공개 게시 및 비로그인 열람 확인을 마쳤고 앱 설정에도 연결했습니다. 저작권 명의는 읽은 등록 화면에 없어 별도 확인이 필요합니다.
- 로고 스토어용 파일은 [1024px](../assets/branding/app-icon-1024.png), [512px](../assets/branding/google-play-icon-512.png)에 준비돼 있습니다.

출처 콘솔: https://apps-in-toss.toss.im/workspace/17227/mini-app/howmuch-money/meta/edit?step=0

이미지·노출 출처: https://apps-in-toss.toss.im/workspace/17227/mini-app/howmuch-money/meta/edit?step=1

iOS 스크린샷 규격 출처: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/

최신 제출 자료 묶음: [ios-submission-assets.zip](ios-submission-assets.zip). 업로드 가능한 크기의 이미지·등록 문구·공개 개인정보/지원 URL을 포함합니다.
