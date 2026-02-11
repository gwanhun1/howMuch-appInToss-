import { useEffect } from "react";
import { Spacing, useToast } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { useFriendStore } from "../stores/useFriendStore";
import { FriendFormBottomSheet } from "../components/FriendFormBottomSheet";
import { AmountInputPage } from "./AmountInputPage";
import { FriendList } from "../components/FriendList";
import { CoinRain } from "../components/CoinRain";
import { GlobalErrorView } from "../components/GlobalErrorView";
import { MainSummaryCard } from "../components/MainSummaryCard";
import { MainCategoryFilter } from "../components/MainCategoryFilter";
import { FRIEND_CATEGORIES } from "../constants/category";
import { ServiceFooter } from "../components/ServiceFooter";
import { RandomAmountPicker } from "../components/random-picker/RandomAmountPicker";

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
    loadAd,
  } = useFriendStore();

  // 서비스 첫 진입 시 데이터 초기화 및 메인 페이지 보장
  useEffect(() => {
    initializeStore();
    loadAd(); // 전면 광고 미리 로드

    if (currentPage !== "main") {
      resetToMain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFriends = friends
    .filter((f) => {
      if (filterType === FRIEND_CATEGORIES.ALL) return true;
      return f.type === filterType;
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

            <MainSummaryCard
              totalAmount={totalAmount}
              isLoading={isLoading}
              friendsCount={friends.length}
            />

            <Spacing size={16} />

            <MainCategoryFilter
              filterType={filterType}
              onFilterChange={setFilterType}
            />

            <Spacing size={16} />

            <div style={{ minHeight: "70vh" }}>
              <FriendList
                friends={filteredFriends}
                totalCount={friends.length}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                onLoadMore={fetchMoreFriends}
                lastAdMilestoneShown={lastAdMilestoneShown}
                onAddFriend={startAddingFriend}
                onFriendClick={openFriendForm}
                filterType={filterType}
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

            <Spacing size={32} />
            <ServiceFooter />
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

      <RandomAmountPicker />
    </div>
  );
}
