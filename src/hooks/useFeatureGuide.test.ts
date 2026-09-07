// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFeatureGuide } from "./useFeatureGuide";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
});

describe("사용자가 요청한 경우에만 시작하는 사용법 안내", () => {
  it.each([null, "true"])("첫 진입/재진입에서 자동 시작하지 않는다 (%s)", (saved) => {
    vi.useFakeTimers();
    if (saved) localStorage.setItem("howmuch_feature_guide_done", saved);
    const { result } = renderHook(() => useFeatureGuide());
    expect(result.current.currentStep).toBeNull();
    expect(result.current.isPreparingGuide).toBe(false);
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.currentStep).toBeNull();
  });

  it("저장소를 쓸 수 없어도 자동 안내 없이 진입한다", () => {
    const read = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    try {
      const { result } = renderHook(() => useFeatureGuide());
      expect(result.current.currentStep).toBeNull();
      expect(result.current.isPreparingGuide).toBe(false);
    } finally {
      read.mockRestore();
    }
  });

  it("명시적으로 시작하고 완료/건너뛰기 후 다시 시작할 수 있다", () => {
    const { result } = renderHook(() => useFeatureGuide());
    act(() => result.current.start());
    expect(result.current.currentStep).toBe("add-button");
    act(() => result.current.next());
    expect(result.current.currentStep).toBe("mode-toggle");
    act(() => result.current.next());
    expect(result.current.currentStep).toBeNull();
    act(() => result.current.start());
    act(() => result.current.skip());
    expect(result.current.currentStep).toBeNull();
  });

  it("안내 도중 앱을 다시 열어도 안내를 복원하지 않는다", () => {
    const first = renderHook(() => useFeatureGuide());
    act(() => first.result.current.start());
    first.unmount();
    const reopened = renderHook(() => useFeatureGuide());
    expect(reopened.result.current.currentStep).toBeNull();
  });
});
