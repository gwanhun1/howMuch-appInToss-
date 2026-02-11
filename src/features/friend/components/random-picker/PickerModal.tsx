import React from "react";
import { Text, Spacing } from "@toss/tds-mobile";
import { PickerCard } from "./PickerCard";
import { PARTICLE_COLORS } from "./constants";

type Phase = "idle" | "shuffling" | "ready" | "revealed";

interface PickerModalProps {
  cards: number[];
  flippedIndex: number | null;
  phase: Phase;
  shufflePositions: number[];
  countUpValue: number;
  showParticles: boolean;
  message: string;
  isJackpot: boolean;
  onPickCard: (index: number) => void;
  onClose: () => void;
  onReshuffle: () => void;
}

export function PickerModal({
  cards, flippedIndex, phase, shufflePositions,
  countUpValue, showParticles, message, isJackpot,
  onPickCard, onClose, onReshuffle,
}: PickerModalProps) {
  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1100, animation: "rpFadeIn 0.25s ease",
      }}
      onClick={onClose}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(340px, calc(100vw - 40px))",
          background: "linear-gradient(160deg, #1e3a6e 0%, #2d1b4e 100%)",
          borderRadius: "24px", padding: "28px 20px 24px",
          animation: "rpModalPop 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.4)",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* 배경 장식 */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "140px", height: "140px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent)",
          pointerEvents: "none",
        }} />

        {/* 결과 영역 */}
        <div style={{
          minHeight: "90px", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          position: "relative", marginBottom: "24px",
        }}>
          {showParticles && (
            <div style={{ position: "absolute", inset: "-50px", pointerEvents: "none", overflow: "visible" }}>
              {Array.from({ length: isJackpot ? 20 : 12 }).map((_, i) => {
                const total = isJackpot ? 20 : 12;
                const rad = ((360 / total) * i * Math.PI) / 180;
                const dist = 40 + Math.random() * 50;
                return (
                  <div key={i} style={{
                    position: "absolute", left: "50%", top: "50%",
                    width: `${4 + Math.random() * 4}px`, height: `${4 + Math.random() * 4}px`,
                    borderRadius: i % 3 === 0 ? "2px" : "50%",
                    backgroundColor: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
                    animation: `rpParticle ${0.6 + Math.random() * 0.5}s ease-out forwards`,
                    animationDelay: `${Math.random() * 0.2}s`, opacity: 0,
                    "--rpx": `${Math.cos(rad) * dist}px`,
                    "--rpy": `${Math.sin(rad) * dist}px`,
                  } as React.CSSProperties} />
                );
              })}
            </div>
          )}

          {phase !== "revealed" ? (
            <>
              <Text typography="t4" fontWeight="bold" color="#fff">얼마 낼까? 🃏</Text>
              <Spacing size={6} />
              <Text typography="t7" color="rgba(255,255,255,0.45)">
                {phase === "shuffling" && "카드를 섞는 중..."}
                {phase === "ready" && "카드 한 장을 골라보세요"}
                {phase === "idle" && "준비 중..."}
              </Text>
            </>
          ) : (
            <div style={{ animation: "rpResultPop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)", textAlign: "center" }}>
              <Text typography="t1" fontWeight="bold" color="#fff" style={{
                textShadow: isJackpot ? "0 0 20px rgba(255,215,0,0.5)" : "0 0 12px rgba(49,130,246,0.3)",
                letterSpacing: "-1px",
              }}>
                {countUpValue.toLocaleString()}원
              </Text>
              <Spacing size={4} />
              <Text typography="t7" color="rgba(255,255,255,0.5)">{message}</Text>
            </div>
          )}
        </div>

        {/* 카드 */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }}>
          {cards.map((amount, i) => (
            <PickerCard
              key={i}
              amount={amount}
              index={i}
              isFlipped={flippedIndex === i}
              isOther={phase === "revealed" && flippedIndex !== i}
              isJackpot={isJackpot}
              phase={phase}
              shuffleOffset={shufflePositions[i] - i}
              onPick={() => onPickCard(i)}
            />
          ))}
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: "flex", gap: "8px" }}>
          {phase === "revealed" && (
            <button onClick={onReshuffle} style={{
              flex: 1, padding: "14px", borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.85)", fontSize: "15px", fontWeight: 600, cursor: "pointer",
            }}>
              다시 뽑기
            </button>
          )}
          <button onClick={onClose} style={{
            flex: 1, padding: "14px", borderRadius: "14px", border: "none",
            background: "linear-gradient(135deg, #3182F6, #7C4DFF)",
            color: "#fff", fontSize: "15px", fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(49,130,246,0.25)",
          }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
