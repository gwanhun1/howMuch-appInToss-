import { getAnonymousKey, getDeviceId } from "@apps-in-toss/web-framework";
import { withRequestTimeout } from "./requestTimeout";

interface QaPersonaInjection {
  tossId?: string;
  userKey?: string;
}

const BRIDGE_TIMEOUT_MS = 8000;

function readQaPersona(): QaPersonaInjection | null {
  if (import.meta.env.VITE_QA_MODE !== "true" || typeof window === "undefined") return null;
  const w = window as unknown as { __QA_PERSONA__?: QaPersonaInjection };
  return w.__QA_PERSONA__ ?? null;
}

/**
 * 토스 앱 내에서 사용자를 식별하기 위한 고유 ID를 가져옵니다.
 * AIT 환경에 따라 getDeviceId를 활용할 수 있습니다.
 *
 * 토스 사용자는 `toss-`, 구버전 기기는 `device-`, 일반 브라우저는 `anon-`를 씁니다.
 * 토스 연결 실패를 다른 익명 사용자로 바꾸면 기존 기록이 사라진 것처럼 보이므로
 * 네이티브 환경의 실패는 재시도 가능한 오류로 전달합니다.
 */
export const getTossUserIdentifier = async (): Promise<string> => {
  const qa = readQaPersona();
  if (qa?.tossId) return qa.tossId;
  if (!("ReactNativeWebView" in window)) return getLocalAnonymousId();

  // 사용자 조작이나 동의 화면 없이 발급되는 미니앱 전용 식별키를 우선 사용합니다.
  const anonymousKey = await withRequestTimeout(getAnonymousKey(), "토스 사용자 확인", BRIDGE_TIMEOUT_MS);
  if (
    anonymousKey &&
    anonymousKey !== "ERROR" &&
    anonymousKey.type === "HASH" && anonymousKey.hash
  ) {
    return `toss-${anonymousKey.hash}`;
  }

  // 지원하지 않는 토스앱에서는 기기 고유 ID로 폴백합니다.
  if (anonymousKey === undefined) {
    const deviceId = getDeviceId();
    if (deviceId) return `device-${deviceId}`;
  }
  throw new Error("토스 사용자 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.");
};

/**
 * 토스 식별자를 Firestore 경로에 직접 노출하지 않도록 고정 길이 문서 ID로 변환합니다.
 * 원본 식별자는 충분히 긴 임의값이며, 변환된 경로는 사용자별 capability 역할을 합니다.
 */
export const getStableUserDocumentId = async (
  identifier: string,
): Promise<string> => {
  const bytes = new TextEncoder().encode(identifier);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `key_${hex}`;
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
