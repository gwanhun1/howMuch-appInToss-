import { Asset, Text, Spacing } from "@toss/tds-mobile";
import { CARD_ICONS } from "./constants";

type Phase = "idle" | "shuffling" | "ready" | "revealed";

interface PickerCardProps {
  amount: number;
  index: number;
  isFlipped: boolean;
  isOther: boolean;
  isJackpot: boolean;
  phase: Phase;
  shuffleOffset: number;
  onPick: () => void;
}

export function PickerCard({
  amount, index, isFlipped, isOther, isJackpot, phase, shuffleOffset, onPick,
}: PickerCardProps) {
  return (
    <div onClick={onPick} style={{
      width: "56px", height: "84px", perspective: "600px",
      cursor: phase === "ready" ? "pointer" : "default",
      opacity: isOther ? 0.2 : 1,
      transform: phase === "shuffling"
        ? `translateX(${shuffleOffset * 64}px) rotate(${shuffleOffset * 4}deg)`
        : isOther ? "scale(0.85) translateY(6px)"
        : isFlipped ? "scale(1.1) translateY(-8px)" : "scale(1)",
      transition: phase === "shuffling" ? "all 0.12s ease" : "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: isFlipped ? 10 : 1,
    }}>
      <div style={{
        width: "100%", height: "100%", position: "relative",
        transformStyle: "preserve-3d",
        transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* 뒷면 */}
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden", borderRadius: "12px",
          background: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
          border: "1px solid rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: phase === "ready" ? "0 4px 16px rgba(49,130,246,0.2)" : "0 2px 8px rgba(0,0,0,0.3)",
          animation: phase === "ready" ? `rpGlow 2s ease-in-out infinite ${index * 0.15}s` : "none",
        }}>
          <Asset.Icon name={CARD_ICONS[index]} frameShape={Asset.frameShape.CleanW32} />
        </div>
        {/* 앞면 */}
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden", transform: "rotateY(180deg)",
          borderRadius: "12px",
          background: isJackpot ? "linear-gradient(145deg, #FFF8E1, #FFFDE7)" : "linear-gradient(145deg, #fff, #f0f4ff)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: isJackpot ? "0 8px 32px rgba(255,215,0,0.3)" : "0 8px 24px rgba(49,130,246,0.2)",
          border: isJackpot ? "1.5px solid rgba(255,215,0,0.4)" : "1.5px solid rgba(49,130,246,0.12)",
        }}>
          <Text typography="t4" fontWeight="bold" color={isJackpot ? "#B8860B" : "#3182F6"} style={{ lineHeight: "1" }}>
            {(amount / 10000).toLocaleString()}
          </Text>
          <Spacing size={2} />
          <Text typography="t7" fontWeight="medium" color={isJackpot ? "#DAA520" : "#7C4DFF"}>만원</Text>
        </div>
      </div>
    </div>
  );
}
