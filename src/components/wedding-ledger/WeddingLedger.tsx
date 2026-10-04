import { Button, Checkbox, Spacing, Text, TextField } from "@toss/tds-mobile";
import { FeatureHeader } from "@/components/growth/FeatureHeader";
import type { useWeddingLedger } from "@/hooks/useWeddingLedger";
import { MAX_WEDDING_GUESTS } from "@/apis/weddingLedger";
import "../growth/growth.css";

export function WeddingLedger({ model, onBack }: { model: ReturnType<typeof useWeddingLedger>; onBack: () => void }) {
  return <main className="growth-page"><FeatureHeader title="결혼식 빠른 장부" onBack={onBack} />
    <div className="growth-content">
      <Text typography="t3" fontWeight="bold">받은 축의금, 한 번에 정리해요</Text>
      <p className="growth-note">최대 25명을 입력하고 확인 후 함께 저장해요. 저장한 내역은 기존 받은 마음에서도 볼 수 있어요.</p>
      <label className="growth-field">결혼식 날짜<input type="date" value={model.date} disabled={model.isSaving}
        onChange={(e) => model.setDate(e.target.value)} /></label>
      <section className="growth-card" aria-label="저장된 축의금 장부">
        <Text typography="t6">선택한 날짜에 받은 축의금 {model.ledger.length}건</Text><Spacing size={8} />
        <Text typography="t2" fontWeight="bold">{model.total.toLocaleString()}원</Text>
        <p className="growth-note">같은 날짜의 받은 축의금 기록을 모았어요. 이름·관계·날짜를 확인해주세요.</p>
        <Button variant="weak" size="small" disabled={!model.ledger.length || !!model.connectionMessage || model.isExporting}
          loading={model.isExporting} onClick={() => void model.exportCsv()}>저장된 장부 CSV 내보내기</Button>
        <p className="growth-note">파일에는 이름·금액·관계·날짜가 포함돼요. 본인 기기에 저장하며 공유 전 내용을 확인해주세요.</p>
        {model.ledger.length > 0 && <details><summary>저장된 내역 보기</summary><ul className="growth-list">
          {model.ledger.map((r) => <li key={r.id}><span>{r.name}<br /><small>{r.relation || "관계 없음"}</small></span><strong>{r.amount.toLocaleString()}원</strong></li>)}
        </ul></details>}
      </section>
      {model.guests.map((guest, index) => <section key={guest.id} className="growth-card" aria-label={`축의금 입력 ${index + 1}`}>
        <div className="growth-row-head"><Text typography="t5" fontWeight="bold">{index + 1}번째 하객</Text>
          <Button size="small" variant="weak" color="dark" disabled={model.isSaving} aria-label={`${index + 1}번째 하객 삭제`}
            onClick={() => model.removeGuest(guest.id)}>삭제</Button></div><Spacing size={16} />
        <TextField.Clearable variant="box" label="이름" placeholder="하객 이름" value={guest.name} maxLength={50}
          disabled={model.isSaving} onChange={(e) => model.updateGuest(guest.id, { name: e.target.value })} /><Spacing size={12} />
        <TextField.Clearable variant="box" label="받은 금액" placeholder="받은 축의금" suffix="원" inputMode="numeric" maxLength={9}
          value={guest.amount} disabled={model.isSaving} onChange={(e) => model.updateGuest(guest.id, { amount: e.target.value.replace(/[^0-9]/g, "") })} /><Spacing size={12} />
        <TextField.Clearable variant="box" label="관계·구분 (선택)" placeholder="예: 신랑측 친구" value={guest.relation} maxLength={50}
          disabled={model.isSaving} onChange={(e) => model.updateGuest(guest.id, { relation: e.target.value })} />
        {model.duplicates.includes(guest.id) && <p className="growth-error">같은 날짜·이름·관계·금액의 기록이 있어요. 중복인지 확인해주세요.</p>}
      </section>)}
      <Button display="block" variant="weak" disabled={model.isSaving || model.guests.length >= MAX_WEDDING_GUESTS}
        onClick={model.addGuest}>하객 추가하기</Button>
      <p className="growth-note">신랑측·신부측, 가족·친구·직장 같은 구분은 관계에 적어주세요. 저장 전 입력은 앱을 닫거나 새로고침하면 사라져요.</p>
      <details className="growth-card"><summary>CSV로 여러 명 불러오기</summary>
        <p className="growth-note">UTF-8 CSV를 선택하거나 내용을 붙여넣어주세요. 첫 줄: 이름,금액,관계,날짜<br />예: 김민수,100000,신랑측 친구,{model.date}<br />날짜를 포함하면 선택한 날짜와 같아야 해요. 불러온 뒤 확인하고 저장해주세요.</p>
        <label className="growth-field">CSV 파일 선택<input type="file" accept=".csv,text/csv" disabled={model.isSaving}
          onChange={(e) => { const file = e.target.files?.[0]; if (file) void model.importFile(file); e.target.value = ""; }} /></label>
        <label className="growth-field">CSV 내용<textarea rows={5} maxLength={100000} value={model.csvText} disabled={model.isSaving}
          onChange={(e) => model.setCsvText(e.target.value)} placeholder="이름,금액,관계,날짜" /></label>
        <Button display="block" variant="weak" disabled={model.isSaving || !model.csvText.trim()} onClick={() => model.importCsv()}>CSV 내용을 입력 목록에 추가하기</Button>
      </details>
      {model.duplicates.length > 0 && <label className="growth-field" style={{ flexDirection: "row", alignItems: "center" }}>
        <Checkbox.Circle checked={model.allowDuplicates} disabled={model.isSaving} onChange={(e) => model.setAllowDuplicates(e.target.checked)} />
        중복 의심 내역을 확인했으며 각각의 기록으로 저장할게요.
      </label>}
      {model.connectionMessage && <p className="growth-note" role="status">{model.connectionMessage}</p>}
      {model.error && <p className="growth-error" role="alert">{model.error}</p>}
      {model.message && <p className="growth-note" role="status">{model.message}</p>}
      {model.prepared.error && <p className="growth-note">{model.prepared.error}</p>}
      <Button display="block" disabled={!model.canSave} loading={model.isSaving} onClick={() => void model.save()}>
        {model.guests.length}명 · {model.prepared.records.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}원 저장하기
      </Button>
    </div>
  </main>;
}
