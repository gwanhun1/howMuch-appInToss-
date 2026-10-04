import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Button, Spacing, useToast } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { useRecordStore } from "../stores/useRecordStore";
import { RecordFormBottomSheet } from "../components/form/RecordFormBottomSheet";
import { RecordList } from "../components/record-card/RecordList";
import { ConnectionNotice } from "../components/common/ConnectionNotice";
import { MainSummaryCard } from "../components/main/MainSummaryCard";
import { RECORD_CATEGORIES } from "../constants/category";
import { ServiceFooter } from "../components/common/ServiceFooter";
import { useSwipeMode } from "../hooks/useSwipeMode";
import { useFeatureGuide } from "../hooks/useFeatureGuide";
import { PeopleSearch } from "@/components/people/PeopleSearch";
import { usePeopleSearch } from "@/hooks/usePeopleSearch";
import { useTossBackEvent } from "@/hooks/useTossBackEvent";

const AmountInputPage = lazy(() =>
  import("./AmountInputPage").then((module) => ({ default: module.AmountInputPage })),
);
const AmountGuidePage = lazy(() =>
  import("./AmountGuidePage").then((module) => ({ default: module.AmountGuidePage })),
);

export function MainPage() {
  const [showAmountGuide, setShowAmountGuide] = useState(false);
  const { openToast } = useToast();

  const {
    records,
    selectedRecordId,
    editingRecord,
    setEditingRecord,
    currentPage,
    currentMode,
    setCurrentMode,
    viewMode,
    setViewMode,
    isRecordFormOpen,
    openRecordForm,
    closeRecordForm,
    openAmountInput,
    closeAmountInput,
    resetToMain,
    startAddingRecord,
    initializeStore,
    filterType,
    setFilterType,
    isLoading,
    isLoadingSlow,
    error,
    totalPaid,
    totalReceived,
    fetchMoreRecords,
    hasMore,
    isLoadingMore,
    updateRecord,
    startGuidedRecord,
  } = useRecordStore();

  useEffect(() => {
    resetToMain();
    // 첫 프레임을 먼저 그린 뒤 Firebase/브리지 초기화를 시작합니다.
    // 네트워크가 느려도 메인 스킴 진입 화면 자체는 즉시 보여야 합니다.
    const frameId = window.requestAnimationFrame(() => {
      void initializeStore();
    });
    return () => window.cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = usePeopleSearch(records);
  useTossBackEvent(closeRecordForm, isRecordFormOpen && !showAmountGuide && currentPage === "main");

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
      if (isLoading || error) {
        openToast("기록을 불러온 뒤에 변경할 수 있어요.");
        return;
      }
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
    [records, updateRecord, openToast, isLoading, error],
  );

  const { dragX, handleTouchStart, handleTouchMove, handleTouchEnd } =
    useSwipeMode({
      currentMode,
      onModeChange: setCurrentMode,
    });

  const guide = useFeatureGuide();

  const isGuiding =
    guide.currentStep !== null ||
    guide.isPreparingGuide;
  const guardedTouchStart = isGuiding ? undefined : handleTouchStart;
  const guardedTouchMove = isGuiding ? undefined : handleTouchMove;
  const guardedTouchEnd = isGuiding ? undefined : handleTouchEnd;

  if (showAmountGuide) return (
    <Suspense fallback={<div style={{ padding: 24 }} role="status">금액 가이드를 불러오고 있어요.</div>}>
      <AmountGuidePage onBack={() => setShowAmountGuide(false)} onRecord={(draft) => {
        if (isLoading || error || !useRecordStore.getState().userIdentifier) {
          openToast("기록 연결 후 저장할 수 있어요.");
          return;
        }
        search.setQuery("");
        startGuidedRecord(draft);
        setShowAmountGuide(false);
      }} />
    </Suspense>
  );

  return (
    <div
      style={{
        backgroundColor: adaptive.grey50,
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {currentPage === "amountInput" && editingRecord ? (
        <Suspense fallback={null}>
          <AmountInputPage
            value={editingRecord.amount}
            onBack={closeAmountInput}
            onSave={(val) => {
              setEditingRecord({ ...editingRecord, amount: val });
              closeAmountInput();
            }}
          />
        </Suspense>
      ) : (
        <>
          <div
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            onTouchStart={guardedTouchStart}
            onTouchMove={guardedTouchMove}
            onTouchEnd={guardedTouchEnd}
          >
            <Spacing size={12} />
            <div style={{ padding: "0 20px 16px" }} onTouchStart={(e) => e.stopPropagation()}>
              <Button display="block" onClick={() => setShowAmountGuide(true)}>얼마 낼까? 상황별 금액 가이드</Button>
            </div>

            <div>
              <MainSummaryCard
                totalAmount={currentTotal}
                isLoading={isLoading}
                recordsCount={modeRecordsCount}
                filterType={filterType}
                onFilterChange={setFilterType}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                guide={guide}
              />

              <Spacing size={16} />

              {(error || isLoadingSlow) && (
                <ConnectionNotice error={error} onRetry={() => void initializeStore()} />
              )}

              <div
                style={{
                  transform: `translateX(${dragX}px)`,
                  transition: dragX === 0 ? "transform 0.25s ease-out" : "none",
                  opacity: 1 - Math.abs(dragX) * 0.002,
                }}
              >
                <div style={{ minHeight: "65vh" }}>
                  <PeopleSearch search={search} isLoading={isLoading} error={error}
                    onRecordClick={(id) => {
                      if (isLoading || error) return;
                      const record = records.find((r) => r.id === id);
                      if (record) setCurrentMode(record.mode);
                      openRecordForm(id);
                    }} />
                  {!search.isSearching && (!error || records.length > 0) && <RecordList
                    records={filteredRecords}
                    totalCount={records.length}
                    isLoading={isLoading}
                    isLoadingMore={isLoadingMore}
                    hasMore={hasMore}
                    onLoadMore={fetchMoreRecords}
                    onAddRecord={(type) => {
                      if (isLoading || error) {
                        openToast("기록을 불러온 뒤에 추가할 수 있어요.");
                        return;
                      }
                      startAddingRecord(type);
                    }}
                    onRecordClick={(id) => {
                      if (isLoading || error) {
                        openToast("기록을 불러온 뒤에 수정할 수 있어요.");
                        return;
                      }
                      openRecordForm(id);
                    }}
                    filterType={filterType}
                    viewMode={viewMode}
                    guide={guide}
                    onToggleFavorite={handleToggleFavorite}
                  />}
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
                    <span>←</span>
                    <span>스와이프하여 보낸/받은 마음을 확인해보세요</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>

            <Spacing size={32} />
            <ServiceFooter onShowGuide={() => {
              window.scrollTo({ top: 0, behavior: "instant" });
              guide.start();
            }} />
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

      {(guide.currentStep !== null ||
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
