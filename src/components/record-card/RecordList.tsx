import { useEffect, useRef } from "react";
import type { MoneyRecord, RecordType } from "../../types/record";
import { Asset, Loader, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { RecordCard } from "./RecordCard";
import { RecordListItem } from "./RecordListItem";
import { AddRecordCard } from "./AddRecordCard";
import { RecordCardSkeleton } from "./RecordCardSkeleton";
import { RecordListItemSkeleton } from "./RecordListItemSkeleton";
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
  onAddRecord: (initialType?: RecordType | null) => void;
  onRecordClick: (recordId: string) => void;
  onToggleFavorite: (recordId: string) => void;
  filterType?: string;
  viewMode?: "card" | "list";
  guide: GuideProps;
}

/** 리스트형 보기 전용 기록 추가 진입점 행. card 모드의 AddRecordCard와 동일하게 onAddRecord 연결. */
function AddRecordListRow({ onClick }: { onClick: () => void }) {
  const lastClickTime = useRef(0);
  const handleClick = () => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) return;
    lastClickTime.current = now;
    onClick();
  };
  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "14px 16px",
        backgroundColor: "rgba(49, 130, 246, 0.04)",
        borderRadius: "16px",
        border: "1px dashed rgba(49, 130, 246, 0.3)",
        cursor: "pointer",
        boxSizing: "border-box",
      }}
    >
      <Asset.Icon
        name="icon-plus-circle-mono"
        frameShape={Asset.frameShape.CleanW24}
        color={adaptive.blue600}
        style={{ width: 22, height: 22 }}
      />
      <Text typography="t6" fontWeight="bold" style={{ color: adaptive.blue600 }}>
        기록 추가
      </Text>
    </div>
  );
}

export function RecordList({
  records,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onAddRecord,
  onRecordClick,
  onToggleFavorite,
  filterType = "전체",
  viewMode = "card",
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

  if (viewMode === "list") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
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
          <AddRecordListRow
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
              <RecordListItem
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
            <RecordListItem
              key={record.id}
              record={record}
              onClick={onRecordClick}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        {!isGuiding &&
          isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <RecordListItemSkeleton key={i} />
          ))}
        {!isGuiding && isLoadingMore && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "16px 0",
            }}
          >
            <Loader />
          </div>
        )}
        {!isGuiding && !isLoading && !isLoadingMore && hasMore && (
          <div ref={bottomRef} style={{ height: "20px" }} />
        )}
      </div>
    );
  }

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
    </div>
  );
}
