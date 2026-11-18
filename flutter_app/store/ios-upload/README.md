# iOS 등록 자료

Apple 개발자 멤버십 결제 전에 준비한 파일입니다. App Store Connect 업로드·심사 제출은 아직 하지 않았습니다.

## 이미지

원본 그림·문구를 바꾸지 않고 가로세로 비율을 유지해 확대했습니다. 잘림·늘임 없이 남는 영역에는 #232832 여백을 넣었습니다. 새 고해상도 원본을 생성한 것은 아니므로 원본(636×1048)의 선명도 한계는 유지됩니다.

| 폴더 | 규격 | 수량 |
|---|---|---|
| screenshots/iphone-large-1320x2868 | iPhone Dynamic Island large / 1320×2868 | 4장 |
| screenshots/iphone-1284x2778 | iPhone Face ID large / 1284×2778 | 4장 |
| screenshots/ipad-13-2048x2732 | iPad 13인치 / 2048×2732 | 4장 |

앱 프로젝트는 iPhone과 iPad를 모두 대상으로 하므로 iPad 규격도 함께 준비했습니다. 같은 스크린샷 슬롯에는 폴더 하나의 01~04.png를 순서대로 사용합니다. 두 iPhone 세트를 같은 슬롯에 중복으로 넣지 않습니다. 최종 App Store Connect의 표시된 슬롯에 맞는 세트를 선택해주세요.

- [iPhone 미리보기](iphone-large-1320x2868-preview.jpg)
- [다른 iPhone 규격 미리보기](iphone-1284x2778-preview.jpg)
- [iPad 미리보기](ipad-13-2048x2732-preview.jpg)
- [원본·출력 해시, 픽셀 크기·배치 기록](screenshots-manifest.json)

이미지에는 기존 토스 미니앱 화면이 포함되어 있습니다. 사용자 지시에 따라 보존했으며 규격 적합성과 내용/권리/심사 적합성은 별개입니다. 이 파일 생성만으로 Apple 심사 승인을 확인한 것은 아닙니다.

## 문구·URL

`ko/`에 원문 앱 이름·영어 이름·부제·설명·키워드·문의 이메일과 공개된 `privacy_url.txt`, `support_url.txt`를 담았습니다. 영어 소개 번역은 포함하지 않았습니다. 문의 이메일은 지원 페이지 URL을 대신하는 필드가 아닙니다.

앱 아이콘 1024px: [app-icon-1024.png](app-icon-1024.png)

2026-11-18 확인 기준: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications

재생성: `python3 scripts/export_store_screenshots.py` (flutter_app 기준, Pillow 필요)
