import { useState, useEffect } from "react";
import {
  Asset,
  BottomSheet,
  List,
  ListRow,
  Text,
  Button,
  Spacing,
  TextField,
} from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Friend } from "@/types/friend";
import { ProfileImageBottomSheet } from "@/components/friend/ProfileImageBottomSheet";
import { FormAvatar } from "@/components/friend/form/FormAvatar";
import { FormTypeSelector } from "@/components/friend/form/FormTypeSelector";
import { FormAdditionalInfo } from "@/components/friend/form/FormAdditionalInfo";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface Props {
  open: boolean;
  friend: Friend | null;
  onClose: () => void;
  onOpenAmountInput: () => void;
  onHome: () => void;
}

export function FriendFormBottomSheet({
  open,
  friend,
  onClose,
  onOpenAmountInput,
  onHome,
}: Props) {
  const updateFriend = useFriendStore((state) => state.updateFriend);
  const removeFriend = useFriendStore((state) => state.removeFriend);
  const setSelectedFriendId = useFriendStore(
    (state) => state.setSelectedFriendId,
  );
  const editingFriend = useFriendStore((state) => state.editingFriend);
  const setEditingFriend = useFriendStore((state) => state.setEditingFriend);

  const addFriend = useFriendStore((state) => state.addFriend);
  const selectedFriendId = useFriendStore((state) => state.selectedFriendId);

  const [expanded, setExpanded] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [isProfilePickerOpen, setIsProfilePickerOpen] = useState(false);

  useEffect(() => {
    if (open && friend && !editingFriend) {
      setEditingFriend({ ...friend });
    }
  }, [open, friend, editingFriend, setEditingFriend]);

  const handleClose = () => {
    setExpanded(false);
    setShowValidationError(false);
    onClose();
  };

  const currentFriend = editingFriend || friend;
  if (!currentFriend) return null;

  const isCreateMode = selectedFriendId === "new";
  const isNameInvalid = showValidationError && currentFriend.name.trim() === "";
  const isTypeInvalid = showValidationError && currentFriend.type == null;
  const isAmountInvalid = showValidationError && currentFriend.amount <= 0;

  const handleSave = () => {
    const isValid =
      currentFriend.name.trim() !== "" && currentFriend.type != null;
    if (!isValid) {
      setShowValidationError(true);
      return;
    }

    if (isCreateMode) {
      addFriend(currentFriend);
    } else if (friend) {
      updateFriend(friend.id, currentFriend);
    }
    handleClose();
  };

  const handleDelete = () => {
    if (isCreateMode) {
      handleClose();
      return;
    }

    if (friend) {
      removeFriend(friend.id);
      setSelectedFriendId(null);
    }
    handleClose();
  };

  return (
    <>
      <BottomSheet
        open={open}
        onClose={handleClose}
        maxHeight={"90vh"}
        header={
          <div style={{ padding: "16px 20px" }}>
            <Text typography="t4" fontWeight="bold">
              {isCreateMode ? "추가하기" : `${currentFriend.name} 정보 수정`}
            </Text>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
          }}
        >
          {/* 스크롤 가능한 본문 영역 */}
          <div
            style={{
              overflowY: "auto",
              paddingBottom: "12px",
            }}
          >
            <Spacing size={10} />
            <FormAvatar
              iconName={currentFriend.profileIcon}
              type={currentFriend.type}
              onClick={() => setIsProfilePickerOpen(true)}
            />
            <Spacing size={2} />

            <List>
              <TextField
                variant="line"
                label="이름"
                labelOption="sustain"
                value={currentFriend.name}
                onChange={(e) =>
                  setEditingFriend({ ...currentFriend, name: e.target.value })
                }
                placeholder="이름"
                hasError={isNameInvalid}
                help={isNameInvalid ? "이름을 입력해주세요" : undefined}
              />

              <FormTypeSelector
                value={currentFriend.type}
                onChange={(type) => {
                  if (showValidationError) setShowValidationError(false);
                  setEditingFriend({ ...currentFriend, type });
                }}
              />

              {isTypeInvalid && (
                <div style={{ padding: "6px 20px 0" }}>
                  <Text typography="t7" color={adaptive.red500}>
                    어떤 상황인지 선택해주세요
                  </Text>
                </div>
              )}

              <div className="add-card-pulse">
                <ListRow
                  contents={<ListRow.Texts type="1RowTypeA" top="금액" />}
                  right={
                    currentFriend.amount > 0 ? (
                      <Text color={adaptive.grey600}>
                        {currentFriend.amount.toLocaleString()}원
                      </Text>
                    ) : (
                      <Text color={adaptive.grey500}>입력하기</Text>
                    )
                  }
                  onClick={() => {
                    onOpenAmountInput();
                  }}
                  arrowType="right"
                />
              </div>

              {isAmountInvalid && (
                <div style={{ padding: "6px 20px 0" }}>
                  <Text typography="t7" color={adaptive.red500}>
                    금액을 입력해주세요
                  </Text>
                </div>
              )}

              <ListRow
                contents={
                  <Text typography="t7" color={adaptive.grey600}>
                    추가 정보 (선택)
                  </Text>
                }
                verticalPadding="small"
                arrowType={expanded ? "down" : "right"}
                onClick={() => {
                  const nextExpanded = !expanded;
                  setExpanded(nextExpanded);
                  if (nextExpanded && !currentFriend.date) {
                    const today = new Date().toISOString().split("T")[0];
                    setEditingFriend({ ...currentFriend, date: today });
                  }
                }}
              />

              <FormAdditionalInfo
                expanded={expanded}
                relation={currentFriend.relation}
                date={currentFriend.date}
                onRelationChange={(rel) =>
                  setEditingFriend({
                    ...currentFriend,
                    relation: rel,
                  })
                }
                onDateChange={(val) =>
                  setEditingFriend({
                    ...currentFriend,
                    date: val,
                  })
                }
              />
            </List>
          </div>

          {/* 하단 고정 버튼 영역 */}
          <div
            style={{
              padding: "16px 20px calc(24px + env(safe-area-inset-bottom))",
              display: "flex",
              gap: "12px",
              backgroundColor: "#ffffff",
              borderTop: `1px solid ${adaptive.grey100}`,
              boxShadow: "0 -4px 10px rgba(0,0,0,0.02)",
            }}
          >
            <Button
              style={{ flex: 1 }}
              variant="weak"
              size="medium"
              onClick={handleDelete}
            >
              삭제
            </Button>
            <Button
              style={{ flex: 1 }}
              variant="fill"
              size="medium"
              onClick={handleSave}
            >
              저장
            </Button>
          </div>
        </div>
      </BottomSheet>

      <ProfileImageBottomSheet
        open={isProfilePickerOpen}
        onClose={() => setIsProfilePickerOpen(false)}
        onHome={onHome}
        currentIcon={
          (currentFriend?.profileIcon?.startsWith("icon-")
            ? currentFriend.profileIcon
            : "icon-face-cap") as IconName
        }
        onSelect={(icon) => {
          if (currentFriend) {
            setEditingFriend({ ...currentFriend, profileIcon: icon });
          }
          setIsProfilePickerOpen(false);
        }}
      />
    </>
  );
}
