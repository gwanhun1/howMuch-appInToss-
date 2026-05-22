/**
 * AIT-Mock — Playwright initScript로 페이지 로드 전 주입되는 모킹 레이어.
 *
 * QA 워커가 Playwright `addInitScript()`를 통해 이 파일의 내용을
 * 실 브라우저 컨텍스트에 주입한다. 토스 앱 WebView 밖에서도
 * 이 미니앱이 정상 동작하도록 토스 SDK 표면을 흉내낸다.
 *
 * 이 파일은 타겟 레포에 빌드 산출물로 들어가지 않는다(아무도 import 안 함).
 * QA 하네스가 fs.readFileSync로 읽어 initScript에 넣는 형식.
 *
 * 주입 시점에 window.__QA_PERSONA__ 가 이미 설정되어 있어야 함.
 *   { id, tossId, userKey, ... }
 *
 * ⚠️ 동기화 규칙:
 *   - src/utils/toss.ts, src/apis/tossAuthService.ts 의 readQaPersona()와
 *     같은 키(__QA_PERSONA__)를 사용해야 한다.
 *   - window.toss AdMob 시그니처는 src/stores/useRecordStore.ts 의
 *     `declare global { interface Window { toss?: ... } }` 와 일치해야 한다.
 */

declare global {
  interface Window {
    __QA_PERSONA__?: {
      id: string;
      tossId: string;
      userKey?: string;
    };
    __QA_TRACE__?: Array<{
      ts: number;
      kind: string;
      payload?: unknown;
    }>;
  }
}

(function installAitMock() {
  // 트레이스 버퍼 — 워커가 page.evaluate(() => window.__QA_TRACE__)로 회수
  if (!window.__QA_TRACE__) window.__QA_TRACE__ = [];
  const trace = window.__QA_TRACE__;

  function record(kind: string, payload?: unknown) {
    trace.push({ ts: Date.now(), kind, payload });
  }

  // 콘솔 에러를 트레이스로 흘려보냄 (워커가 회수하기 쉽게)
  const origError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    record("console.error", args.map((a) => String(a)));
    origError(...args);
  };

  window.addEventListener("error", (e) => {
    record("window.error", { message: e.message, filename: e.filename });
  });

  window.addEventListener("unhandledrejection", (e) => {
    record("unhandledrejection", { reason: String(e.reason) });
  });

  record("aitMock.installed", { persona: window.__QA_PERSONA__?.id });
})();

export {};
