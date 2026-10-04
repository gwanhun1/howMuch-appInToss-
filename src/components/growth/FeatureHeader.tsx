import { Button, Text } from "@toss/tds-mobile";
import { useTossBackEvent } from "@/hooks/useTossBackEvent";

export function FeatureHeader({ title, onBack }: { title: string; onBack: () => void }) {
  useTossBackEvent(onBack);
  return <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px" }}>
    {!("ReactNativeWebView" in window) && <Button size="small" variant="weak" onClick={onBack}>돌아가기</Button>}
    <Text typography="t5" fontWeight="bold">{title}</Text>
  </header>;
}
