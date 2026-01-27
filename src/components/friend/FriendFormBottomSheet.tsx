import { useState } from "react";
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

interface Props {
  open: boolean;
  friend: Friend | null;
  onClose: () => void;
  onOpenAmountInput: () => void;
  onOpenProfilePicker: () => void;
}

export function FriendFormBottomSheet({
  open,
  friend,
  onClose,
  onOpenAmountInput,
  onOpenProfilePicker,
}: Props) {
  const updateFriend = useFriendStore((state) => state.updateFriend);
  const removeFriend = useFriendStore((state) => state.removeFriend);
  const setSelectedFriendId = useFriendStore(
    (state) => state.setSelectedFriendId,
  );
  const [expanded, setExpanded] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const handleClose = () => {
    setExpanded(false);
    setShowValidationError(false);
    onClose();
  };

  if (!friend) return null;

  const isCreateMode = friend.name.trim() === "";
  const isNameInvalid = showValidationError && friend.name.trim() === "";
  const isTypeInvalid = showValidationError && friend.type == null;
  const isAmountInvalid = showValidationError && friend.amount <= 0;

  const handleSave = () => {
    const isValid =
      friend.name.trim() !== "" && friend.type != null && friend.amount > 0;
    if (!isValid) {
      setShowValidationError(true);
      return;
    }
    handleClose();
  };

  const handleDelete = () => {
    removeFriend(friend.id);
    setSelectedFriendId(null);
    handleClose();
  };

  const formattedDate =
    friend.date.trim() === "" ? "" : friend.date.replaceAll("-", ".");

  const relationOptions = ["친구", "가족", "지인", "직장", "동료"];

  return (
    <BottomSheet open={open} onClose={handleClose} maxHeight={"90vh"}>
      <div
        style={{
          padding: "16px 20px",
        }}
      >
        <Text typography="t4" fontWeight="bold">
          {isCreateMode ? "추가하기" : `${friend.name} 정보 수정`}
        </Text>
      </div>

      <Spacing size={15} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          onClick={onOpenProfilePicker}
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            backgroundColor: "#D6E6FB",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
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
            style={{ width: 72, height: 72 }}
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
        <div style={{ flex: 1, width: "100%" }}>
          <TextField
            variant="line"
            label="이름"
            labelOption="sustain"
            value={friend.name}
            onChange={(e) => updateFriend(friend.id, { name: e.target.value })}
            placeholder="이름"
            hasError={isNameInvalid}
            help={isNameInvalid ? "이름을 입력해주세요" : undefined}
            paddingTop={4}
            paddingBottom={4}
          />
        </div>
        <ListRow
          contents={<ListRow.Texts type="1RowTypeB" top="어떤 상황인가요?" />}
          right={
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                variant={friend.type === "축의금" ? "fill" : "weak"}
                size="small"
                onClick={() => {
                  if (showValidationError) setShowValidationError(false);
                  updateFriend(friend.id, { type: "축의금" });
                }}
              >
                축의금
              </Button>
              <Button
                variant={friend.type === "조의금" ? "fill" : "weak"}
                size="small"
                onClick={() => {
                  if (showValidationError) setShowValidationError(false);
                  updateFriend(friend.id, { type: "조의금" });
                }}
              >
                조의금
              </Button>
            </div>
          }
        />
        {isTypeInvalid ? (
          <div style={{ padding: "6px 20px 0" }}>
            <Text
              typography="t7"
              color={adaptive.red500}
              style={{ fontSize: "12px" }}
            >
              어떤 상황인지 선택해주세요
            </Text>
          </div>
        ) : null}
        <ListRow
          contents={<ListRow.Texts type="1RowTypeA" top="금액" />}
          right={
            friend.amount > 0 ? (
              <Text color={adaptive.grey600}>
                {friend.amount.toLocaleString()}원
              </Text>
            ) : (
              <Text color={adaptive.grey500}>입력하기</Text>
            )
          }
          onClick={onOpenAmountInput}
          arrowType="right"
        />
        {isAmountInvalid ? (
          <div style={{ padding: "6px 20px 0" }}>
            <Text
              typography="t7"
              color={adaptive.red500}
              style={{ fontSize: "12px" }}
            >
              금액을 입력해주세요
            </Text>
          </div>
        ) : null}
        <ListRow
          contents={
            <Text
              typography="t7"
              color={adaptive.grey600}
              style={{ fontSize: "13px" }}
            >
              추가 정보 (선택)
            </Text>
          }
          verticalPadding="small"
          arrowType={expanded ? "down" : "right"}
          onClick={() => setExpanded(!expanded)}
        />
        <div
          style={{
            maxHeight: expanded ? "1000px" : "0",
            overflow: "hidden",
            transition: "max-height 0.3s ease-in-out",
          }}
        >
          <ListRow
            verticalPadding="small"
            horizontalPadding="small"
            contents={
              <div style={{ flex: 1 }}>
                <Text
                  typography="t7"
                  color={adaptive.grey600}
                  style={{ marginBottom: "4px" }}
                >
                  관계
                </Text>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {relationOptions.map((rel) => (
                    <Button
                      key={rel}
                      variant={friend.relation === rel ? "fill" : "weak"}
                      size="small"
                      onClick={() => updateFriend(friend.id, { relation: rel })}
                    >
                      {rel}
                    </Button>
                  ))}
                </div>
              </div>
            }
          />
          <ListRow
            verticalPadding="small"
            horizontalPadding="small"
            contents={
              <div style={{ flex: 1 }}>
                <Text
                  typography="t7"
                  color={adaptive.grey600}
                  style={{ marginBottom: "4px" }}
                >
                  날짜
                </Text>
                <div style={{ position: "relative" }}>
                  <TextField.Button
                    variant="line"
                    label=""
                    value={formattedDate}
                    placeholder="선택"
                    paddingTop={4}
                    paddingBottom={4}
                  />
                  <input
                    type="date"
                    value={friend.date}
                    onChange={(e) =>
                      updateFriend(friend.id, { date: e.target.value })
                    }
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
            }
          />
        </div>
      </List>
      <div style={{ padding: "10px", display: "flex", gap: "8px" }}>
        <Button onClick={handleDelete} style={{ flex: 1 }} variant="weak">
          삭제
        </Button>
        <Button onClick={handleSave} style={{ flex: 1 }} variant="fill">
          저장
        </Button>
      </div>
    </BottomSheet>
  );
}
