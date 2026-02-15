import { adService } from "../../apis/adService";
import { useEffect, useRef } from "react";
import type { MoneyRecord, RecordType } from "../../types/record";
import { RecordCard } from "./RecordCard";
import { AddRecordCard } from "./AddRecordCard";
import { AdCard } from "../common/AdCard";
import { RecordCardSkeleton } from "./RecordCardSkeleton";
import { EmptyState } from "../onboarding/EmptyState";
import { FeatureHighlight } from "../onboarding/FeatureHighlight";
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
  records, totalCount, isLoading, isLoadingMore, hasMore,
  onLoadMore, lastAdMilestoneShown, onAddRecord, onRecordClick,
  onToggleFavorite, filterType = "전체", guide,
}: RecordListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;
    const currentRef = bottomRef.current;
    if (!currentRef) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onLoadMore(); },
      { threshold: 0.1 },
    );
    observer.observe(currentRef);
    return () => { observer.unobserve(currentRef); observer.disconnect(); };
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  const nextTarget = totalCount + 1;
  const shouldShowNextAdBadge =
    nextTarget > 0 && adService.checkIsMilestone(nextTarget, lastAdMilestoneShown);

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
      columnGap: "12px", rowGap: "16px", padding: "0 20px", marginBottom: "20px",
    }}>
      <FeatureHighlight
        step="add-button"
        currentStep={guide.currentStep}
        onNext={guide.next}
      >
        <AddRecordCard onClick={() => onAddRecord(filterType === "전체" ? null : (filterType as RecordType))} />
      </FeatureHighlight>
      {!isLoading && records.length === 0 && <EmptyState />}
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          onClick={() => onRecordClick(record.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
      {isLoading && Array.from({ length: 5 }).map((_, i) => <RecordCardSkeleton key={i} />)}
      {isLoadingMore && Array.from({ length: 3 }).map((_, i) => <RecordCardSkeleton key={`more-${i}`} />)}
      {!isLoading && !isLoadingMore && hasMore && (
        <div ref={bottomRef} style={{ height: "20px", gridColumn: "span 3" }} />
      )}
      {!isLoading && filterType === "전체" && shouldShowNextAdBadge && <AdCard />}
    </div>
  );
}
