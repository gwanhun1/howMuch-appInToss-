// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { graniteEvent } from "@apps-in-toss/web-framework";
import { useTossBackEvent } from "./useTossBackEvent";

vi.mock("@apps-in-toss/web-framework", () => ({
  graniteEvent: { addEventListener: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.mocked(graniteEvent.addEventListener).mockReset();
});

it("일반 브라우저에서는 네이티브 구독을 요청하지 않는다", () => {
  renderHook(() => useTossBackEvent(vi.fn()));
  expect(graniteEvent.addEventListener).not.toHaveBeenCalled();
});

it("토스 뒤로가기를 처리하고 화면 종료 시 기본 뒤로가기를 복원한다", () => {
  vi.stubGlobal("ReactNativeWebView", { postMessage: vi.fn() });
  const unsubscribe = vi.fn();
  vi.mocked(graniteEvent.addEventListener).mockReturnValue(unsubscribe);
  const onBack = vi.fn();
  const { unmount } = renderHook(() => useTossBackEvent(onBack));
  const [event, handlers] = vi.mocked(graniteEvent.addEventListener).mock.calls[0];
  expect(event).toBe("backEvent");
  handlers.onEvent();
  expect(onBack).toHaveBeenCalledOnce();
  unmount();
  expect(unsubscribe).toHaveBeenCalledOnce();
});

it("브리지 연결 실패가 금액 입력 화면을 중단시키지 않는다", () => {
  vi.stubGlobal("ReactNativeWebView", { postMessage: vi.fn() });
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(graniteEvent.addEventListener).mockImplementation(() => {
    throw new Error("bridge unavailable");
  });
  expect(() => renderHook(() => useTossBackEvent(vi.fn()))).not.toThrow();
});
