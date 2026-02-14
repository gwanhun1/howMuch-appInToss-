export const KEYFRAMES = `
  @keyframes rpFadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes rpModalPop {
    from { opacity: 0; transform: scale(0.92) translateY(16px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes rpGlow {
    0%, 100% { box-shadow: 0 4px 16px rgba(49,130,246,0.2); }
    50% { box-shadow: 0 4px 24px rgba(49,130,246,0.4); }
  }
  @keyframes rpResultPop {
    0% { opacity: 0; transform: scale(0.6) translateY(12px); }
    60% { transform: scale(1.04) translateY(-2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes rpParticle {
    0% { opacity: 1; transform: translate(0, 0) scale(1); }
    100% { opacity: 0; transform: translate(var(--rpx, 30px), var(--rpy, -60px)) scale(0); }
  }
  @keyframes rpFabAura {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.9; }
  }
  @keyframes rpFabPulse {
    0%, 85%, 100% { transform: scale(1); }
    90% { transform: scale(1.08); }
    95% { transform: scale(1); }
  }
  @keyframes rpBubbleIn {
    from { opacity: 0; transform: translateY(-50%) translateX(8px); }
    to { opacity: 1; transform: translateY(-50%) translateX(0); }
  }
  @keyframes rpBubbleOut {
    from { opacity: 1; transform: translateY(-50%) translateX(0); }
    to { opacity: 0; transform: translateY(-50%) translateX(8px); }
  }
  @keyframes rpFabWiggle {
    0%, 100% { transform: rotate(0deg); }
    15% { transform: rotate(12deg); }
    30% { transform: rotate(-10deg); }
    45% { transform: rotate(6deg); }
    60% { transform: rotate(0deg); }
  }
`;
