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
import { MainCategoryFilter } from "../components/main/MainCategoryFilter";
import { ModeTab } from "../components/main/ModeTab";
import { RECORD_CATEGORIES } from "../constants/category";
import { ServiceFooter } from "../components/common/ServiceFooter";
import { RandomAmountPicker } from "../components/random-picker/RandomAmountPicker";

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

  if (error) {
    return <GlobalErrorView description={error} onRetry={() => initializeStore()} />;
  }

  return (
    <div style={{
      backgroundColor: adaptive.grey50, display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden", position: "relative",
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
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: "env(safe-area-inset-bottom)" }}>
            <Spacing size={12} />

            <ModeTab currentMode={currentMode} onModeChange={setCurrentMode} />

            <Spacing size={16} />

            <MainSummaryCard
              totalAmount={currentTotal}
              isLoading={isLoading}
              recordsCount={modeRecordsCount}
            />

            <Spacing size={16} />

            <MainCategoryFilter filterType={filterType} onFilterChange={setFilterType} />

            <Spacing size={16} />

            <div style={{ minHeight: "70vh" }}>
              <RecordList
                records={filteredRecords}
                totalCount={modeRecordsCount}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                onLoadMore={fetchMoreRecords}
                lastAdMilestoneShown={lastAdMilestoneShown}
                onAddRecord={startAddingRecord}
                onRecordClick={openRecordForm}
                filterType={filterType}
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
      />

      <RandomAmountPicker />
    </div>
  );
}
