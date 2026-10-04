import { AmountGuide } from "@/components/amount-guide/AmountGuide";
import type { GuideEvent } from "@/apis/amountGuide/type";
import type { GuidedRecordDraft } from "@/types/record";
import { useRecordStore } from "@/stores/useRecordStore";

export function AmountGuidePage({ onBack, onRecord, initialType, selectionMode = false }: {
  onBack: () => void; onRecord: (draft: GuidedRecordDraft) => void;
  initialType?: GuideEvent; selectionMode?: boolean;
}) {
  const isLoading = useRecordStore((s) => s.isLoading);
  const error = useRecordStore((s) => s.error);
  const userIdentifier = useRecordStore((s) => s.userIdentifier);
  const connectionMessage = isLoading ? "기록을 연결하고 있어요. 금액 가이드는 먼저 이용할 수 있어요."
    : error ? "기록 연결에 실패했어요. 돌아가서 연결을 재시도해주세요."
      : !userIdentifier ? "기록 연결 후 저장할 수 있어요." : null;
  return <AmountGuide onBack={onBack} onRecord={onRecord}
    initialType={initialType} selectionMode={selectionMode}
    canRecord={selectionMode || (!isLoading && !error && !!userIdentifier)}
    connectionMessage={selectionMode ? "선택한 금액을 계산기에 반영해요. 실제 지출 기록에는 저장하지 않아요." : connectionMessage} />;
}
