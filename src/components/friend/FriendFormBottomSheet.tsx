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

  const relationOptions = ["친구", "가족", "지인", "직장", "동료"];

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
            maxHeight: "90vh", // 시트 전체의 최대 높이만 제한
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                onClick={() => setIsProfilePickerOpen(true)}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  cursor: "pointer",
                  filter:
                    currentFriend.type === "조의금" ? "grayscale(1)" : "none",
                }}
              >
                <Asset.Icon
                  name={
                    (currentFriend.profileIcon?.startsWith("icon-")
                      ? currentFriend.profileIcon
                      : "icon-face-cap") as IconName
                  }
                  frameShape={Asset.frameShape.CleanW100}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "#ffffff",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <Asset.Icon
                    name="icon-plus-mono"
                    frameShape={Asset.frameShape.CleanW16}
                    color={adaptive.grey500}
                    style={{ width: 30, height: 30 }}
                  />
                </div>
              </div>
            </div>
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
              <ListRow
                contents={
                  <ListRow.Texts type="1RowTypeB" top="어떤 상황인가요?" />
                }
                right={
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      variant={
                        currentFriend.type === "축의금" ? "fill" : "weak"
                      }
                      size="small"
                      onClick={() => {
                        if (showValidationError) setShowValidationError(false);
                        setEditingFriend({ ...currentFriend, type: "축의금" });
                      }}
                    >
                      축의금
                    </Button>
                    <Button
                      variant={
                        currentFriend.type === "조의금" ? "fill" : "weak"
                      }
                      size="small"
                      onClick={() => {
                        if (showValidationError) setShowValidationError(false);
                        setEditingFriend({ ...currentFriend, type: "조의금" });
                      }}
                    >
                      조의금
                    </Button>
                  </div>
                }
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
              <div
                style={{
                  display: "grid",
                  gridTemplateRows: expanded ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.3s ease-out",
                  overflow: "hidden",
                }}
              >
                <div style={{ minHeight: 0 }}>
                  <div
                    style={{
                      padding: "0 20px",
                      opacity: expanded ? 1 : 0,
                      transition: "opacity 0.2s ease-in-out",
                    }}
                  >
                    <Spacing size={12} />
                    <Text typography="t7" color={adaptive.grey600}>
                      관계
                    </Text>
                    <Spacing size={8} />
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {relationOptions.map((rel) => (
                        <Button
                          key={rel}
                          variant={
                            currentFriend.relation === rel ? "fill" : "weak"
                          }
                          size="small"
                          onClick={() =>
                            setEditingFriend({
                              ...currentFriend,
                              relation: rel,
                            })
                          }
                        >
                          {rel}
                        </Button>
                      ))}
                    </div>
                    <Spacing size={16} />
                    <TextField
                      variant="line"
                      label="날짜"
                      type="date"
                      value={currentFriend.date}
                      onChange={(e) =>
                        setEditingFriend({
                          ...currentFriend,
                          date: e.target.value,
                        })
                      }
                    />
                    <Spacing size={20} />
                  </div>
                </div>
              </div>
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
