import { useRef, useCallback, useState } from "react";
import type { RecordMode } from "../types/record";

interface UseSwipeModeOptions {
  currentMode: RecordMode;
  onModeChange: (mode: RecordMode) => void;
}

export function useSwipeMode({ currentMode, onModeChange }: UseSwipeModeOptions) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const isDragging = useRef(false);
  const [dragX, setDragX] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swiped.current = false;
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || swiped.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;

    if (!isDragging.current && Math.abs(dx) > 10) {
      if (Math.abs(dx) > Math.abs(dy)) {
        isDragging.current = true;
      } else {
        swiped.current = true;
        return;
      }
    }

    if (isDragging.current) {
      const atEdge = (dx > 0 && currentMode === "paid") || (dx < 0 && currentMode === "received");
      setDragX(atEdge ? dx * 0.15 : dx * 0.4);
    }
  }, [currentMode]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;

    if (isDragging.current && Math.abs(dx) > 50) {
      if (dx < 0 && currentMode === "paid") {
        onModeChange("received");
      } else if (dx > 0 && currentMode === "received") {
        onModeChange("paid");
      }
    }

    setDragX(0);
    touchStart.current = null;
    isDragging.current = false;
    swiped.current = false;
  }, [currentMode, onModeChange]);

  return { dragX, handleTouchStart, handleTouchMove, handleTouchEnd };
}
