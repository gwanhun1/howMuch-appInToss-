import { useEffect, useState } from "react";
import { Asset, BottomSheet, Button, Text, Spacing } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { emojiCodeToString } from "@/utils/emoji";

interface Props {
  open: boolean;
  onClose: () => void;
  onHome: () => void;
  onSelect: (icon: string) => void;
  currentIcon: string;
}

const PROFILE_ICONS = [
  { code: "u1F428", name: "smirking-face" },
  { code: "u1F438", name: "smirking-face" },
  { code: "u1F981", name: "smirking-face" },
  { code: "u1F42E", name: "smirking-face" },
  { code: "u1F436", name: "smirking-face" },
  { code: "u1F42F", name: "smirking-face" },
  { code: "u1F98A", name: "grinning-face" },
  { code: "u1F435", name: "grinning-face" },
  { code: "u1F430", name: "grinning-face" },
  { code: "u1F43C", name: "grinning-face" },
  { code: "u1F42D", name: "slightly-smiling-face" },
  { code: "u1F437", name: "face-with-tears-of-joy" },
  { code: "u1F47D", name: "grinning-face-big-eyes" },
  { code: "u1F921", name: "grinning-face-smiling-eyes" },
  { code: "u1F4A9", name: "grinning-sweat" },
  { code: "u1F916", name: "rolling-on-floor-laughing" },
  { code: "u1F608", name: "upside-down-face" },
  { code: "u1F479", name: "winking-face" },
] as const;

export function ProfileImageBottomSheet({
  open,
  onClose,
  onHome,
  onSelect,
  currentIcon,
}: Props) {
  const defaultIcon = PROFILE_ICONS[0].code;

  const [selected, setSelected] = useState<string>(currentIcon);

  useEffect(() => {
    if (!open) return;
    setSelected(currentIcon || defaultIcon);
  }, [open, currentIcon, defaultIcon]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      maxHeight="90vh"
      cta={
        <BottomSheet.DoubleCTA
          leftButton={
            <Button
              variant="weak"
              onClick={() => {
                onClose();
              }}
            >
              취소
            </Button>
          }
          rightButton={
            <Button
              onClick={() => {
                onSelect(selected);
                onClose();
              }}
            >
              저장
            </Button>
          }
        />
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "80vh", // 고정 높이를 주어 뒤 시트를 가리도록 함
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text typography="t4" fontWeight="bold">
            프로필 아이콘 선택
          </Text>
          <Asset.Icon
            name="icon-home-mono"
            frameShape={Asset.frameShape.CleanW24}
            color={adaptive.grey500}
            onClick={onHome}
            style={{ cursor: "pointer" }}
          />
        </div>

        <Spacing size={24} />

        {/* Preview */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              backgroundColor: "#D6E6FB",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 64, lineHeight: 1 }}>
              {emojiCodeToString(selected)}
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelected(defaultIcon);
              }}
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
                cursor: "pointer",
              }}
            >
              <Asset.Icon
                name="icon-minus-circle-mono"
                frameShape={Asset.frameShape.CleanW16}
                color={adaptive.grey500}
                style={{ width: 30, height: 30 }}
              />
            </div>
          </div>
        </div>

        {/* Scroll area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 8,
              padding: "0 16px 16px",
            }}
          >
            {PROFILE_ICONS.map((iconItem) => (
              <div
                key={iconItem.code}
                onClick={() => setSelected(iconItem.code)}
                style={{
                  aspectRatio: "1 / 1",
                  borderRadius: "50%",
                  backgroundColor:
                    selected === iconItem.code
                      ? adaptive.grey100
                      : adaptive.grey50,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  border:
                    selected === iconItem.code
                      ? `2px solid ${adaptive.blue500}`
                      : "none",
                }}
              >
                <div style={{ fontSize: 40, lineHeight: 1 }}>
                  {emojiCodeToString(iconItem.code)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
