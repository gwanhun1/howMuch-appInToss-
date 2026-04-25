/**
 * 토스 앱인토스(AIT) 전면형 광고 SDK 연동 서비스
 * 
 * 공식 문서 기반 구현: https://developers-apps-in-toss.toss.im/ads/develop.html
 * 
 * 핵심 규칙:
 * 1. 페이지별로 광고를 미리 로드 (load)
 * 2. 로드 완료 이벤트('loaded') 수신 후에만 show 호출
 * 3. load → show → 다음 광고 load 순서 준수
 * 4. 한 번에 1개의 광고만 로드 가능
 */
import { GoogleAdMob } from "@apps-in-toss/web-framework";

/** 전면형 광고 ID (환경변수에서 로드) */
const AD_GROUP_ID = import.meta.env.VITE_AD_GROUP_ID || "ait-ad-test-interstitial-id";

/** 광고 상태 관리 */
interface AdState {
  isLoaded: boolean;
  isLoading: boolean;
  cleanup: (() => void) | null;
  /** 진행 중인 로드 요청을 대기 중인 콜백 큐 */
  pendingCallbacks: Array<{
    onLoaded?: () => void;
    onError?: (error: unknown) => void;
  }>;
}

const adState: AdState = {
  isLoaded: false,
  isLoading: false,
  cleanup: null,
  pendingCallbacks: [],
};

/** 로드 중 쌓인 콜백 일괄 해소 */
function flushPendingCallbacks(result: "loaded" | "error", error?: unknown) {
  const queued = adState.pendingCallbacks;
  adState.pendingCallbacks = [];
  for (const cb of queued) {
    if (result === "loaded") cb.onLoaded?.();
    else cb.onError?.(error);
  }
}

