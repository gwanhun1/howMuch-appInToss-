import { Button, Text } from "@toss/tds-mobile";
import { useTossBackEvent } from "@/hooks/useTossBackEvent";
import "./growth.css";

export function FeatureHeader({ title, onBack }: { title: string; onBack: () => void }) {
  useTossBackEvent(onBack);
  return <header className="growth-header">
    {!("ReactNativeWebView" in window) && <Button size="small" variant="weak" onClick={onBack}>돌아가기</Button>}
    <Text typography="t5" fontWeight="bold">{title}</Text>
  </header>;
}
