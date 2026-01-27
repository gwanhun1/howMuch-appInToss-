import { Asset, Spacing, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { AppHeader } from "@/components/common/AppHeader";
import { useFriendStore } from "@/stores/useFriendStore";
import { FriendFormBottomSheet } from "@/components/friend/FriendFormBottomSheet";
import { ProfileImageBottomSheet } from "@/components/friend/ProfileImageBottomSheet";
import { AmountInputPage } from "@/pages/AmountInputPage";

export function MainPage() {
  const {
    friends,
    selectedFriendId,
    currentPage,
    isFriendFormOpen,
    isProfileImageSheetOpen,
    updateFriend,
    openFriendForm,
    closeFriendForm,
    openProfileImageSheet,
    closeProfileImageSheet,
    openAmountInput,
    closeAmountInput,
    resetToMain,
  } = useFriendStore();

  const selectedFriend = friends.find((f) => f.id === selectedFriendId) || null;

  if (currentPage === "amountInput" && selectedFriend) {
    return (
      <AmountInputPage
        value={selectedFriend.amount}
        onBack={closeAmountInput}
        onHome={resetToMain}
        onSave={(val) => {
          updateFriend(selectedFriend.id, { amount: val });
          closeAmountInput();
        }}
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: adaptive.grey50,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
          }}
        >
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
                borderRadius: "16px",
                cursor: "pointer",
              }}
            >
              <Asset.Icon
                name={
                  friend.profileIcon as unknown as Parameters<
                    typeof Asset.Icon
                  >[0]["name"]
                }
                frameShape={Asset.frameShape.CleanW24}
                style={{ width: 40, height: 40 }}
              />
              <Text
                typography="t7"
                fontWeight="regular"
                style={{ marginTop: "8px", color: adaptive.grey700 }}
              >
                {friend.name}
              </Text>
            </div>
          ))}
        </div>
      </div>

      <FriendFormBottomSheet
        open={isFriendFormOpen}
        friend={selectedFriend}
        onClose={closeFriendForm}
        onOpenAmountInput={() => {
          openAmountInput();
        }}
        onOpenProfilePicker={openProfileImageSheet}
      />

      <ProfileImageBottomSheet
        open={isProfileImageSheetOpen}
        onClose={closeProfileImageSheet}
        onHome={resetToMain}
        currentIcon={selectedFriend?.profileIcon || "icon-animal-dog-color"}
        onSelect={(icon) => {
          if (selectedFriend)
            updateFriend(selectedFriend.id, { profileIcon: icon });
        }}
      />
    </div>
  );
}
