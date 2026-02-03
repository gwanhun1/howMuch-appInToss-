/**
 * 토스 앱인토스(AIT) 광고 SDK 연동 서비스
 */
import { GoogleAdMob } from "@apps-in-toss/web-framework";

/** 광고 그룹 ID */
export const AD_GROUP_IDS = {
  REWARDED: "ait-ad-test-rewarded-id", // 보상형 광고 (추후 확장용)
  INTERSTITIAL: "ait-ad-test-interstitial-id", // 전면형 광고
} as const;

/** 광고 재시도 설정 */
const AD_RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  DELAYS_MS: [1000, 3000, 5000],
  WAIT_TIMEOUT_MS: 10000, // 광고 로드 최대 대기 시간
} as const;

export type AdType = "rewarded" | "interstitial";

export const adService = {
  /**
   * 광고 기능 지원 여부 확인
   */
  isSupported: () => {
    return GoogleAdMob.loadAppsInTossAdMob.isSupported?.() === true;
  },

  /**
   * 광고를 미리 로드합니다. (Retry 로직 포함)
   */
  loadAd: (
    type: AdType = "interstitial",
    attempt: number = 0,
    onSuccess?: () => void,
    onError?: (error: unknown) => void,
  ): (() => void) | undefined => {
    const adGroupId =
      type === "rewarded" ? AD_GROUP_IDS.REWARDED : AD_GROUP_IDS.INTERSTITIAL;

    if (!adService.isSupported()) {
      console.warn(`[AdService] 광고 기능 미지원 환경입니다.`);
      onError?.(new Error("NOT_SUPPORTED"));
      return undefined;
    }

    console.log(
      `[AdService] 광고 로드 시도 (${attempt + 1}/${AD_RETRY_CONFIG.MAX_ATTEMPTS + 1})`,
    );

    const cleanup = GoogleAdMob.loadAppsInTossAdMob({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === "loaded") {
          console.log(`[AdService] 광고 로드 성공: ${adGroupId}`);
          onSuccess?.();
        }
      },
      onError: (error) => {
        console.error(`[AdService] 광고 로드 실패:`, error);

        // 재시도 로직
        if (attempt < AD_RETRY_CONFIG.MAX_ATTEMPTS) {
          const delay = AD_RETRY_CONFIG.DELAYS_MS[attempt] || 5000;
          setTimeout(() => {
            adService.loadAd(type, attempt + 1, onSuccess, onError);
          }, delay);
        } else {
          onError?.(error);
        }
      },
    });

    return cleanup;
  },

  /**
   * 광고를 노출합니다.
   */
  showAd: (
    type: AdType = "interstitial",
    callbacks: {
      onDismissed: (rewardEarned?: boolean) => void;
      onError: (error: unknown) => void;
    },
  ) => {
    const adGroupId =
      type === "rewarded" ? AD_GROUP_IDS.REWARDED : AD_GROUP_IDS.INTERSTITIAL;
    let rewardEarned = false;

    if (!GoogleAdMob.showAppsInTossAdMob.isSupported?.()) {
      console.warn("[AdService] 광고 표시 미지원 환경");
      callbacks.onDismissed(true); // 지원 안하면 그냥 통과
      return;
    }

    GoogleAdMob.showAppsInTossAdMob({
      options: { adGroupId },
      onEvent: (event) => {
        console.log(`[AdService] 광고 이벤트: ${event.type}`, event.data);

        if (event.type === "userEarnedReward") {
          rewardEarned = true;
        }

        if (event.type === "dismissed") {
          callbacks.onDismissed(rewardEarned);
        }

        if (event.type === "failedToShow") {
          callbacks.onError(event.data);
        }
      },
      onError: (error) => {
        console.error("[AdService] 광고 표시 에러:", error);
        callbacks.onError(error);
      },
    });
  },

  /**
   * 광고 노출 마일스톤 여부를 판단합니다.
   */
  checkIsMilestone: (count: number, lastAdMilestone: number): boolean => {
    // 테스트용으로 1개일 때 바로 나오게 설정되어 있을 수 있으나,
    // 기본적으로는 5단위로 설정 (필요시 조정 가능)
    return count > 0 && count % 5 === 0 && count > lastAdMilestone;
  },

  WAIT_TIMEOUT_MS: AD_RETRY_CONFIG.WAIT_TIMEOUT_MS,
};
