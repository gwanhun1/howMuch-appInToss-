import { useEffect, useState } from "react";
import { Asset, BottomSheet, Button, Text, Spacing } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

interface Props {
  open: boolean;
  onClose: () => void;
  onHome: () => void;
  onSelect: (icon: string) => void;
  currentIcon: string;
}

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

const PROFILE_ICONS: Array<{ code: IconName }> = [
  { code: "icon-face-cap" },
  { code: "icon-face-bandana" },
  { code: "icon-santa-face" },
  { code: "icon-box-cat-grey-v2" },
  { code: "icon-quokka" },
  { code: "icon-anipang" },
  { code: "icon-penguin-face" },
  { code: "icon-dog-siback-face1" },
];

const DEFAULT_ICON: IconName = "icon-face-cap";

export function ProfileImageBottomSheet({
  open,
  onClose,
  onHome,
  onSelect,
  currentIcon,
}: Props) {
  const [selected, setSelected] = useState<IconName>(() => {
    const found = PROFILE_ICONS.find((i) => i.code === currentIcon);
    return found ? found.code : DEFAULT_ICON;
  });

  useEffect(() => {
    if (!open) return;
    const found = PROFILE_ICONS.find((i) => i.code === currentIcon);
    setSelected(found ? found.code : DEFAULT_ICON);
  }, [open, currentIcon]);

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
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              marginBottom: 24,
            }}
          >
            <Asset.Icon
              name={selected}
              frameShape={Asset.frameShape.CleanW100}
              style={{
                transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelected(DEFAULT_ICON);
              }}
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                backgroundColor: adaptive.grey50,
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
                cursor: "pointer",
                border: `1px solid ${adaptive.grey100}`,
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <Asset.Icon
                name="icon-plus-mono"
                frameShape={Asset.frameShape.CleanW16}
                color={adaptive.grey600}
                style={{ transform: "rotate(45deg)", width: 24, height: 24 }}
              />
            </div>
          </div>
        </div>

        <Spacing size={24} />

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
                  borderRadius: "16px",
                  backgroundColor:
                    selected === iconItem.code
                      ? adaptive.blue50
                      : adaptive.grey50,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  border:
                    selected === iconItem.code
                      ? `2px solid ${adaptive.blue500}`
                      : `1px solid transparent`,
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Asset.Icon
                  name={iconItem.code}
                  frameShape={Asset.frameShape.CleanW60}
                  style={{
                    transform:
                      selected === iconItem.code ? "scale(1.1)" : "scale(1)",
                    transition: "transform 0.2s",
                  }}
                />
                {selected === iconItem.code && (
                  <div
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: adaptive.blue500,
                      borderRadius: "50%",
                      width: 14,
                      height: 14,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 3,
                        borderBottom: "2px solid white",
                        borderLeft: "2px solid white",
                        transform: "rotate(-45deg) translate(1px, -1px)",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
