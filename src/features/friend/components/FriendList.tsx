import { adService } from "../apis/adService";
import { useEffect, useRef } from "react";
import type { Friend, FriendType } from "../types/friend";
import { FriendCard } from "./FriendCard";
import { AddFriendCard } from "./AddFriendCard";
import { AdCard } from "./AdCard";
import { FriendCardSkeleton } from "./FriendCardSkeleton";

interface FriendListProps {
  friends: Friend[];
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  lastAdMilestoneShown: number;
  onAddFriend: (initialType?: FriendType | null) => void;
  onFriendClick: (friendId: string) => void;
  onToggleFavorite: (friendId: string) => void;
  filterType?: string;
}

export function FriendList({
  friends,
  totalCount,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  lastAdMilestoneShown,
  onAddFriend,
  onFriendClick,
  onToggleFavorite,
  filterType = "전체",
}: FriendListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const currentRef = bottomRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  // 다음 광고가 언제 나올지 예고하는 로직 (서비스 정책에 따름)
  const nextTarget = totalCount + 1;
  const shouldShowNextAdBadge =
    nextTarget > 0 &&
    adService.checkIsMilestone(nextTarget, lastAdMilestoneShown);

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
      <AddFriendCard onClick={() => onAddFriend(filterType === "전체" ? null : (filterType as FriendType))} />
      {friends.map((friend) => (
        <FriendCard
          key={friend.id}
          friend={friend}
          onClick={() => onFriendClick(friend.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}

      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => <FriendCardSkeleton key={i} />)}

      {isLoadingMore &&
        Array.from({ length: 3 }).map((_, i) => (
          <FriendCardSkeleton key={`more-${i}`} />
        ))}

      {!isLoading && !isLoadingMore && hasMore && (
        <div ref={bottomRef} style={{ height: "20px", gridColumn: "span 3" }} />
      )}

      {!isLoading && filterType === "전체" && shouldShowNextAdBadge && <AdCard />}
    </div>
  );
}
