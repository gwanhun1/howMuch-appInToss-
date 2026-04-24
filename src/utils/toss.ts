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

const generateAnonymousId = (): string => {
  // Web Crypto의 randomUUID는 RFC 4122 v4. 대부분의 최신 브라우저/WebView에서 지원됨.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `anon-${crypto.randomUUID()}`;
  }
  // Fallback: getRandomValues로 128비트 난수 생성
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `anon-${hex}`;
  }
  // 최후 fallback: 시간 + 여러 번의 Math.random (충돌 위험 있지만 지원 불가 환경 한정)
  const rnd = Array.from({ length: 4 }, () =>
    Math.random().toString(36).slice(2, 10),
  ).join("");
  return `anon-${Date.now().toString(36)}-${rnd}`;
};

const getLocalAnonymousId = () => {
  let localId = localStorage.getItem("howmuch-anonymous-id");
  if (!localId) {
    localId = generateAnonymousId();
    localStorage.setItem("howmuch-anonymous-id", localId);
  }
  return localId;
};
