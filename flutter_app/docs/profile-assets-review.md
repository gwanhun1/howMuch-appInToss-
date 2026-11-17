# 프로필 자산과 UI 차이 조사

2026-11-17 확인. 이 문서는 공개 정책의 기술적 적용 검토이며 별도 사용 허가를 받았다는 의미가 아닙니다.

## 기존 프로필

React의 `src/features/friend/components/form/ProfileImageBottomSheet.tsx`는 `@toss/tds-mobile`의 Asset.Icon으로 15종을 표시합니다.

`icon-face-cap`, `icon-face-bandana`, `icon-santa-face`, `icon-box-cat-grey-v2`, `icon-quokka`, `icon-anipang`, `icon-penguin-face`, `icon-dog-siback-face1`, `icon-fairy-face`, `icon-emoji-pig-face`, `icon-emoji-angry-face-with-horns`, `icon-emoji-cow-yellow`, `icon-mole`, `icon-king-blonde`, `icon-blue-dragon`.

설치된 TDS 구현의 SVG 기본 경로는 `https://static.toss.im/icons/svg/`입니다. 예시 자산 URL의 응답을 확인했습니다. 공개 URL로 받을 수 있다는 사실은 독립 앱 재배포 허가와 다릅니다. Flutter에서 SVG 렌더링은 기술적으로 가능하지만 권한 조건이 우선입니다. 다운로드한 조사용 예시는 앱 자산에 추가하지 않았습니다.

## 공식 정책

- 디자인 도구 / 그래픽 저작권: https://developers-apps-in-toss.toss.im/design/prepare/design.md
  - 제공 그래픽은 앱인토스 제휴 환경 내 서비스 운영 및 홍보 용도만 허용.
  - 다른 서비스나 매체에서 복제·수정·배포·전송·공중송신 등으로 활용하는 행위 금지.
- TDS 사용 범위: https://developers-apps-in-toss.toss.im/design/components.md
  - 앱인토스 서비스를 제공하기 위한 제한적인 권한.
- UI Kit: https://developers-apps-in-toss.toss.im/design/prepare/figma-ui-license
  - 다른 프로젝트·제품·서비스 사용 및 재배포 제한.

결론: 현재 공개 조건으로 기존 TDS 프로필 자산을 독립 Flutter 앱에 그대로 포함/원격 로드하는 방식은 사용 범위를 벗어납니다. 같은 서비스명 또는 무료·취업 포트폴리오 목적이라고 범위가 자동 확장된다는 예외는 확인하지 못했습니다. 정확히 같은 15종이 필요하면 토스의 별도 허가가 필요합니다. 문의는 보내지 않았습니다.

## 토스페이스는 별도

- 공식 저작권/라이선스: https://toss.im/tossface/copyright
- 공식 배포: https://github.com/toss/tossface

토스페이스 원본은 출처 표기와 저작권 안내/라이선스 동봉 등의 조건을 따라 다른 소프트웨어에 번들할 수 있습니다. 변형·각색 및 포맷 변경 등 수정본 제한이 있으므로 원본 폰트 사용을 우선 검토해야 합니다. 원본 폰트의 컬러 렌더링은 iOS/Android별 검증이 필요합니다.

TDS의 전체 아이콘 세트에 이 라이선스를 적용할 수는 없습니다. 위 15종이 토스페이스 원본 배포에 동일하게 포함되는지도 확인되지 않았습니다. 토스페이스 대체 시 원래 프로필과 달라질 수 있습니다.

## 기능 일치 수정 결과

초기 조사에서 발견했던 메인 합계 패널, 전체 화면 편집, 인라인 금액 입력, 이름 검색 합계만 제공하던 흐름을 수정했습니다. 현재 대응 범위와 의도적인 차이는 [기능 대응표](feature-parity.md)를 참고하세요.

토스페이스 원본 TTF를 앱에 적용했습니다. 원본 15종 TDS 캐릭터 대신 비슷한 의미의 일반 이모지 15종을 사용합니다. 폰트/라이선스는 assets 폴더에, 출처는 앱의 푸터와 설정에 포함했습니다. 직접 TDS SVG 자산을 재배포하지 않습니다.
