import { adService } from "../../apis/adService";
import { useEffect, useRef } from "react";
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

  const nextTarget = totalCount + 1;
  const shouldShowNextAdBadge =
    nextTarget > 0 &&
    adService.checkIsMilestone(nextTarget, lastAdMilestoneShown);

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
      >
        <AddRecordCard
          onClick={() =>
            onAddRecord(
              filterType === "전체" ? null : (filterType as RecordType),
            )
          }
        />
      </FeatureHighlight>
      {!isLoading && records.length === 0 && !isGuiding && <EmptyState />}
      {isGuiding && !guide.isPreparingGuide && (
        <>
          <FeatureHighlight
            step="example-cards"
            currentStep={guide.currentStep}
            onNext={guide.next}
          >
            <RecordCard
              record={EXAMPLE_RECORDS[0]}
              onClick={() => {}}
              onToggleFavorite={() => {}}
            />
          </FeatureHighlight>
          {EXAMPLE_RECORDS.slice(1).map((record) => (
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
            onClick={() => onRecordClick(record.id)}
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
