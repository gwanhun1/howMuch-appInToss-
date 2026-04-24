import { useCallback, useEffect, useMemo } from "react";
import { Spacing, useToast } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { useRecordStore } from "../stores/useRecordStore";
import { RecordFormBottomSheet } from "../components/form/RecordFormBottomSheet";
import { AmountInputPage } from "./AmountInputPage";
import { RecordList } from "../components/record-card/RecordList";
import { CoinRain } from "../components/common/CoinRain";
import { GlobalErrorView } from "../components/common/GlobalErrorView";
import { MainSummaryCard } from "../components/main/MainSummaryCard";
import { RECORD_CATEGORIES } from "../constants/category";
import { ServiceFooter } from "../components/common/ServiceFooter";
import { RandomAmountPicker } from "../components/random-picker/RandomAmountPicker";
import { useSwipeMode } from "../hooks/useSwipeMode";
import { useFeatureGuide } from "../hooks/useFeatureGuide";

export function MainPage() {
  const { openToast } = useToast();

  const {
    records,
    selectedRecordId,
    editingRecord,
    setEditingRecord,
    currentPage,
    currentMode,
    setCurrentMode,
    isRecordFormOpen,
    openRecordForm,
    closeRecordForm,
    openAmountInput,
    closeAmountInput,
    resetToMain,
    startAddingRecord,
    lastAdMilestoneShown,
    initializeStore,
    filterType,
    setFilterType,
    isCelebrating,
    setCelebrating,
    isLoading,
    error,
    totalPaid,
    totalReceived,
    fetchMoreRecords,
    hasMore,
    isLoadingMore,
    updateRecord,
    loadAd,
  } = useRecordStore();

  useEffect(() => {
    initializeStore();
    loadAd();
    if (currentPage !== "main") resetToMain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentTotal = currentMode === "paid" ? totalPaid : totalReceived;

  const filteredRecords = useMemo(
    () =>
      records
        .filter((r) => r.mode === currentMode)
        .filter((r) => {
          if (filterType === RECORD_CATEGORIES.ALL) return true;
          return r.type === filterType;
        })
        .sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          const dateCompare = (b.date ?? "").localeCompare(a.date ?? "");
          if (dateCompare !== 0) return dateCompare;
          return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
        }),
    [records, currentMode, filterType],
  );

  const modeRecordsCount = useMemo(
    () => records.filter((r) => r.mode === currentMode).length,
    [records, currentMode],
  );
  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedRecordId) || null,
    [records, selectedRecordId],
  );

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      const record = records.find((r) => r.id === id);
      if (!record) return;
      const willBeFavorite = !record.isFavorite;
      try {
        await updateRecord(id, { isFavorite: willBeFavorite });
        openToast(
          willBeFavorite
            ? "⭐ 중요 표시되었습니다"
            : "중요 표시가 해제되었습니다",
        );
      } catch (error) {
        console.error("즐겨찾기 토글 실패:", error);
        openToast(
          error instanceof Error
            ? error.message
            : "중요 표시 변경에 실패했습니다.",
        );
      }
    },
    [records, updateRecord, openToast],
  );

  const { dragX, handleTouchStart, handleTouchMove, handleTouchEnd } =
    useSwipeMode({
      currentMode,
      onModeChange: setCurrentMode,
    });

  const guide = useFeatureGuide(closeRecordForm);

  const isGuiding =
    guide.currentStep !== null ||
    guide.isWaitingForForm ||
    guide.isPreparingGuide;
  const guardedTouchStart = isGuiding ? undefined : handleTouchStart;
  const guardedTouchMove = isGuiding ? undefined : handleTouchMove;
  const guardedTouchEnd = isGuiding ? undefined : handleTouchEnd;

  useEffect(() => {
    if (guide.isWaitingForForm && !isRecordFormOpen) {
      startAddingRecord();
    }
  }, [guide.isWaitingForForm, isRecordFormOpen, startAddingRecord]);

  useEffect(() => {
    if (guide.isWaitingForForm && isRecordFormOpen) {
      guide.startFormGuide();
    }
  }, [guide, isRecordFormOpen]);

  if (error) {
    return (
      <GlobalErrorView description={error} onRetry={() => initializeStore()} />
    );
  }

  return (
    <div
      style={{
        backgroundColor: adaptive.grey50,
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {isCelebrating && (
        <CoinRain
          onComplete={() => setCelebrating(false)}
          headline={records.length === 1 ? "첫 기록이 쌓였어요" : undefined}
          subhead={
            records.length === 1 ? "앞으로의 마음도 기록해볼까요?" : undefined
          }
        />
      )}
      {currentPage === "amountInput" && editingRecord ? (
        <AmountInputPage
          value={editingRecord.amount}
          onBack={closeAmountInput}
          onSave={(val) => {
            setEditingRecord({ ...editingRecord, amount: val });
            closeAmountInput();
          }}
        />
      ) : (
        <>
          <div
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            onTouchStart={guardedTouchStart}
            onTouchMove={guardedTouchMove}
            onTouchEnd={guardedTouchEnd}
          >
            <Spacing size={12} />

            <div>
              <MainSummaryCard
                totalAmount={currentTotal}
                isLoading={isLoading}
                recordsCount={modeRecordsCount}
                filterType={filterType}
                onFilterChange={setFilterType}
                guide={guide}
              />

              <Spacing size={16} />

              <div
                style={{
                  transform: `translateX(${dragX}px)`,
                  transition: dragX === 0 ? "transform 0.25s ease-out" : "none",
                  opacity: 1 - Math.abs(dragX) * 0.002,
                }}
              >
                <div style={{ minHeight: "65vh" }}>
                  <RecordList
                    records={filteredRecords}
                    totalCount={records.length}
                    isLoading={isLoading}
                    isLoadingMore={isLoadingMore}
                    hasMore={hasMore}
                    onLoadMore={fetchMoreRecords}
                    lastAdMilestoneShown={lastAdMilestoneShown}
                    onAddRecord={startAddingRecord}
                    onRecordClick={openRecordForm}
                    filterType={filterType}
                    guide={guide}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>

                <div
                  style={{
                    textAlign: "center",
                    fontSize: "0.95rem",
                    color: adaptive.grey400,
                    letterSpacing: "-0.2px",
                    padding: "12px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span className="swipe-arrow-left">←</span>
                    <span>스와이프하여 보낸/받은 마음을 확인해보세요</span>
                    <span className="swipe-arrow-right">→</span>
                  </div>
                </div>
              </div>
            </div>

            <Spacing size={32} />
            <ServiceFooter />
          </div>
        </>
      )}

      <RecordFormBottomSheet
        open={isRecordFormOpen}
        record={selectedRecord}
        onClose={closeRecordForm}
        onOpenAmountInput={openAmountInput}
        onHome={resetToMain}
        guide={guide}
      />

      <RandomAmountPicker />

      {(guide.currentStep !== null ||
        guide.isWaitingForForm ||
        guide.isPreparingGuide) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            pointerEvents: "auto",
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}
    </div>
  );
}
