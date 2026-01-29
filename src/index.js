import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  ':root': {
    'fontFamily': 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    'lineHeight': [{ 'unit': 'px', 'value': 1.5 }],
    'fontWeight': '400',
    'colorScheme': 'light dark',
    'color': 'rgba(255, 255, 255, 0.87)',
    'backgroundColor': '#f2f4f6',
    'fontSynthesis': 'none',
    'textRendering': 'optimizeLegibility',
    'WebkitFontSmoothing': 'antialiased',
    'MozOsxFontSmoothing': 'grayscale',
    'prefers-color-scheme ligh': {
      'color': '#213547',
      'backgroundColor': '#f2f4f6'
    }
  },
  'a': {
    'fontWeight': '500',
    'color': '#646cff',
    'textDecoration': 'inherit'
  },
  'a:hover': {
    'color': '#535bf2'
  },
  'body': {
    'margin': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }],
    'padding': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }],
    'backgroundColor': '#f9fafb',
    // 토스 기본 배경색 (adaptive.grey50)
    'minHeight': [{ 'unit': 'vh', 'value': 100 }],
    'WebkitTapHighlightColor': 'transparent',
    'userSelect': 'none',
    'touchAction': 'manipulation',
    'fontFamily': '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard",
    sans-serif'
  },
  'html': {
    'height': [{ 'unit': '%V', 'value': 1 }]
  },
  'body': {
    'height': [{ 'unit': '%V', 'value': 1 }]
  },
  '#root': {
    'height': [{ 'unit': '%V', 'value': 1 }]
  },
  '#root': {
    'minHeight': [{ 'unit': 'vh', 'value': 100 }],
    'backgroundColor': '#f9fafb'
  },
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
  'premium-amount-badge': {
    'position': 'relative',
    'background': 'linear-gradient(135deg, #3182f6 0%, #a259ff 100%)',
    'color': 'white !important',
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
  'h1': {
    'fontSize': [{ 'unit': 'em', 'value': 3.2 }],
    'lineHeight': [{ 'unit': 'px', 'value': 1.1 }]
  },
  'button': {
    'borderRadius': '8px',
    'border': [{ 'unit': 'px', 'value': 1 }, { 'unit': 'string', 'value': 'solid' }, { 'unit': 'string', 'value': 'transparent' }],
    'padding': [{ 'unit': 'em', 'value': 0.6 }, { 'unit': 'em', 'value': 1.2 }, { 'unit': 'em', 'value': 0.6 }, { 'unit': 'em', 'value': 1.2 }],
    'fontSize': [{ 'unit': 'em', 'value': 1 }],
    'fontWeight': '500',
    'fontFamily': 'inherit',
    'backgroundColor': '#1a1a1a',
    'cursor': 'pointer',
    'transition': 'border-color 0.25s'
  },
  'button:hover': {
    'borderColor': '#646cff'
  },
  'button:focus': {
    'outline': '4px auto -webkit-focus-ring-color'
  },
  'button:focus-visible': {
    'outline': '4px auto -webkit-focus-ring-color'
  }
});
