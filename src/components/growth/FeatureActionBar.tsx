import type { ReactNode } from "react";
import { useElementHeight } from "@/hooks/useElementHeight";
import "./growth.css";

export function FeatureActionBar({ children }: { children: ReactNode }) {
  const { ref, height } = useElementHeight<HTMLDivElement>();
  return <>
    <div aria-hidden="true" style={{ height: height + 16 }} />
    <div ref={ref} className="growth-action-bar">{children}</div>
  </>;
}
