import { useEffect, useRef } from "react";
import type { Friend } from "../types/friend";
import { FriendCard } from "./FriendCard";
import { AddFriendCard } from "./AddFriendCard";
import { AdCard } from "./AdCard";
import { FriendCardSkeleton } from "./FriendCardSkeleton";

interface FriendListProps {
  friends: Friend[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  lastAdMilestoneShown: number;
  onAddFriend: () => void;
  onFriendClick: (friendId: string) => void;
}

export function FriendList({
  friends,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  lastAdMilestoneShown,
  onAddFriend,
  onFriendClick,
}: FriendListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

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

      {isLoading &&
        Array.from({ length: 6 }).map((_, i) => <FriendCardSkeleton key={i} />)}

      {isLoadingMore &&
        Array.from({ length: 3 }).map((_, i) => (
          <FriendCardSkeleton key={`more-${i}`} />
        ))}

      {!isLoading && !isLoadingMore && hasMore && (
        <div ref={bottomRef} style={{ height: "20px", gridColumn: "span 3" }} />
      )}

      {!isLoading && shouldShowNextAdBadge && <AdCard />}
    </div>
  );
}
