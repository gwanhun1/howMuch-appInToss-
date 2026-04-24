import { adService } from "../../apis/adService";
import { useEffect, useMemo, useRef } from "react";
import type { MoneyRecord, RecordType } from "../../types/record";
import { Loader } from "@toss/tds-mobile";
import { RecordCard } from "./RecordCard";
import { AddRecordCard } from "./AddRecordCard";
import { AdCard } from "../common/AdCard";
import { RecordCardSkeleton } from "./RecordCardSkeleton";
import { EmptyState } from "../onboarding/EmptyState";
import { FeatureHighlight } from "../onboarding/FeatureHighlight";
import { EXAMPLE_RECORDS } from "../onboarding/ExampleCards";
import type { GuideProps } from "../../hooks/useFeatureGuide";

interface RecordListProps {
  records: MoneyRecord[];
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  lastAdMilestoneShown: number;
  onAddRecord: (initialType?: RecordType | null) => void;
  onRecordClick: (recordId: string) => void;
  onToggleFavorite: (recordId: string) => void;
  filterType?: string;
  guide: GuideProps;
}

export function RecordList({
  records,
  totalCount,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  lastAdMilestoneShown,
  onAddRecord,
  onRecordClick,
  onToggleFavorite,
  filterType = "전체",
  guide,
}: RecordListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isGuiding =
    guide.currentStep !== null ||
    guide.isWaitingForForm ||
    guide.isPreparingGuide;

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;
    const currentRef = bottomRef.current;
    if (!currentRef) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(currentRef);
    return () => {
      observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  // 광고는 "전체 기록 수" 기준으로 5개마다 노출되므로,
  // 배지도 전체 count 기반으로 판단해야 실제 트리거와 일치한다.
  const shouldShowNextAdBadge = useMemo(
    () =>
      totalCount + 1 > 0 &&
      adService.checkIsMilestone(totalCount + 1, lastAdMilestoneShown),
    [totalCount, lastAdMilestoneShown],
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        columnGap: "12px",
        rowGap: "16px",
        padding: "0 20px",
        marginBottom: "20px",
      }}
    >
      <FeatureHighlight
        step="add-button"
        currentStep={guide.currentStep}
        onNext={guide.next}
        onSkip={guide.skip}
      >
        <AddRecordCard
          onClick={() =>
            onAddRecord(
              filterType === "전체" ? null : (filterType as RecordType),
            )
          }
        />
      </FeatureHighlight>
      {!isLoading && records.length === 0 && !isGuiding && (
        <EmptyState onQuickAdd={(type) => onAddRecord(type)} />
      )}
      {isGuiding && !guide.isPreparingGuide && (
        <>
          {EXAMPLE_RECORDS.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onClick={() => {}}
              onToggleFavorite={() => {}}
            />
          ))}
        </>
      )}
      {!isGuiding &&
        records.map((record) => (
          <RecordCard
            key={record.id}
            record={record}
            onClick={onRecordClick}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      {!isGuiding &&
        isLoading &&
        Array.from({ length: 5 }).map((_, i) => <RecordCardSkeleton key={i} />)}
      {!isGuiding && isLoadingMore && (
        <div
          style={{
            gridColumn: "span 3",
            display: "flex",
            justifyContent: "center",
            padding: "16px 0",
          }}
        >
          <Loader />
        </div>
      )}
      {!isGuiding && !isLoading && !isLoadingMore && hasMore && (
        <div ref={bottomRef} style={{ height: "20px", gridColumn: "span 3" }} />
      )}
      {!isGuiding &&
        !isLoading &&
        filterType === "전체" &&
        shouldShowNextAdBadge && <AdCard />}
    </div>
  );
}
