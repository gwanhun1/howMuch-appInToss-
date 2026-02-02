import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // TDS Mobile이 기본 스타일을 관리하므로 global reset은 최소화합니다.
  'body': {
    'margin': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }],
    'padding': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }],
    'WebkitTapHighlightColor': 'transparent',
    'userSelect': 'none',
    'touchAction': 'manipulation'
  },
  '#root': {
    'minHeight': [{ 'unit': 'vh', 'value': 100 }],
    // 배경색은 App 내부에서 adaptive 토큰으로 제어합니다
  },
  // 커스텀 애니메이션 스타일
  'add-card-pulse': {
    'position': 'relative',
    'overflow': 'hidden',
    'prefers-reduced-motion reduc': {
      'animation': 'none'
    }
  },
  'add-card-pulse::after': {
    'content': '""',
    'position': 'absolute',
    'inset': '-30%',
    'background': 'linear-gradient(
    120deg,
    rgba(49, 130, 246, 0) 35%,
    rgba(49, 130, 246, 0.15) 50%,
    rgba(49, 130, 246, 0) 65%
  )',
    'transform': 'translateX(-120%)',
    'animation': 'add-card-twinkle 5s ease-in-out infinite',
    'pointerEvents': 'none'
  },
  // 프리미엄 금액 뱃지 스타일 - 은은한 아우라 효과
  // 이 스타일은 TDS Badge 컴포넌트 위에 적용되며, 그라데이션은 브랜드 색상으로 유지
  'premium-amount-badge': {
    'position': 'relative',
    'background': 'linear-gradient(
    135deg,
    var(--tds-color-blue500, #3182f6) 0%,
    #a259ff 100%
  )',
    'color': 'var(--tds-color-static-white, #fff) !important',
    'border': [{ 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': '!important' }],
    'padding': [{ 'unit': 'px', 'value': 4 }, { 'unit': 'px', 'value': 12 }, { 'unit': 'string', 'value': '!important' }, { 'unit': 'px', 'value': 12 }],
    'borderRadius': '100px !important',
    'fontWeight': '700 !important',
    'display': 'inline-flex',
    'alignItems': 'center',
    'justifyContent': 'center',
    // 기본 그림자 및 애니메이션 설정
    'boxShadow': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'string', 'value': 'rgba(162, 89, 255, 0.4)' }],
    'animation': 'premium-aura-pulse 3s infinite'
  },
  // 동전 떨어지는 애니메이션
  'coin-rain-container': {
    'position': 'fixed',
    'top': [{ 'unit': 'px', 'value': 0 }],
    'left': [{ 'unit': 'px', 'value': 0 }],
    'width': [{ 'unit': 'vw', 'value': 100 }],
    'height': [{ 'unit': 'vh', 'value': 100 }],
    'pointerEvents': 'none',
    'zIndex': '9999',
    'overflow': 'hidden',
    'perspective': '1000px',
    // 3D 효과를 위한 원근감 추가
  },
  'coin-item': {
    'position': 'absolute',
    'top': [{ 'unit': 'px', 'value': -60 }],
    'animation': 'coin-fall ease-in forwards',
    // linear에서 ease-in으로 변경하여 가속도 추가
    'willChange': 'transform, opacity'
  },
  // 3D 회전 클래스
  'coin-spinning': {
    'animation': 'coin-fall ease-in forwards,
    coin-spin linear infinite'
  },
  // 미래 일정 카드 (isUpcoming) 아우라 효과
  'upcoming-aura': {
    'position': 'relative',
    'zIndex': '1'
  },
  'upcoming-aura::before': {
    'content': '""',
    'position': 'absolute',
    'inset': '0',
    'borderRadius': '24px',
    'boxShadow': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 15 }, { 'unit': 'px', 'value': 2 }, { 'unit': 'string', 'value': 'rgba(49, 130, 246, 0.25)' }],
    'animation': 'upcoming-glow 3s ease-in-out infinite',
    'zIndex': '-1',
    'pointerEvents': 'none'
  },
  // BottomSheet 다크모드 지원
  // ColorSchemeArea가 dark일 때 BottomSheet 배경색 변경
  ':root': {
    'BottomsheetBg': '#ffffff'
  },
  '[data-tds-color-scheme="dark"]': {
    'BottomsheetBg': '#17171c'
  },
  // BottomSheet 컴포넌트 배경색 오버라이드
  'bottomsheet-content': {
    'backgroundColor': 'var(--bottomsheet-bg) !important'
  },
  // BottomSheet 내부 모든 자식 요소 배경색
  'bottomsheet-content > div': {
    'backgroundColor': 'var(--bottomsheet-bg) !important'
  },
  // TDS Toast 커스텀 - 연한 파이트 블루 테마
  // TDS Mobile의 Toast 클래스를 대상으로 스타일 오버라이드
  'div[role="alert"]': {
    'backgroundColor': '#f2f8ff !important',
    // 연한 파랑 배경
    'color': '#3182f6 !important',
    // 토스 블루 텍스트
    'border': [{ 'unit': 'px', 'value': 1 }, { 'unit': 'string', 'value': 'solid' }, { 'unit': 'string', 'value': 'rgba(49, 130, 246, 0.2)' }, { 'unit': 'string', 'value': 'rgba(49, 130, 246, 0.2)' }, { 'unit': 'string', 'value': '!important' }],
    'boxShadow': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 8 }, { 'unit': 'px', 'value': 16 }, { 'unit': 'string', 'value': 'rgba(49, 130, 246, 0.1)' }, { 'unit': 'string', 'value': 'rgba(49, 130, 246, 0.1)' }, { 'unit': 'string', 'value': '!important' }],
    'borderRadius': '14px !important'
  },
  'tds-toast': {
    'backgroundColor': '#f2f8ff !important',
    // 연한 파랑 배경
    'color': '#3182f6 !important',
    // 토스 블루 텍스트
    'border': [{ 'unit': 'px', 'value': 1 }, { 'unit': 'string', 'value': 'solid' }, { 'unit': 'string', 'value': 'rgba(49, 130, 246, 0.2)' }, { 'unit': 'string', 'value': 'rgba(49, 130, 246, 0.2)' }, { 'unit': 'string', 'value': '!important' }],
    'boxShadow': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 8 }, { 'unit': 'px', 'value': 16 }, { 'unit': 'string', 'value': 'rgba(49, 130, 246, 0.1)' }, { 'unit': 'string', 'value': 'rgba(49, 130, 246, 0.1)' }, { 'unit': 'string', 'value': '!important' }],
    'borderRadius': '14px !important'
  },
  // 토스트 내부 텍스트 색상 강제 적용
  'div[role="alert"] span': {
    'color': '#3182f6 !important',
    'fontWeight': '500 !important'
  },
  'div[role="alert"] div': {
    'color': '#3182f6 !important',
    'fontWeight': '500 !important'
  },
  'tds-toast span': {
    'color': '#3182f6 !important',
    'fontWeight': '500 !important'
  },
  'tds-toast div': {
    'color': '#3182f6 !important',
    'fontWeight': '500 !important'
  }
});
