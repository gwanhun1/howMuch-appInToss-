import { getAnonymousKey } from "@apps-in-toss/web-framework";

export interface TossUserMeResponse {
  userKey: string;
  scope: string;
  agreedTerms: string[];
}

/** 토스 앱 WebView 밖(브라우저 등)에서는 토스 연결이 동작하지 않음을 나타내는 마커 */
export const TOSS_APP_ONLY_ERROR = "TOSS_APP_ONLY";

interface QaPersonaInjection {
  tossId?: string;
  userKey?: string;
}

function readQaPersona(): QaPersonaInjection | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { __QA_PERSONA__?: QaPersonaInjection };
  return w.__QA_PERSONA__ ?? null;
}

export const tossAuthService = {
  async executeFullLogin(): Promise<TossUserMeResponse> {
    const qa = readQaPersona();
    if (qa?.userKey) {
      return {
        userKey: qa.userKey,
        scope: "",
        agreedTerms: [],
      };
    }

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
