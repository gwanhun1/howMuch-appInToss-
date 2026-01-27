import { useState } from "react";
import { Asset, BottomSheet, Button, Text, Spacing } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

interface Props {
  open: boolean;
  onClose: () => void;
  onHome: () => void;
  onSelect: (icon: string) => void;
  currentIcon: string;
}

export function ProfileImageBottomSheet({
  open,
  onClose,
  onHome,
  onSelect,
  currentIcon,
}: Props) {
  const icons = [
    "icon-person-1-color",
    "icon-person-2-color",
    "icon-person-3-color",
    "icon-person-4-color",
    "icon-person-5-color",
    "icon-person-6-color",
    "icon-person-7-color",
    "icon-person-8-color",
    "icon-person-9-color",
    "icon-person-10-color",
    "icon-person-11-color",
    "icon-person-12-color",
  ];
  const [selected, setSelected] = useState<string>(currentIcon);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      cta={
        <BottomSheet.DoubleCTA
          leftButton={
            <Button
              variant="weak"
              onClick={() => {
                onClose();
              }}
            >
              지우기
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
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text typography="t4" fontWeight="bold">
          프로필 이미지 선택
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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
            marginBottom: "32px",
            position: "relative",
          }}
        >
          <Asset.Icon
            name={
              selected as unknown as Parameters<typeof Asset.Icon>[0]["name"]
            }
            frameShape={Asset.frameShape.CleanW24}
            style={{ width: 64, height: 64 }}
          />
        </div>
        <Spacing size={32} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "12px",
            padding: "0 24px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {icons.map((icon) => (
            <div
              key={icon}
              onClick={() => setSelected(icon)}
              style={{
                aspectRatio: "1/1",
                borderRadius: "50%",
                backgroundColor:
                  selected === icon ? adaptive.grey100 : adaptive.grey50,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                border:
                  selected === icon ? `2px solid ${adaptive.blue500}` : "none",
              }}
            >
              <Asset.Icon
                name={
                  icon as unknown as Parameters<typeof Asset.Icon>[0]["name"]
                }
                frameShape={Asset.frameShape.CleanW24}
                style={{ width: 32, height: 32 }}
              />
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
