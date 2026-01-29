import { getDeviceId } from "@apps-in-toss/web-framework";

/**
 * 토스 앱 내에서 사용자를 식별하기 위한 고유 ID를 가져옵니다.
 * AIT 환경에 따라 getDeviceId를 활용할 수 있습니다.
 */
export const getTossUserIdentifier = async (): Promise<string> => {
  try {
    // 1. 기기 고유 ID 시도
    const deviceId = getDeviceId();
    if (deviceId) return deviceId;

    // 2. 만약 deviceId를 얻을 수 없는 경우 익명 ID 생성 (Fallback)
    return getLocalAnonymousId();
  } catch (error) {
    console.error("TossBridge를 통해 식별자를 가져오는데 실패했습니다:", error);
    return getLocalAnonymousId();
  }
};

const getLocalAnonymousId = () => {
  let localId = localStorage.getItem("howmuch-anonymous-id");
  if (!localId) {
    localId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("howmuch-anonymous-id", localId);
  }
  return localId;
};
