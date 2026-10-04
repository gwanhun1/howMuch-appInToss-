// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useViewScroll } from "./useViewScroll";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("새 화면은 처음부터 열고 돌아오면 이전 스크롤 위치를 복원한다", () => {
  const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const scrollY = vi.spyOn(window, "scrollY", "get");
  const { rerender } = renderHook(({ view }) => useViewScroll(view), {
    initialProps: { view: "main" },
  });
  scrollY.mockReturnValue(600);
  window.dispatchEvent(new Event("scroll"));
  rerender({ view: "guide" });
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "instant" });
  scrollY.mockReturnValue(240);
  window.dispatchEvent(new Event("scroll"));
  rerender({ view: "main" });
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 600, behavior: "instant" });
  rerender({ view: "guide" });
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 240, behavior: "instant" });
});

it("같은 화면의 재렌더링은 사용자의 스크롤을 초기화하지 않는다", () => {
  const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const { rerender } = renderHook(({ view }) => useViewScroll(view), {
    initialProps: { view: "main" },
  });
  scrollTo.mockClear();
  rerender({ view: "main" });
  expect(scrollTo).not.toHaveBeenCalled();
});
