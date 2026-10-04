import { useLayoutEffect, useRef } from "react";

/** 화면마다 문서 스크롤을 기억하고, 돌아왔을 때 작업하던 위치를 복원해요. */
export function useViewScroll(view: string) {
  const positions = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    window.scrollTo({ top: positions.current.get(view) ?? 0, behavior: "instant" });
    const remember = () => positions.current.set(view, window.scrollY);
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, [view]);
}
