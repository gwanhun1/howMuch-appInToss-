import { useEffect, useState } from "react";
import { Asset, BottomSheet, Button, Text, Spacing } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { ProfileIconPreview } from "../../../../components/profile/ProfileIconPreview";
import { ProfileIconGrid } from "../../../../components/profile/ProfileIconGrid";

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
  { code: "icon-fairy-face" },
  { code: "icon-emoji-pig-face" },
  { code: "icon-emoji-angry-face-with-horns" },
  { code: "icon-emoji-cow-yellow" },
  { code: "icon-mole" },
  { code: "icon-king-blonde" },
  { code: "icon-blue-dragon" },
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
      header={
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Text typography="t4" fontWeight="bold" style={{ minWidth: 0, overflowWrap: "anywhere" }}>
            프로필 아이콘 선택
          </Text>
          <Asset.Icon
            name="icon-home-mono"
            frameShape={Asset.frameShape.CleanW24}
            color={adaptive.grey500}
            onClick={onHome}
            style={{ cursor: "pointer", flexShrink: 0 }}
          />
        </div>
      }
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
          minWidth: 0,
        }}
      >
        {/* 본문 스크롤은 BottomSheet가 관리해요. */}
        <div
          style={{
            minWidth: 0,
          }}
        >
          <Spacing size={24} />
          <ProfileIconPreview iconName={selected} onReset={() => setSelected(DEFAULT_ICON)} />
          <Spacing size={24} />
          <ProfileIconGrid
            icons={PROFILE_ICONS}
            selectedIcon={selected}
            onSelect={setSelected}
          />
        </div>
      </div>
    </BottomSheet>
  );
}
