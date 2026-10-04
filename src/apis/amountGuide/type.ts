import type { RecordType } from "@/types/record";

export type GuideEvent = Exclude<RecordType, "용돈">;
export type Closeness = "acquaintance" | "regular" | "close";
export interface GuideSituation {
  type: GuideEvent;
  relation: string;
  closeness: Closeness;
  attending: boolean;
}
export interface AmountGuideResult {
  amounts: number[];
  explanation: string;
}
