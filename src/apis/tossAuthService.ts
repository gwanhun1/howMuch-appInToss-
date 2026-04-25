import { getAnonymousKey } from "@apps-in-toss/web-framework";

export interface TossUserMeResponse {
  userKey: string;
  scope: string;
  agreedTerms: string[];
}

/** 토스 앱 WebView 밖(브라우저 등)에서는 토스 연결이 동작하지 않음을 나타내는 마커 */
export const TOSS_APP_ONLY_ERROR = "TOSS_APP_ONLY";

export const tossAuthService = {
  async executeFullLogin(): Promise<TossUserMeResponse> {
    const result = await getAnonymousKey();

    if (result === undefined) {
      throw new Error(TOSS_APP_ONLY_ERROR);
    }

    if (result === "ERROR" || result?.type !== "HASH" || !result.hash) {
      throw new Error("토스 연결에 실패했어요");
    }

    return {
      userKey: result.hash,
      scope: "",
      agreedTerms: [],
    };
  },
};
