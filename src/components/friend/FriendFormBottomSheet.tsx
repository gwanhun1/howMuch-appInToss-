import {
  Asset,
  BottomSheet,
  List,
  ListRow,
  Text,
  Button,
  Spacing,
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
  if (!friend) return null;

  const relationOptions = ["친구", "가족", "지인", "직장", "동료"];

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight={"90vh"}>
      <div
        style={{
          padding: "16px 20px",
        }}
      >
        <Text typography="t4" fontWeight="bold">
          {friend.name} 정보 수정
        </Text>
      </div>

      <Spacing size={32} />
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
            width: 80,
            height: 80,
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
            style={{ width: 56, height: 56 }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "#ffffff",
              borderRadius: "50%",
              padding: "4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <Asset.Icon
              name="icon-plus-mono"
              frameShape={Asset.frameShape.CleanW16}
              color={adaptive.grey500}
            />
          </div>
        </div>
      </div>
      <Spacing size={32} />

      <List>
        <ListRow
          contents={
            <div style={{ flex: 1 }}>
              <Text
                typography="t7"
                color={adaptive.grey600}
                style={{ marginBottom: "6px" }}
              >
                이름
              </Text>
              <input
                type="text"
                value={friend.name}
                onChange={(e) =>
                  updateFriend(friend.id, { name: e.target.value })
                }
                placeholder="이름을 입력하세요"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "14px",
                  border: `1px solid ${adaptive.grey300}`,
                  borderRadius: "6px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
          }
        />
        <ListRow
          contents={<ListRow.Texts type="1RowTypeB" top="어떤 상황인가요?" />}
          right={
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                variant={friend.type === "축의금" ? "fill" : "weak"}
                size="small"
                onClick={() => updateFriend(friend.id, { type: "축의금" })}
              >
                축의금
              </Button>
              <Button
                variant={friend.type === "조의금" ? "fill" : "weak"}
                size="small"
                onClick={() => updateFriend(friend.id, { type: "조의금" })}
              >
                조의금
              </Button>
            </div>
          }
        />
        <ListRow
          contents={<ListRow.Texts type="1RowTypeA" top="금액" />}
          right={
            <Text color={adaptive.grey600}>
              {friend.amount.toLocaleString()}원
            </Text>
          }
          onClick={onOpenAmountInput}
          arrowType="right"
        />
        <ListRow
          contents={
            <div style={{ flex: 1, paddingRight: "16px" }}>
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
          contents={
            <div style={{ flex: 1 }}>
              <Text
                typography="t7"
                color={adaptive.grey600}
                style={{ marginBottom: "6px" }}
              >
                날짜
              </Text>
              <input
                type="date"
                value={friend.date}
                onChange={(e) =>
                  updateFriend(friend.id, { date: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "14px",
                  border: `1px solid ${adaptive.grey300}`,
                  borderRadius: "6px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
          }
        />
      </List>
      <div style={{ padding: "20px" }}>
        <Button onClick={onClose} style={{ width: "100%" }} variant="fill">
          저장
        </Button>
      </div>
    </BottomSheet>
  );
}
