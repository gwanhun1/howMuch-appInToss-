export type RecordMode = "paid" | "received";

export type RecordType = "용돈" | "축의금" | "조의금" | "돌잔치";

export interface MoneyRecord {
  id: string;
  mode: RecordMode;
  name: string;
  profileIcon: string;
  type: RecordType | null;
  amount: number;
  relation: string;
  date: string;
  isFavorite?: boolean;
}
