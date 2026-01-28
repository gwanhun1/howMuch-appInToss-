import type { Friend } from "@/types/friend";
import { FriendCard } from "./FriendCard";
import { AddFriendCard } from "./AddFriendCard";
import { AdCard } from "./AdCard";

interface FriendListProps {
  friends: Friend[];
  lastAdMilestoneShown: number;
  onAddFriend: () => void;
  onFriendClick: (friendId: string) => void;
}

export function FriendList({
  friends,
  lastAdMilestoneShown,
  onAddFriend,
  onFriendClick,
}: FriendListProps) {
  const nextMilestone = friends.length + 1;
  const shouldShowNextAdBadge =
    nextMilestone > 0 &&
    nextMilestone % 5 === 0 &&
    nextMilestone > lastAdMilestoneShown;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        columnGap: "12px",
        rowGap: "16px",
        padding: "0 20px",
        marginBottom: "20px",
      }}
    >
      <AddFriendCard onClick={onAddFriend} />

      {friends.map((friend) => (
        <FriendCard
          key={friend.id}
          friend={friend}
          onClick={() => onFriendClick(friend.id)}
        />
      ))}

      {shouldShowNextAdBadge && <AdCard />}
    </div>
  );
}
