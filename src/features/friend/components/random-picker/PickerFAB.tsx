import { Asset } from "@toss/tds-mobile";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface PickerFABProps {
  onOpen: () => void;
  bubblePhase: "in" | "out" | null;
}

export function PickerFAB({ onOpen, bubblePhase }: PickerFABProps) {
  return (
    <div style={{
      position: "fixed",
      bottom: "calc(24px + env(safe-area-inset-bottom))",
      right: "20px",
      zIndex: 800,
    }}>
      {/* 아우라 */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: "88px", height: "88px", borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(49,130,246,0.18), rgba(155,89,246,0.08), transparent 70%)",
        animation: "rpFabAura 3s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: "68px", height: "68px", borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(49,130,246,0.22), rgba(155,89,246,0.1), transparent 65%)",
        animation: "rpFabAura 3s ease-in-out 1.5s infinite",
        pointerEvents: "none",
      }} />

      {/* 말풍선 */}
      {bubblePhase !== null && (
        <div style={{
          position: "absolute", top: "50%", right: "calc(100% + 12px)",
          transform: "translateY(-50%)",
          animation: bubblePhase === "in" ? "rpBubbleIn 0.4s ease both" : "rpBubbleOut 0.5s ease both",
          pointerEvents: "none", display: "flex", alignItems: "center",
          willChange: "opacity, transform",
        }}>
          <div style={{
            backgroundColor: "#3182F6", borderRadius: "12px",
            padding: "8px 12px", boxShadow: "0 4px 12px rgba(49,130,246,0.25)",
          }}>
            <span style={{
              fontSize: "12px", fontWeight: 700, color: "#fff",
              whiteSpace: "nowrap", display: "block", lineHeight: "16px",
            }}>
              💰 얼마 낼지 고민될 때!
            </span>
          </div>
          <div style={{
            width: "10px", height: "10px", backgroundColor: "#3182F6",
            borderRadius: "0 2px 0 0", transform: "rotate(45deg)",
            marginLeft: "-5px", flexShrink: 0,
          }} />
        </div>
      )}

      {/* 버튼 */}
      <button
        onClick={onOpen}
        style={{
          position: "relative", width: "64px", height: "64px",
          borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, #3182F6, #9B59F6)",
          boxShadow: "0 6px 20px rgba(49, 130, 246, 0.35)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s", animation: "rpFabPulse 4s ease-in-out infinite",
        }}
        onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
        onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <div style={{ animation: "rpFabWiggle 3s ease-in-out infinite" }}>
          <Asset.Icon name={"icon-emoji-money-with-wings" as IconName} frameShape={Asset.frameShape.CleanW32} />
        </div>
      </button>
    </div>
  );
}
