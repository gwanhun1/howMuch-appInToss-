import { FeatureTextField } from "@/components/growth/FeatureTextField";
import { Button, Spacing, Text } from "@toss/tds-mobile";
import { FeatureHeader } from "@/components/growth/FeatureHeader";
import { MAX_PLAN_ROWS, parseExpenseAmount } from "@/apis/budgetCalculator";
import type { useBudgetCalculator } from "@/hooks/useBudgetCalculator";
import type { GuideEvent } from "@/apis/amountGuide/type";
import type { RecordType } from "@/types/record";
import "../growth/growth.css";

type Model = ReturnType<typeof useBudgetCalculator>;
export function BudgetCalculator({ model, onBack, onGuide }: {
  model: Model; onBack: () => void; onGuide: (id: string, type: GuideEvent) => void;
}) {
  const incomplete = model.summary.missingIds.length + model.summary.invalidIds.length;
  return <main className="growth-page">
    <FeatureHeader title="경조사비 계산기" onBack={onBack} />
    <div className="growth-content">
      <Text typography="t3" fontWeight="bold">이번 달, 얼마 준비할까요?</Text>
      <p className="growth-note">예정된 경조사와 금액을 더해보세요. 계산 내용은 실제 지출 기록에 포함되지 않아요.</p>
      <label className="growth-field">계획할 달<input type="month" value={model.month} onChange={(e) => model.setMonth(e.target.value)} /></label>
      <FeatureTextField variant="box" label="준비한 예산 (선택)" inputMode="numeric" suffix="원"
        value={model.budget} maxLength={9} placeholder="예산과 예정 금액을 비교해보세요"
        onChange={(e) => model.setBudget(e.target.value.replace(/[^0-9]/g, ""))} />
      {model.budget && parseExpenseAmount(model.budget) === null && <p className="growth-error">예산은 1원부터 1억 원까지 입력해주세요.</p>}
      <section className="growth-card" aria-label="예정 금액 합계" aria-live="polite">
        <Text typography="t6">{model.month || "선택한 달"} · 예정 {model.rows.length}건</Text><Spacing size={8} />
        <Text typography="t2" fontWeight="bold" className="growth-total">{model.summary.total.toLocaleString()}원</Text>
        <p className="growth-note">{Object.entries(model.summary.counts).map(([type, count]) => `${type} ${count}건`).join(" · ") || "예정된 경조사를 추가해주세요."}</p>
        {incomplete > 0 && <p className="growth-error">금액 확인이 필요한 {incomplete}건은 합계에서 제외했어요.</p>}
        {model.summary.remaining !== null && <p>{model.summary.remaining >= 0
          ? `예산에서 ${model.summary.remaining.toLocaleString()}원 남아요.`
          : `예산보다 ${Math.abs(model.summary.remaining).toLocaleString()}원 더 필요해요.`}</p>}
      </section>
      {model.rows.map((row, index) => <section className="growth-card" key={row.id} aria-label={`예정 경조사 ${index + 1}`}>
        <div className="growth-row-head"><Text typography="t5" fontWeight="bold">예정 경조사 {index + 1}</Text>
          <Button size="small" variant="weak" color="dark" aria-label={`예정 경조사 ${index + 1} 삭제`} onClick={() => model.removeRow(row.id)}>삭제</Button></div>
        <Spacing size={16} />
        <FeatureTextField variant="box" label="이름·행사 (선택)" placeholder="예: 친구 결혼식" maxLength={50}
          value={row.name} onChange={(e) => model.updateRow(row.id, { name: e.target.value })} />
        <label className="growth-field">종류<select value={row.type} onChange={(e) => model.updateRow(row.id, { type: e.target.value as RecordType })}>
          {["축의금", "조의금", "돌잔치", "용돈"].map((type) => <option key={type}>{type}</option>)}</select></label>
        <FeatureTextField variant="box" label="예정 금액" inputMode="numeric" suffix="원" placeholder="예정 금액을 입력해주세요"
          value={row.amount} maxLength={9} onChange={(e) => model.updateRow(row.id, { amount: e.target.value.replace(/[^0-9]/g, "") })} />
        {row.amount && parseExpenseAmount(row.amount) === null && <p className="growth-error">1원부터 1억 원까지 입력해주세요.</p>}
        <Spacing size={12} />
        <div className="growth-actions">{[50000, 100000, 150000].map((amount) => <Button key={amount} size="small" variant="weak"
          color={row.amount === String(amount) ? "primary" : "dark"} aria-pressed={row.amount === String(amount)}
          onClick={() => model.updateRow(row.id, { amount: String(amount) })}>{amount / 10000}만 원</Button>)}
          {row.type !== "용돈" && <Button size="small" variant="weak" onClick={() => onGuide(row.id, row.type as GuideEvent)}>금액 가이드 보기</Button>}</div>
      </section>)}
      <Button display="block" variant="weak" disabled={model.rows.length >= MAX_PLAN_ROWS} onClick={model.addRow}>예정 경조사 추가하기</Button>
      <p className="growth-note">최대 {MAX_PLAN_ROWS}건까지 계산할 수 있어요. 입력 내용은 현재 이용 중에만 유지되며 앱을 닫거나 새로고침하면 사라져요.</p>
    </div>
  </main>;
}
