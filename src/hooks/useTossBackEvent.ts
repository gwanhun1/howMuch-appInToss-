import { useEffect } from "react";
import { graniteEvent } from "@apps-in-toss/web-framework";

/** 화면을 떠나면 구독을 해제해 메인 화면의 기본 종료 동작을 유지합니다. */
export function useTossBackEvent(onBack: () => void, enabled = true) {
  useEffect(() => {
    // 일반 브라우저에서는 네이티브 구독이 동기 예외를 던집니다.
    if (!enabled || !("ReactNativeWebView" in window)) return;
    try {
      return graniteEvent.addEventListener("backEvent", {
        onEvent: onBack,
        onError: (error) => console.error("뒤로가기 연결 실패:", error),
      });
    } catch (error) {
      // 브리지가 준비되지 않아도 화면의 입력 취소 버튼은 사용할 수 있습니다.
      console.error("뒤로가기 연결 실패:", error);
    }
  }, [onBack, enabled]);
}
