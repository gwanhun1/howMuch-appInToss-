export type FriendType = "축의금" | "조의금";

export interface Friend {
  id: string;
  name: string;
  profileIcon: string;
  type: FriendType;
  amount: number;
  relation: string;
  date: string;
}
