import type { Friend } from "@/types/friend";
import { FriendCard } from "./FriendCard";
import { AddFriendCard } from "./AddFriendCard";
import { AdCard } from "./AdCard";

interface FriendListProps {
  friends: Friend[];
  onAddFriend: () => void;
  onFriendClick: (friendId: string) => void;
}

export function FriendList({
  friends,
  onAddFriend,
  onFriendClick,
}: FriendListProps) {
  const shouldShowNextAdBadge = friends.length > 0 && friends.length % 5 === 4;

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
