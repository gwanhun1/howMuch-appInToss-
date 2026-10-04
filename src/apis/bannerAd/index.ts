import type { BannerSlot } from "./type";

export const TEST_BANNER_ID = "ait-ad-test-banner-id";
let initialization: Promise<void> | undefined;

// 운영 광고는 명시적으로 활성화하고 콘솔에서 발급한 ID를 설정해야 해요.
export function getBannerAdId(): string | null {
  const mode = import.meta.env.VITE_BANNER_AD_MODE;
  if (mode === "test") return TEST_BANNER_ID;
  if (mode !== "live" || import.meta.env.MODE === "qa" || import.meta.env.DEV) return null;
  const id = import.meta.env.VITE_BANNER_AD_GROUP_ID?.trim();
  return id && !id.startsWith("ait-ad-test-") ? id : null;
}

export async function attachBannerAd(
  id: string,
  element: HTMLElement,
  isCancelled: () => boolean,
  onUnavailable: () => void,
): Promise<BannerSlot | null> {
  if (!("ReactNativeWebView" in window)) return null;
  const { TossAds } = await import("@apps-in-toss/web-framework");
  if (!TossAds.initialize.isSupported() || !TossAds.attachBanner.isSupported()) return null;
  initialization ??= new Promise<void>((resolve, reject) => {
    TossAds.initialize({ callbacks: { onInitialized: resolve, onInitializationFailed: reject } });
  });
  await initialization;
  if (isCancelled()) return null;
  return TossAds.attachBanner(id, element, {
    theme: "auto",
    tone: "grey",
    variant: "expanded",
    callbacks: { onNoFill: onUnavailable, onAdFailedToRender: onUnavailable },
  });
}
