export type FriendType = "축의금" | "조의금" | "돌잔치" | "용돈";

export interface Friend {
  id: string;
  name: string;
  profileIcon: string;
  type: FriendType | null;
  amount: number;
  relation: string;
  date: string;
  isFavorite?: boolean;
}
