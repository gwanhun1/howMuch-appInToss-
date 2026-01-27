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
    rgba(49, 130, 246, 0.35) 50%,
    rgba(49, 130, 246, 0) 65%
  )',
    'transform': 'translateX(-120%)',
    'animation': 'add-card-twinkle 2.8s ease-in-out infinite',
    'pointerEvents': 'none'
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
