import { FeatureTextField } from "@/components/growth/FeatureTextField";
import { Button, Spacing, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { useAmountGuide } from "@/hooks/useAmountGuide";
import { FeatureHeader } from "@/components/growth/FeatureHeader";
import type { GuideEvent, Closeness } from "@/apis/amountGuide/type";
import type { GuidedRecordDraft } from "@/types/record";
import "./guide.css";

interface Props {
  onBack: () => void;
  onRecord: (draft: GuidedRecordDraft) => void;
  canRecord: boolean;
  connectionMessage: string | null;
  initialType?: GuideEvent;
  selectionMode?: boolean;
}

function Choices<T extends string>({ label, values, selected, onChange }: {
  label: string; values: { value: T; label: string }[]; selected: T; onChange: (value: T) => void;
}) {
  return <fieldset className="guide-fieldset"><legend>{label}</legend>
    <div className="guide-choices">{values.map((item) => <Button type="button" size="small" variant="weak" color={selected === item.value ? "primary" : "dark"}
      key={item.value} aria-pressed={selected === item.value}
      onClick={() => onChange(item.value)}>{item.label}</Button>)}</div>
  </fieldset>;
}

export function AmountGuide({ onBack, onRecord, canRecord, connectionMessage, initialType, selectionMode = false }: Props) {
  const guide = useAmountGuide(initialType);
  const { situation, changeSituation } = guide;
  return <main className="amount-guide" style={{ color: adaptive.grey900, background: adaptive.grey50 }}>
    <FeatureHeader title="경조사 금액 가이드" onBack={onBack} />
    <div className="guide-content">
      <Text typography="t3" fontWeight="bold">마음을 전할 금액, 함께 생각해봐요</Text>
      <Spacing size={8} />
      <Text typography="t6" color={adaptive.grey600}>기록이 없어도 상황에 맞는 선택지를 살펴볼 수 있어요.</Text>
      <Choices<GuideEvent> label="어떤 경조사인가요?" selected={situation.type}
        values={["축의금", "조의금", "돌잔치"].map((value) => ({ value: value as GuideEvent, label: value }))}
        onChange={(type) => changeSituation({ type })} />
      <Choices label="어떤 관계인가요?" selected={situation.relation}
        values={["친구", "가족", "지인", "직장", "동료"].map((value) => ({ value, label: value }))}
        onChange={(relation) => changeSituation({ relation })} />
      <Choices<Closeness> label="얼마나 가까운 사이인가요?" selected={situation.closeness}
        values={[{ value: "acquaintance", label: "가끔 연락해요" }, { value: "regular", label: "꾸준히 연락해요" },
          { value: "close", label: "아주 가까워요" }]} onChange={(closeness) => changeSituation({ closeness })} />
      <Choices label={situation.type === "조의금" ? "조문할 예정인가요?" : "참석할 예정인가요?"}
        selected={situation.attending ? "yes" : "no"}
        values={[{ value: "yes", label: "네" }, { value: "no", label: "아니요" }]}
        onChange={(value) => changeSituation({ attending: value === "yes" })} />
      <section className="guide-result" aria-label="참고 금액">
        <Text typography="t5" fontWeight="bold">이 금액부터 비교해보세요</Text>
        <p>{guide.result.explanation}</p>
        <div className="guide-choices">{guide.result.amounts.map((amount) =>
          <Button type="button" size="small" variant="weak" color={guide.amount === amount ? "primary" : "dark"}
            key={amount} aria-pressed={guide.amount === amount}
            onClick={() => guide.setSelectedAmount(amount)}>{amount.toLocaleString()}원</Button>)}</div>
        <p className="guide-note">서비스 자체 기준으로 만든 참고 선택지예요. 실제 평균이나 정답은 아니며, 기록할 때 금액을 자유롭게 바꿀 수 있어요.</p>
      </section>
      <Spacing size={24} />
      <FeatureTextField variant="box" label="이름 (선택)" value={guide.name} maxLength={50}
        placeholder="이전 내역도 함께 확인해보세요" onChange={(e) => guide.setName(e.target.value)} />
      {guide.personHistory.length > 0 && <section className="guide-history">
        <h2>같은 이름으로 남긴 기록</h2><p className="guide-note">동명이인일 수 있어요. 관계와 날짜를 함께 확인해주세요.</p>
        {guide.personHistory.map((r) => <p key={r.id}>{r.date || "날짜 없음"} · {r.relation || "관계 없음"} · {r.type}<br />
          {r.mode === "paid" ? "보낸" : "받은"} 마음 {r.amount.toLocaleString()}원</p>)}
      </section>}
      {guide.history.length > 0 && <section className="guide-history"><h2>최근 보낸 {situation.type} 기록</h2>
        {guide.history.map((r) => <button type="button" key={r.id} onClick={() => guide.setSelectedAmount(r.amount)}>
          <span>{r.name} · {r.date || "날짜 없음"}</span><strong>{r.amount.toLocaleString()}원 선택</strong>
        </button>)}</section>}
      <Spacing size={24} />
      <Button display="block" disabled={!canRecord} onClick={() => onRecord({
        type: situation.type, relation: situation.relation, name: guide.name.trim(), amount: guide.amount,
      })}>{guide.amount.toLocaleString()}원 {selectionMode ? "계산기에 적용하기" : "기록 입력하기"}</Button>
      <p className="guide-note">{connectionMessage ?? "입력창에서 이름·날짜·금액을 확인한 뒤 저장해요. 예정 금액은 실제로 보낸 뒤 기록해주세요."}</p>
    </div>
  </main>;
}
