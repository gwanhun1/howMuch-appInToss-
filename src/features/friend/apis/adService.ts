/**
 * 토스 앱인토스(AIT) 광고 SDK 연동 서비스
 * 공식 가이드에 따른 load 및 show 로직을 추상화합니다.
 */

const AD_TEST_ID = "ait-ad-test-interstitial-id";

export const adService = {
  /**
   * 전면 광고를 미리 로드합니다.
   */
  loadInterstitialAd: async (adId: string = AD_TEST_ID): Promise<void> => {
    if (window.toss?.loadAppsInTossAdMob) {
      try {
        await window.toss.loadAppsInTossAdMob({ adId });
        console.log(`[AdService] 광고 로드 성공: ${adId}`);
      } catch (error) {
        console.error("[AdService] 광고 로드 실패:", error);
      }
    }
  },

  /**
   * 전면 광고를 노출하고 닫힐 때까지 대기합니다.
   */
  showInterstitialAd: async (adId: string = AD_TEST_ID): Promise<void> => {
    if (window.toss?.showAppsInTossAdMob) {
      return new Promise<void>((resolve) => {
        window.toss?.showAppsInTossAdMob({
          adId,
          onEvent: (event) => {
            if (event === "closed" || event === "error") {
              resolve();
            }
          },
          onError: (error: unknown) => {
            console.error("[AdService] 광고 노출 에러:", error);
            resolve();
          },
        });

        // 안전장치 타임아웃
        setTimeout(resolve, 3500);
      });
    } else {
      // 비 인앱 환경 시뮬레이션
      return new Promise((resolve) => {
        alert("축하합니다! 마일스톤 달성.\n광고를 닫으시면 등록이 완료됩니다.");
        resolve();
      });
    }
  },

  /**
   * 광고 노출 마일스톤 여부를 판단합니다. (5, 10, 15...)
   */
  checkIsMilestone: (count: number, lastAdMilestone: number): boolean => {
    return count > 0 && count % 5 === 0 && count > lastAdMilestone;
  },
};