export const adService = {
  /**
   * 광고 기능 지원 여부 확인
   */
  isSupported: (): boolean => {
    return GoogleAdMob.loadAppsInTossAdMob.isSupported?.() === true;
  },

  /**
   * 현재 광고 로드 상태 확인
   */
  isAdLoaded: (): boolean => {
    return adState.isLoaded;
  },

  /**
   * 현재 광고 로딩 중 여부 확인
   */
  isAdLoading: (): boolean => {
    return adState.isLoading;
  },

  /**
   * 광고를 미리 로드합니다.
   * 
   * 주의사항:
   * - 페이지별로 광고를 미리 로드해야 합니다
   * - 광고가 로드되지 않은 상태에서 show 호출 시 오류 발생
   * - 한 번에 1개의 광고만 로드 가능
   */
  loadAd: (callbacks?: {
    onLoaded?: () => void;
    onError?: (error: unknown) => void;
  }): (() => void) | undefined => {
    if (adState.isLoaded) {
      callbacks?.onLoaded?.();
      return undefined;
    }

    // 이미 로드 중이면 콜백을 큐에 등록 (무시하지 않음)
    if (adState.isLoading) {
      if (callbacks) adState.pendingCallbacks.push(callbacks);
      return undefined;
    }

    if (!adService.isSupported()) {
      console.warn("[AdService] 광고 기능 미지원 환경");
      callbacks?.onError?.(new Error("NOT_SUPPORTED"));
      return undefined;
    }

    adState.isLoading = true;
    if (callbacks) adState.pendingCallbacks.push(callbacks);

    const cleanup = GoogleAdMob.loadAppsInTossAdMob({
      options: {
        adGroupId: AD_GROUP_ID,
      },
      onEvent: (event) => {
        if (event.type === "loaded") {
          adState.isLoaded = true;
          adState.isLoading = false;
          flushPendingCallbacks("loaded");
        }
      },
      onError: (error) => {
        console.error("[AdService] 광고 로드 실패:", error);
        adState.isLoaded = false;
        adState.isLoading = false;
        flushPendingCallbacks("error", error);
      },
    });

    adState.cleanup = cleanup;
    return cleanup;
  },

  /**
   * 광고를 노출합니다.
   * 
   * 주의사항:
   * - 반드시 loadAd 호출 후 'loaded' 이벤트를 받은 후에 호출
   * - 로드되지 않은 상태에서 호출 시 오류 발생
   * - show 완료 후 다음 광고를 미리 load 권장
   */
  showAd: (callbacks: {
    onDismissed: () => void;
    onError?: (error: unknown) => void;
  }): void => {
    // show 지원 여부 확인
    if (!GoogleAdMob.showAppsInTossAdMob.isSupported?.()) {
      console.warn("[AdService] 광고 표시 미지원 환경 - 스킵");
      callbacks.onDismissed();
      return;
    }

    // 로드 상태 확인
    if (!adState.isLoaded) {
      console.warn("[AdService] 광고가 로드되지 않음 - 스킵");
      callbacks.onError?.(new Error("AD_NOT_LOADED"));
      callbacks.onDismissed();
      return;
    }

    console.log(`[AdService] 광고 표시 시작: ${AD_GROUP_ID}`);

    GoogleAdMob.showAppsInTossAdMob({
      options: {
        adGroupId: AD_GROUP_ID,
      },
      onEvent: (event) => {
        console.log(`[AdService] 광고 이벤트: ${event.type}`);

        switch (event.type) {
          case "requested":
          case "show":
          case "impression":
          case "clicked":
            break;

          case "dismissed":
            console.log("[AdService] 광고 닫힘");
            adState.isLoaded = false;
            callbacks.onDismissed();
            break;

          case "failedToShow":
            console.error("[AdService] 광고 표시 실패");
            adState.isLoaded = false;
            callbacks.onError?.(new Error("AD_FAILED_TO_SHOW"));
            callbacks.onDismissed();
            break;
        }
      },
      onError: (error) => {
        console.error("[AdService] 광고 표시 에러:", error);
        adState.isLoaded = false;
        callbacks.onError?.(error);
        callbacks.onDismissed();
      },
    });
  },

  /**
   * 광고 로드 → 표시 → 다음 광고 로드를 순차적으로 실행합니다.
   * 
   * 공식 권장 패턴: load → show → (다음 load) → show
   */
  loadAndShowAd: async (callbacks: {
    onDismissed: () => void;
    onError?: (error: unknown) => void;
  }): Promise<void> => {
    // 개발 환경에서는 alert으로 광고 트리거 확인
    if (import.meta.env.DEV && !adService.isSupported()) {
      alert("[DEV] 광고가 트리거되었습니다 (미지원 환경)");
      callbacks.onDismissed();
      return;
    }

    return new Promise((resolve) => {
      // 이미 로드된 광고가 있으면 바로 표시
      if (adState.isLoaded) {
        console.log("[AdService] 이미 로드된 광고 표시");
        adService.showAd({
          onDismissed: () => {
            callbacks.onDismissed();
            // 다음 광고 미리 로드
            adService.loadAd();
            resolve();
          },
          onError: callbacks.onError,
        });
        return;
      }

      // 타임아웃 처리 (10초)
      const timeoutId = setTimeout(() => {
        if (adState.isLoading) {
          console.warn("[AdService] 광고 로드 타임아웃 - 계속 진행");
          adState.cleanup?.();
          adState.isLoading = false;
          adState.isLoaded = false;
          flushPendingCallbacks("error", new Error("LOAD_TIMEOUT"));
          callbacks.onDismissed();
          resolve();
        }
      }, 10000);

      // 광고 로드 후 표시
      console.log("[AdService] 광고 로드 후 표시 시작");
      adService.loadAd({
        onLoaded: () => {
          clearTimeout(timeoutId); // 타임아웃 취소
          adService.showAd({
            onDismissed: () => {
              callbacks.onDismissed();
              // 다음 광고 미리 로드
              adService.loadAd();
              resolve();
            },
            onError: callbacks.onError,
          });
        },
        onError: (error) => {
          clearTimeout(timeoutId); // 타임아웃 취소
          console.error("[AdService] 광고 로드 실패 - 계속 진행:", error);
          callbacks.onError?.(error);
          callbacks.onDismissed();
          resolve();
        },
      });
    });
  },

  /**
   * 광고 상태 초기화 (cleanup)
   */
  reset: (): void => {
    adState.cleanup?.();
    adState.isLoaded = false;
    adState.isLoading = false;
    adState.cleanup = null;
    flushPendingCallbacks("error", new Error("RESET"));
  },

  /**
   * 광고 노출 마일스톤 여부를 판단합니다.
   * 5명 단위로 광고 표시 (5, 10, 15, 20...)
   */
  checkIsMilestone: (count: number, lastAdMilestone: number): boolean => {
    return count > 0 && count % 5 === 0 && count > lastAdMilestone;
  },
};
