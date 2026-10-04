// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { trackGrowthToolOpened, trackRecordSaved } from "./index";

const log = vi.hoisted(() => vi.fn());
vi.mock("@apps-in-toss/web-framework", () => ({ Analytics: { log } }));
afterEach(() => { vi.unstubAllGlobals(); log.mockReset(); });

it("일반 브라우저에서는 분석 이벤트를 전송하지 않는다", async () => {
  await trackRecordSaved("single");
  expect(log).not.toHaveBeenCalled();
});

it("토스 SDK에는 고정된 행동 값만 전달하고 기록 내용은 받지 않는다", async () => {
  vi.stubGlobal("ReactNativeWebView", {});
  await trackRecordSaved("wedding_ledger");
  await trackGrowthToolOpened("amount_guide");
  expect(log.mock.calls).toEqual([
    [{ log_name: "howmuch_record_saved", log_type: "event", params: { method: "wedding_ledger" } }],
    [{ log_name: "howmuch_tool_opened", log_type: "event", params: { tool: "amount_guide" } }],
  ]);
});

it("분석 실패가 호출자에게 저장 실패로 전파되지 않는다", async () => {
  vi.stubGlobal("ReactNativeWebView", {});
  log.mockRejectedValueOnce(new Error("분석 연결 실패"));
  await expect(trackRecordSaved("single")).resolves.toBeUndefined();
});
