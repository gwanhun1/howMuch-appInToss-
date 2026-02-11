import { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "@toss/tds-mobile";
import { useFriendStore } from "../../stores/useFriendStore";
import { ALL_AMOUNTS, CARD_COUNT, INITIAL_POSITIONS, MESSAGES } from "./constants";
import { shuffleAndPick, copyToClipboard } from "./utils";
import { KEYFRAMES } from "./keyframes";
import { PickerFAB } from "./PickerFAB";
import { PickerModal } from "./PickerModal";

type Phase = "idle" | "shuffling" | "ready" | "revealed";

export function RandomAmountPicker() {
  const { openToast } = useToast();
  const currentPage = useFriendStore((s) => s.currentPage);
  const isFriendFormOpen = useFriendStore((s) => s.isFriendFormOpen);
  const isOnMain = currentPage === "main" && !isFriendFormOpen;

  const [isOpen, setIsOpen] = useState(false);
  const [cards, setCards] = useState<number[]>([]);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [shufflePositions, setShufflePositions] = useState(INITIAL_POSITIONS);
  const [countUpValue, setCountUpValue] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const [bubblePhase, setBubblePhase] = useState<"in" | "out" | null>(null);

  const shuffleTimer = useRef<ReturnType<typeof setTimeout>>();
  const countUpRef = useRef<ReturnType<typeof setInterval>>();
  const openToastRef = useRef(openToast);
  openToastRef.current = openToast;

  const selectedAmount = flippedIndex !== null ? cards[flippedIndex] : null;
  const message = selectedAmount ? MESSAGES[String(selectedAmount)] || "" : "";
  const isJackpot = selectedAmount !== null && selectedAmount === Math.max(...cards);

  const startCountUp = useCallback((target: number) => {
    if (countUpRef.current) clearInterval(countUpRef.current);
    setCountUpValue(0);
    const steps = 16;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    countUpRef.current = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setCountUpValue(target);
        if (countUpRef.current) clearInterval(countUpRef.current);
        const text = target.toLocaleString();
        openToastRef.current(`📋 ${text}원이 복사되었어요`);
        copyToClipboard(text);
      } else {
        setCountUpValue(Math.round(current / 10000) * 10000);
      }
    }, 35);
  }, []);

  const runShuffle = useCallback(() => {
    setPhase("shuffling");
    setFlippedIndex(null);
    setShowParticles(false);
    setCountUpValue(0);
    setCards(shuffleAndPick(ALL_AMOUNTS, CARD_COUNT));
    let count = 0;
    const maxShuffles = 8;
    const doShuffle = () => {
      setShufflePositions([...INITIAL_POSITIONS].sort(() => Math.random() - 0.5));
      count++;
      if (count < maxShuffles) {
        shuffleTimer.current = setTimeout(doShuffle, 120 + count * 15);
      } else {
        setShufflePositions(INITIAL_POSITIONS);
        setTimeout(() => setPhase("ready"), 250);
      }
    };
    doShuffle();
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setPhase("idle");
    setFlippedIndex(null);
    setCards(shuffleAndPick(ALL_AMOUNTS, CARD_COUNT));
    setShufflePositions(INITIAL_POSITIONS);
    setTimeout(() => runShuffle(), 350);
  };

  const handlePickCard = (index: number) => {
    if (phase !== "ready" || flippedIndex !== null) return;
    setFlippedIndex(index);
    setPhase("revealed");
    setTimeout(() => {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 2000);
    }, 250);
    setTimeout(() => startCountUp(cards[index]), 400);
  };

  // cleanup
  useEffect(() => {
    return () => {
      if (shuffleTimer.current) clearTimeout(shuffleTimer.current);
      if (countUpRef.current) clearInterval(countUpRef.current);
    };
  }, []);

  // body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  // 말풍선 주기
  useEffect(() => {
    if (!isOnMain || isOpen) {
      setBubblePhase(null);
      return;
    }
    let showT: ReturnType<typeof setTimeout>;
    let hideT: ReturnType<typeof setTimeout>;
    let removeT: ReturnType<typeof setTimeout>;
    const cycle = () => {
      showT = setTimeout(() => setBubblePhase("in"), 1500);
      hideT = setTimeout(() => setBubblePhase("out"), 5500);
      removeT = setTimeout(() => setBubblePhase(null), 6000);
    };
    cycle();
    const intervalId = setInterval(cycle, 10000);
    return () => {
      clearTimeout(showT);
      clearTimeout(hideT);
      clearTimeout(removeT);
      clearInterval(intervalId);
      setBubblePhase(null);
    };
  }, [isOnMain, isOpen]);

  return (
    <>
      {isOnMain && <PickerFAB onOpen={handleOpen} bubblePhase={bubblePhase} />}

      {isOpen && (
        <PickerModal
          cards={cards}
          flippedIndex={flippedIndex}
          phase={phase}
          shufflePositions={shufflePositions}
          countUpValue={countUpValue}
          showParticles={showParticles}
          message={message}
          isJackpot={isJackpot}
          onPickCard={handlePickCard}
          onClose={() => setIsOpen(false)}
          onReshuffle={runShuffle}
        />
      )}

      <style>{KEYFRAMES}</style>
    </>
  );
}
