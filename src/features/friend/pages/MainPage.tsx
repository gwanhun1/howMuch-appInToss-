import { useEffect } from "react";
import { Spacing, Text, Badge, Skeleton, useToast } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { useFriendStore } from "../stores/useFriendStore";
import { FriendFormBottomSheet } from "../components/FriendFormBottomSheet";
import { AmountInputPage } from "./AmountInputPage";
import { FriendList } from "../components/FriendList";
import { CoinRain } from "../components/CoinRain";
import { GlobalErrorView } from "../components/GlobalErrorView";

export function MainPage() {
  const { openToast } = useToast();

  const {
    friends,
    selectedFriendId,
    editingFriend,
    setEditingFriend,
    currentPage,
    isFriendFormOpen,
    openFriendForm,
    closeFriendForm,
    openAmountInput,
    closeAmountInput,
    resetToMain,
    startAddingFriend,
    lastAdMilestoneShown,
    initializeStore,
    filterType,
    setFilterType,
    isCelebrating,
    setCelebrating,
    isLoading,
    error,
    totalAmount,
    fetchMoreFriends,
    hasMore,
    isLoadingMore,
    updateFriend,
  } = useFriendStore();

  // 서비스 첫 진입 시 데이터 초기화 및 메인 페이지 보장
  useEffect(() => {
    initializeStore();

    if (currentPage !== "main") {
      resetToMain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFriends = friends
    .filter((f) => {
      if (filterType === "all") return true;
      if (filterType === "wedding") return f.type === "축의금";
      if (filterType === "funeral") return f.type === "조의금";
      return true;
    })
    .sort((a, b) => {
      // 1. 즐겨찾기 우선 정렬
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      // 2. 같은 조건이면 이름순 (또는 최신순 등)
      return a.name.localeCompare(b.name);
    });

  const selectedFriend = friends.find((f) => f.id === selectedFriendId) || null;

  if (error) {
    return (
      <GlobalErrorView description={error} onRetry={() => initializeStore()} />
    );
  }

  return (
    <div
      style={{
        backgroundColor: adaptive.grey50,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {isCelebrating && <CoinRain onComplete={() => setCelebrating(false)} />}
      {currentPage === "amountInput" && editingFriend ? (
        <AmountInputPage
          value={editingFriend.amount}
          onBack={closeAmountInput}
          onSave={(val) => {
            setEditingFriend({ ...editingFriend, amount: val });
            closeAmountInput();
          }}
        />
      ) : (
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <Spacing size={12} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
              }}
            >
              <Text typography="t4" fontWeight="bold" color={adaptive.grey900}>
                오간 마음을 확인해보세요
              </Text>
              {isLoading ? (
                <Skeleton.Item
                  style={{ width: 80, height: 24, borderRadius: 12 }}
                />
              ) : (
                friends.length > 0 && (
                  <Badge
                    color="blue"
                    variant="fill"
                    size="small"
                    className="premium-amount-badge"
                    style={{
                      maxWidth: "120px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  >
                    총 {totalAmount.toLocaleString()}원
                  </Badge>
                )
              )}
            </div>

            <Spacing size={16} />

            {/* 필터링 버튼 영역 */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                padding: "0 20px",
              }}
            >
              <Badge
                color={filterType === "all" ? "blue" : "elephant"}
                variant={filterType === "all" ? "fill" : "weak"}
                size="small"
                style={{ cursor: "pointer", transition: "all 0.2s" }}
                onClick={() => setFilterType("all")}
              >
                전체
              </Badge>
              <Badge
                color={filterType === "wedding" ? "blue" : "elephant"}
                variant={filterType === "wedding" ? "fill" : "weak"}
                size="small"
                style={{ cursor: "pointer", transition: "all 0.2s" }}
                onClick={() => setFilterType("wedding")}
              >
                축의금
              </Badge>
              <Badge
                color={filterType === "funeral" ? "elephant" : "elephant"}
                variant={filterType === "funeral" ? "fill" : "weak"}
                size="small"
                onClick={() => setFilterType("funeral")}
              >
                조의금
              </Badge>
            </div>

            <Spacing size={16} />

            <FriendList
              friends={filteredFriends}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              onLoadMore={fetchMoreFriends}
              lastAdMilestoneShown={lastAdMilestoneShown}
              onAddFriend={startAddingFriend}
              onFriendClick={openFriendForm}
              onToggleFavorite={async (id) => {
                const friend = friends.find((f) => f.id === id);
                if (friend) {
                  const willBeFavorite = !friend.isFavorite;

                  try {
                    await updateFriend(id, { isFavorite: willBeFavorite });

                    if (willBeFavorite) {
                      openToast("⭐ 중요 표시되었습니다");
                    } else {
                      openToast("중요 표시가 해제되었습니다");
                    }
                  } catch (error) {
                    console.error("즐겨찾기 토글 실패:", error);
                    const errorMessage =
                      error instanceof Error
                        ? error.message
                        : "중요 표시 변경에 실패했습니다.";
                    openToast(errorMessage);
                  }
                }
              }}
            />
          </div>
        </>
      )}

      <FriendFormBottomSheet
        open={isFriendFormOpen}
        friend={selectedFriend}
        onClose={() => {
          closeFriendForm();
        }}
        onOpenAmountInput={() => {
          openAmountInput();
        }}
        onHome={resetToMain}
      />
    </div>
  );
}
