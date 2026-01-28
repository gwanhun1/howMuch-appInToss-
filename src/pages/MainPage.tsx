import { useEffect } from "react";
import { Spacing, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
// import { AppHeader } from "@/components/common/AppHeader";
import { useFriendStore } from "@/stores/useFriendStore";
import { FriendFormBottomSheet } from "@/components/friend/FriendFormBottomSheet";
import { AmountInputPage } from "@/pages/AmountInputPage";
import { FriendList } from "@/components/friend/FriendList";

export function MainPage() {
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
  } = useFriendStore();

  // 서비스 첫 진입 시 항상 메인 페이지가 뜨도록 보장
  useEffect(() => {
    if (currentPage !== "main") {
      resetToMain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedFriend = friends.find((f) => f.id === selectedFriendId) || null;

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
          {/* <AppHeader /> */}

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <Spacing size={12} />
            <Text
              typography="t4"
              fontWeight="bold"
              color={adaptive.grey900}
              style={{ padding: "0 20px" }}
            >
              기록할 친구를 눌러주세요
            </Text>
            <Spacing size={24} />

            <FriendList
              friends={friends}
              lastAdMilestoneShown={lastAdMilestoneShown}
              onAddFriend={startAddingFriend}
              onFriendClick={openFriendForm}
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
