import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Asset } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

const SHOW_DURATION = 3000;
const HIDE_DURATION = 3000;

/**
 * 빈 리스트일 때 추가 카드(11시 방향)를 콕콕 가리키는 손가락
 * 3초 보이고 3초 숨기고 반복. initialDelay로 첫 노출 시점 제어.
 */
export function PointerHint({ initialDelay = 0 }: { initialDelay?: number }) {
  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(initialDelay === 0);

  useEffect(() => {
    if (initialDelay <= 0) return;
    const t = setTimeout(() => setStarted(true), initialDelay);
    return () => clearTimeout(t);
  }, [initialDelay]);

  useEffect(() => {
    if (!started) return;
    setVisible(true);
    let on = true;
    const run = (): ReturnType<typeof setTimeout> => {
      const delay = on ? SHOW_DURATION : HIDE_DURATION;
      return setTimeout(() => {
        on = !on;
        setVisible(on);
        timerId = run();
      }, delay);
    };
    let timerId = run();
    return () => clearTimeout(timerId);
  }, [started]);

  return (
    <div
      style={{
        gridColumn: "span 3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 160,
        paddingTop: 20,
      }}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{
                x: [0, -10, 2, -10, 2, 0],
                y: [0, -8, 1, -8, 1, 0],
                scaleX: [1, 0.92, 1.02, 0.92, 1.02, 1],
                scaleY: [1, 1.12, 0.97, 1.12, 0.97, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ transformOrigin: "center bottom" }}
            >
              <div style={{ transform: "rotate(330deg)" }}>
                <Asset.Icon
                  name="icon-finger-touch.svg"
                  frameShape={Asset.frameShape.CleanW32}
                  color={adaptive.blue200}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
