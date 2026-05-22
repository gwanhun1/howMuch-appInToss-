import { getDeviceId } from "@apps-in-toss/web-framework";

interface QaPersonaInjection {
  tossId?: string;
  userKey?: string;
}

function readQaPersona(): QaPersonaInjection | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { __QA_PERSONA__?: QaPersonaInjection };
  return w.__QA_PERSONA__ ?? null;
}

/**
 * 토스 앱 내에서 사용자를 식별하기 위한 고유 ID를 가져옵니다.
 * AIT 환경에 따라 getDeviceId를 활용할 수 있습니다.
 *
 * ⚠️ 중요: 반환값은 반드시 `device-` 또는 `anon-` 접두어를 포함합니다.
 * 실제 토스 로그인 시 저장되는 userKey(순수 숫자 문자열)와 구분하기 위함입니다.
 * 이 규칙은 `useRecordStore.initializeStore`에서 연결 상태를 판별할 때 사용됩니다.
 */
export const getTossUserIdentifier = async (): Promise<string> => {
  const qa = readQaPersona();
  if (qa?.tossId) return qa.tossId;

  try {
    // 1. 기기 고유 ID 시도 (prefix로 익명 식별자임을 명시)
    const deviceId = getDeviceId();
    if (deviceId) return `device-${deviceId}`;

    // 2. 만약 deviceId를 얻을 수 없는 경우 익명 ID 생성 (이미 "anon-" prefix 포함)
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

// Safari private 모드처럼 localStorage가 실패해도 세션 내 동일 ID를 유지하기 위한 메모리 캐시
let memoryAnonymousId: string | null = null;

const getLocalAnonymousId = () => {
  if (memoryAnonymousId) return memoryAnonymousId;
  try {
    const stored = localStorage.getItem("howmuch-anonymous-id");
    if (stored) {
      memoryAnonymousId = stored;
      return stored;
    }
  } catch {
    // localStorage 접근 실패 (private 모드 등) — 메모리 캐시로 진행
  }
  const generated = generateAnonymousId();
  memoryAnonymousId = generated;
  try {
    localStorage.setItem("howmuch-anonymous-id", generated);
  } catch {
    // 저장 실패해도 memoryAnonymousId로 세션 내 동일 ID 유지
  }
  return generated;
};
