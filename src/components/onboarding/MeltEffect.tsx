import { useEffect, useState, useMemo } from "react";

interface MeltEffectProps {
  cardRect: DOMRect;
  color: string;
  bgColor: string;
  borderColor?: string;
  children?: React.ReactNode;
}

/**
 * 아이스크림 녹는 효과 (하드코어 버전)
 * feTurbulence로 형태를 왜곡하고, 다중 레이어로 흘러내리는 점성을 표현
 */
export function MeltEffect({
  cardRect,
  color,
  bgColor,
  borderColor,
  children,
}: MeltEffectProps) {
  const [progress, setProgress] = useState(0);
  // 난류(Turbulence) 애니메이션을 위한 seed
  const [seed, setSeed] = useState(0);

  const w = cardRect.width;
  const h = cardRect.height;

  const DURATION = 2;

  useEffect(() => {
    let start: number | null = null;
    let raf: number;

    const animate = (time: number) => {
      if (!start) start = time;
      const elapsed = (time - start) / 1000;
      const p = Math.min(elapsed / DURATION, 1);

      // 처음엔 천천히 녹다가(0.4까지), 갑자기 훅 무너짐(0.4~0.8), 마지막엔 잔여물 정리
      const eased =
        p < 0.4 ? p * 0.5 : 0.2 + Math.pow((p - 0.4) / 0.6, 2) * 0.8;

      setProgress(eased);
      setSeed(p * 50); // 시간이 갈수록 노이즈 패턴도 변화

      if (p < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 카드 본체가 녹아내리는 경로 (위쪽이 무너져내림 + 중앙 위주로 흘러내림)
  const meltBodyPath = useMemo(() => {
    const steps = 20;
    const topY = progress * h * 0.6; // 상단이 서서히 내려앉음

    let path = `M 0 ${topY}`;

    // 1. 윗변 (Top): 불규칙하게 울퉁불퉁해짐
    for (let i = 1; i <= steps; i++) {
      const x = (i / steps) * w;
      const wave = Math.sin(x * 0.2 + progress * 10) * (progress * 15);
      path += ` L ${x} ${topY + wave}`;
    }

    // 2. 우측변 (Right): 위에서 아래로
    // 약간 안쪽으로 녹아들어오며 자연스럽게 연결
    for (let i = 0; i <= 5; i++) {
      const y = topY + (h - topY) * (i / 5);
      const wobble = Math.sin(y * 0.1 + progress * 5) * (progress * 5);
      path += ` L ${w + wobble} ${y}`;
    }

    // 3. 하단변 (Bottom): 좌우 영역은 놔두고 중앙 위주로 묵직하게 흐름
    // x: w -> 0 으로 이동
    for (let i = steps; i >= 0; i--) {
      const t = i / steps; // 1 -> 0
      const x = t * w;

      // 베이스 높이는 조금씩 위로 올라감 (본체가 녹아 없어짐)
      const baseY = h - progress * h * 0.2;

      // 중앙 집중형 흘러내림 (Window function)
      // 양쪽 끝(0, 1)에서는 0, 중앙(0.5)에서는 1
      const meltWindow = Math.sin(t * Math.PI);

      // 흘러내리는 길이: 진행될수록 매우 길어짐
      const drop = Math.pow(meltWindow, 2) * (progress * 400);

      // 불규칙한 덩어리감 (Drip)
      const drip = Math.sin(x * 0.3 + progress * 8) * (progress * 30);

      const y = baseY + drop + drip;
      path += ` L ${x} ${y}`;
    }

    // 4. 좌측변 (Left): 아래에서 위로
    path += ` L 0 ${topY}`;

    path += " Z";
    return path;
  }, [w, h, progress]);

  // 투명도: 형태가 무너지면서 서서히 사라짐
  const opacity = 1 - Math.pow(progress, 5);

  return (
    <div
      style={{
        position: "fixed",
        top: cardRect.top,
        left: cardRect.left,
        width: w,
        height: h + 300, // 녹아내릴 공간 충분히 확보
        zIndex: 1002,
        pointerEvents: "none",
      }}
    >
      <svg
        width={w}
        height={h + 300}
        viewBox={`0 0 ${w} ${h + 300}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* 강력한 왜곡 필터: 열기에 녹는 아지랑이 느낌 */}
          <filter
            id="heat-distortion"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="3"
              result="turbulence"
              seed={Math.floor(seed)}
            >
              {/* 시간에 따라 baseFrequency를 변화시켜 일렁임 효과를 줄 수 있음 */}
              <animate
                attributeName="baseFrequency"
                values="0.02; 0.04; 0.02"
                dur={`${DURATION}s`}
                repeatCount="1"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={20 * progress}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* 끈적한 액체 결합 필터 */}
          <filter id="sticky-goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>

        {/* 왜곡 효과가 적용된 그룹 */}
        <g filter="url(#heat-distortion)">
          {/* 끈적한 액체 그룹 */}
          <g filter="url(#sticky-goo)">
            {/* 메인 덩어리: 아래로 무섭게 흘러내림 + 테두리 */}
            <path
              d={meltBodyPath}
              fill={bgColor}
              stroke={borderColor || color}
              strokeWidth={1.5}
              strokeOpacity={0.6}
              style={{ opacity }}
            />
          </g>
        </g>
      </svg>

      {/* 내부 콘텐츠도 같이 왜곡되며 녹아내림 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: w,
          height: h,
          opacity: opacity,
          filter: `url(#heat-distortion) blur(${progress * 5}px)`, // 왜곡 필터 적용
          transformOrigin: "top",
          transform: `scaleY(${1 + progress * 0.5}) translateY(${progress * 50}px)`, // 아래로 늘어지며 이동
          clipPath: `path('${meltBodyPath}')`,
        }}
      >
        {/* 실제 카드 내용(children) 렌더링 */}
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: bgColor, // 배경색 한번 더 깔아줌 (빈틈 방지)
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
