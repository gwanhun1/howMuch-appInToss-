import type { Friend } from "../types/friend";
import { FriendCard } from "./FriendCard";
import { AddFriendCard } from "./AddFriendCard";
import { AdCard } from "./AdCard";
import { FriendCardSkeleton } from "./FriendCardSkeleton";

interface FriendListProps {
  friends: Friend[];
  isLoading: boolean;
  lastAdMilestoneShown: number;
  onAddFriend: () => void;
  onFriendClick: (friendId: string) => void;
}

export function FriendList({
  friends,
  isLoading,
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
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => (
            <FriendCardSkeleton key={i} />
          ))
        : friends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onClick={() => onFriendClick(friend.id)}
            />
          ))}

      {!isLoading && shouldShowNextAdBadge && <AdCard />}
    </div>
  );
}
