import { HeartVillage } from "@/components/heart-village/HeartVillage";
import { useHeartVillage } from "@/hooks/useHeartVillage";
import { useRecordStore } from "@/stores/useRecordStore";

export function HeartVillagePage({ onBack, onAddRecord, onRecord }: {
  onBack: () => void; onAddRecord: () => void; onRecord: (id: string) => void;
}) {
  const records = useRecordStore((s) => s.records);
  const userId = useRecordStore((s) => s.userIdentifier);
  const isLoading = useRecordStore((s) => s.isLoading);
  const error = useRecordStore((s) => s.error);
  const hasMore = useRecordStore((s) => s.hasMore);
  const isLoadingMore = useRecordStore((s) => s.isLoadingMore);
  const fetchMoreRecords = useRecordStore((s) => s.fetchMoreRecords);
  const initializeStore = useRecordStore((s) => s.initializeStore);
  const model = useHeartVillage(records, userId);
  return <HeartVillage model={model} isLoading={isLoading} error={error} canDecorate={!!userId && !isLoading && !error}
    hasMore={hasMore} isLoadingMore={isLoadingMore} onLoadMore={() => void fetchMoreRecords()}
    onRetry={() => void initializeStore()} onBack={onBack} onAddRecord={onAddRecord} onRecord={onRecord} />;
}
