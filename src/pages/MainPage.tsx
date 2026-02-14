import { useEffect } from "react";
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
import { FeatureHighlight } from "../components/onboarding/FeatureHighlight";

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

  const filteredRecords = records
    .filter((r) => r.mode === currentMode)
    .filter((r) => {
      if (filterType === RECORD_CATEGORIES.ALL) return true;
      return r.type === filterType;
    })
    .sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return (b.date ?? "").localeCompare(a.date ?? "");
    });

  const modeRecordsCount = records.filter((r) => r.mode === currentMode).length;
  const selectedRecord = records.find((r) => r.id === selectedRecordId) || null;

  const { dragX, handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeMode({
    currentMode,
    onModeChange: setCurrentMode,
  });

  const guide = useFeatureGuide(isLoading, closeRecordForm);

  // 메인 가이드 끝나면 자동으로 바텀시트 열어서 폼 가이드 시작
  useEffect(() => {
    if (guide.isWaitingForForm && !isRecordFormOpen) {
      startAddingRecord();
    }
  }, [guide.isWaitingForForm, isRecordFormOpen, startAddingRecord]);

  // 바텀시트가 열리면 폼 가이드 시작
  useEffect(() => {
    if (guide.isWaitingForForm && isRecordFormOpen) {
      guide.startFormGuide();
    }
  }, [guide, isRecordFormOpen]);

  if (error) {
    return <GlobalErrorView description={error} onRetry={() => initializeStore()} />;
  }

  return (
    <div style={{
      backgroundColor: adaptive.grey50, minHeight: "100vh", position: "relative",
      overflowX: "hidden",
    }}>
      {isCelebrating && <CoinRain onComplete={() => setCelebrating(false)} />}
      {currentPage === "amountInput" && editingRecord ? (
        <AmountInputPage
          value={editingRecord.amount}
          onBack={closeAmountInput}
          onSave={(val) => { setEditingRecord({ ...editingRecord, amount: val }); closeAmountInput(); }}
        />
      ) : (
        <>
          <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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

              <div style={{
                transform: `translateX(${dragX}px)`,
                transition: dragX === 0 ? "transform 0.25s ease-out" : "none",
                opacity: 1 - Math.abs(dragX) * 0.002,
              }}>
                <div style={{ minHeight: "70vh" }}>
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
                  onToggleFavorite={async (id) => {
                    const record = records.find((r) => r.id === id);
                    if (record) {
                      const willBeFavorite = !record.isFavorite;
                      try {
                        await updateRecord(id, { isFavorite: willBeFavorite });
                        openToast(willBeFavorite ? "⭐ 중요 표시되었습니다" : "중요 표시가 해제되었습니다");
                      } catch (error) {
                        console.error("즐겨찾기 토글 실패:", error);
                        openToast(error instanceof Error ? error.message : "중요 표시 변경에 실패했습니다.");
                      }
                    }
                  }}
                />
              </div>

              <div style={{
                textAlign: "center",
                fontSize: '1rem',
                color: adaptive.grey300,
                letterSpacing: "-0.2px",
              }}>
                <FeatureHighlight
                  step="swipe-hint"
                  currentStep={guide.currentStep}
                  onNext={guide.next}
                  onPrev={guide.prev}
                  onSkip={guide.skip}
                >
                  <span>← 스와이프하여 보낸/받은 마음을 확인해보세요 →</span>
                </FeatureHighlight>
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
    </div>
  );
}
