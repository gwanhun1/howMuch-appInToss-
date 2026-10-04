import { useEffect, useRef, useState } from "react";
import { attachBannerAd, getBannerAdId } from "@/apis/bannerAd";
import type { BannerSlot } from "@/apis/bannerAd/type";

export function useBannerAd() {
  const target = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const id = getBannerAdId();
  const enabled = !!id && !unavailable && "ReactNativeWebView" in window;

  useEffect(() => {
    if (!enabled || !id || !target.current) return;
    let cancelled = false;
    let slot: BannerSlot | null = null;
    const fail = () => { if (!cancelled) setUnavailable(true); };
    void attachBannerAd(id, target.current, () => cancelled, fail)
      .then((result) => {
        if (cancelled) result?.destroy();
        else {
          slot = result;
          if (!result) fail();
        }
      })
      .catch(fail);
    return () => {
      cancelled = true;
      slot?.destroy();
    };
  }, [enabled, id]);

  return { target, enabled };
}
