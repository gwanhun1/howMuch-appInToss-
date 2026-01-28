import { useEffect } from "react";
import { Asset, Spacing, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { AppHeader } from "@/components/common/AppHeader";
import { useFriendStore } from "@/stores/useFriendStore";
import { FriendFormBottomSheet } from "@/components/friend/FriendFormBottomSheet";
import { AmountInputPage } from "@/pages/AmountInputPage";
import type { Friend } from "@/types/friend";
import { emojiCodeToString, isEmojiCode } from "@/utils/emoji";

export function MainPage() {
  const {
    friends,
    selectedFriendId,
    editingFriend,
    setEditingFriend,
    currentPage,
    isFriendFormOpen,
    addFriend,
    openFriendForm,
    closeFriendForm,
    openAmountInput,
    closeAmountInput,
    resetToMain,
  } = useFriendStore();

  // 서비스 첫 진입 시 항상 메인 페이지가 뜨도록 보장
  useEffect(() => {
    if (currentPage !== "main") {
      resetToMain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedFriend = friends.find((f) => f.id === selectedFriendId) || null;
  const shouldShowNextAdBadge = friends.length > 0 && friends.length % 5 === 4;

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
          onHome={resetToMain}
          onSave={(val) => {
            setEditingFriend({ ...editingFriend, amount: val });
            closeAmountInput();
          }}
        />
      ) : (
        <>
          <AppHeader onMore={() => {}} onClose={() => {}} />

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
              <div
                className="add-card-pulse"
                onClick={() => {
                  const id = Date.now().toString();
                  const newFriend: Friend = {
                    id,
                    name: "",
                    profileIcon: "icon-person-1-color",
                    type: null,
                    amount: 0,
                    relation: "",
                    date: "",
                  };

                  addFriend(newFriend);
                  openFriendForm(id);
                }}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  cursor: "pointer",
                  border: `1px solid ${adaptive.grey200}`,
                }}
              >
                <Asset.Icon
                  name="icon-plus-circle-mono"
                  frameShape={Asset.frameShape.CleanW24}
                  color={adaptive.grey600}
                  style={{ width: 40, height: 40 }}
                />
                <Text
                  typography="t7"
                  fontWeight="regular"
                  style={{ color: adaptive.grey700 }}
                >
                  추가
                </Text>
              </div>

              {friends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => {
                    openFriendForm(friend.id);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px 8px",
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    cursor: "pointer",
                    border: `1px solid ${
                      friend.type === "축의금"
                        ? "rgba(0, 100, 255, 0.15)"
                        : friend.type === "조의금"
                          ? adaptive.grey200
                          : adaptive.grey200
                    }`,
                    position: "relative",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    overflow: "hidden",
                  }}
                >
                  {/* 구분 배지 */}
                  {friend.type && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        fontSize: "10px",
                        fontWeight: "bold",
                        backgroundColor:
                          friend.type === "축의금"
                            ? "rgba(0, 100, 255, 0.08)"
                            : "rgba(107, 107, 107, 0.08)",
                        color:
                          friend.type === "축의금"
                            ? adaptive.blue600
                            : adaptive.grey600,
                      }}
                    >
                      {friend.type === "축의금" ? "축" : "조"}
                    </div>
                  )}

                  <div
                    style={{
                      filter:
                        friend.type === "조의금" ? "grayscale(1)" : "none",
                      transition: "transform 0.2s",
                    }}
                  >
                    {isEmojiCode(friend.profileIcon) ? (
                      <div style={{ fontSize: 60, lineHeight: 1 }}>
                        {emojiCodeToString(friend.profileIcon)}
                      </div>
                    ) : (
                      <Asset.Icon
                        name={
                          friend.profileIcon as unknown as Parameters<
                            typeof Asset.Icon
                          >[0]["name"]
                        }
                        frameShape={Asset.frameShape.CleanW24}
                        style={{ width: 60, height: 60 }}
                      />
                    )}
                  </div>
                  <Spacing size={12} />
                  <Text
                    typography="t7"
                    fontWeight="semibold"
                    color={adaptive.grey800}
                  >
                    {friend.name}
                  </Text>
                  {friend.amount > 0 && (
                    <Text
                      typography="t7"
                      color={
                        friend.type === "축의금"
                          ? adaptive.blue600
                          : adaptive.grey500
                      }
                      style={{ marginTop: "2px" }}
                    >
                      {friend.amount.toLocaleString()}원
                    </Text>
                  )}
                </div>
              ))}

              {shouldShowNextAdBadge ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px 8px",
                    backgroundColor: "transparent",
                    borderRadius: "16px",
                    border: `2px dashed ${adaptive.grey400}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      typography="t7"
                      fontWeight="semibold"
                      color={adaptive.grey700}
                      style={{ textAlign: "center" }}
                    >
                      광고 타임
                    </Text>
                    <Text
                      typography="t3"
                      fontWeight="bold"
                      color={adaptive.grey700}
                    >
                      😅
                    </Text>
                  </div>
                </div>
              ) : null}
            </div>
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
