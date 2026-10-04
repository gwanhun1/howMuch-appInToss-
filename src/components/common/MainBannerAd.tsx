import { useBannerAd } from "@/hooks/useBannerAd";

export function MainBannerAd() {
  const { target, enabled } = useBannerAd();
  if (!enabled) return null;
  return (
    <aside aria-label="광고" style={{ width: "100%", margin: "32px 0" }}
      onTouchStart={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}>
      <div ref={target} style={{ width: "100%", minHeight: 96 }} />
    </aside>
  );
}
