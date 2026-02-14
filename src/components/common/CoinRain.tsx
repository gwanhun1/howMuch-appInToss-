import { useEffect, useState } from "react";
import { Asset } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

interface Coin {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: number;
  isSpinning: boolean;
  spinDuration: string;
}

interface CoinRainProps {
  onComplete?: () => void;
}

export function CoinRain({ onComplete }: CoinRainProps) {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    // 40개의 동전 생성
    const newCoins = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${0.8 + Math.random() * 0.7}s`,
      size: 16 + Math.random() * 20,
      isSpinning: Math.random() > 0.5, // 50% 확률로 3D 회전
      spinDuration: `${0.5 + Math.random() * 1}s`,
    }));
    setCoins(newCoins);

    const timer = setTimeout(() => {
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="coin-rain-container">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className={`coin-item ${coin.isSpinning ? "coin-spinning" : ""}`}
          style={{
            left: coin.left,
            animationDelay: coin.delay,
            animationDuration:
              coin.duration + (coin.isSpinning ? `, ${coin.spinDuration}` : ""),
          }}
        >
          {/* 이중 레이어 코인 디자인: 연한 파랑 배경 + 진한 파랑 심볼 */}
          <div
            style={{
              width: coin.size,
              height: coin.size,
              backgroundColor: adaptive.blue100,
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: `1px solid ${adaptive.blue200}`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <Asset.Icon
              name="icon-dollar-mono" // 달러 심볼만 있는 아이콘 (추정)
              size={coin.size * 0.6}
              color={adaptive.blue600}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
