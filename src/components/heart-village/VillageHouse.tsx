import { Asset } from "@toss/tds-mobile";
import type { VillageDecoration } from "@/apis/heartVillage/type";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];
export function VillageHouse({ decoration }: { decoration: VillageDecoration }) {
  return <div className={`village-house village-house--${decoration.house}`} aria-hidden="true">
    <div className="village-chimney" />
    <div className="village-roof" />
    <div className="village-walls">
      <div className="village-window"><Asset.Icon name={decoration.icon as IconName} frameShape={Asset.frameShape.CleanW40} /></div>
      <span className="village-door" />
    </div>
    <span className="village-flower">✿</span>
  </div>;
}
