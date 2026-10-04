// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useElementHeight } from "./useElementHeight";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("고정 버튼이 줄바꿈으로 높아지면 예약 공간도 갱신하고 관찰을 해제한다", () => {
  let onResize: ResizeObserverCallback = () => {};
  const disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { onResize = callback; }
    observe() {}
    disconnect = disconnect;
  });
  const bounds = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue({ height: 81 } as DOMRect);
  function Fixture() {
    const { ref, height } = useElementHeight<HTMLDivElement>();
    return createElement("div", { ref, "data-testid": "height" }, height);
  }
  const { getByTestId, unmount } = render(createElement(Fixture));
  expect(getByTestId("height").textContent).toBe("81");
  bounds.mockReturnValue({ height: 106.5 } as DOMRect);
  act(() => onResize([], {} as ResizeObserver));
  expect(getByTestId("height").textContent).toBe("107");
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
