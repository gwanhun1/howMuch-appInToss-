import { useId } from "react";
import { Asset } from "@toss/tds-mobile";
import type { VillageDecoration } from "@/apis/heartVillage/type";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];
export function VillageHouse({ decoration }: { decoration: VillageDecoration }) {
  const id = useId().replace(/:/g, "");
  return <div className={`village-house village-house--${decoration.house}`} aria-hidden="true">
    <svg className="village-house-art" viewBox="0 0 96 116" fill="none">
      <defs>
        <linearGradient id={`${id}-roof`} x1="48" y1="12" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--houseRoofLight)" /><stop offset="1" stopColor="var(--houseRoof)" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x1="22" y1="48" x2="76" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fffefa" /><stop offset="1" stopColor="var(--houseWall)" />
        </linearGradient>
      </defs>
      <ellipse cx="49" cy="108" rx="37" ry="5" fill="#48665d" opacity=".09" />
      <ellipse cx="48" cy="104" rx="39" ry="8" fill="var(--houseGarden)" />
      <path d="M76 44L83 39V93L76 99V44Z" fill="var(--houseWallSide)" />
      <path d="M20 43H76V93C76 97 73 100 69 100H27C23 100 20 97 20 93V43Z" fill={`url(#${id}-wall)`} />
      <path d="M48 10L55 6L93 37L87 44L48 10Z" fill="var(--houseRoofSide)" />
      <path d="M70 18H79V35H70V18Z" fill="var(--houseRoofSide)" />
      <rect x="68" y="16" width="13" height="4" rx="2" fill="var(--houseRoofLight)" />
      <path d="M9 42L44 12C46 10 50 10 52 12L87 42C89 44 87 47 84 47H12C9 47 7 44 9 42Z" fill={`url(#${id}-roof)`} />
      <path d="M13 43H83" stroke="white" strokeOpacity=".25" strokeWidth="2" strokeLinecap="round" />
      <circle cx="48" cy="65" r="21" fill="var(--houseWallSide)" opacity=".35" />
      <circle cx="48" cy="63" r="20" fill="#fff" />
      <circle cx="48" cy="63" r="17" fill="var(--houseWindow)" />
      <path d="M42 100V91C42 83 55 83 55 91V100" fill="var(--houseRoof)" opacity=".8" />
      <circle cx="52" cy="94" r="1" fill="white" opacity=".9" />
      <rect x="22" y="101" width="53" height="2" rx="1" fill="var(--houseWallSide)" opacity=".5" />
      <ellipse cx="49" cy="106" rx="7" ry="2" fill="#fffaf0" />
      <ellipse cx="48" cy="112" rx="9" ry="2" fill="#fffaf0" />
      <path d="M15 101C7 100 7 91 11 91C15 91 18 97 15 101Z" fill="#9ebaa6" />
      <path d="M15 101C22 100 23 94 20 93C17 92 14 98 15 101Z" fill="#bdd3b8" />
      <circle cx="81" cy="99" r="3" fill="#edc49b" /><circle cx="81" cy="99" r="1" fill="#fff8e8" />
    </svg>
    <div className="village-character"><Asset.Icon name={decoration.icon as IconName} frameShape={Asset.frameShape.CleanW32} /></div>
  </div>;
}
