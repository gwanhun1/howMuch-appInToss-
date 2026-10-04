import type { MoneyRecord } from "@/types/record";

export type HouseStyle = "sky" | "rose" | "forest";
export interface VillageDecoration { house: HouseStyle; icon: string }
export type VillageDecorations = Record<string, VillageDecoration>;
export interface VillageResident {
  id: string;
  name: string;
  relation: string;
  icon: string;
  records: MoneyRecord[];
  totalPaid: number;
  totalReceived: number;
}
