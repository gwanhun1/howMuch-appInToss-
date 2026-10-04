import { FeatureTextField } from "@/components/growth/FeatureTextField";
import type { usePeopleSearch } from "@/hooks/usePeopleSearch";
import "../amount-guide/guide.css";

export function PeopleSearch({ search, isLoading, error, onRecordClick }: {
  search: ReturnType<typeof usePeopleSearch>; isLoading: boolean; error: string | null;
  onRecordClick: (id: string) => void;
}) {
  return <section className="people-search" aria-label="이름으로 기록 찾기"
    onTouchStart={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
    <FeatureTextField variant="box" label="이름으로 찾기" placeholder="누구에게 얼마 주고받았나요?"
      value={search.query} maxLength={50} onChange={(e) => search.setQuery(e.target.value)} />
    {search.isSearching && <div className="people-results">
      <p className="guide-note" role="status">{isLoading ? "기록을 불러오고 있어요."
        : error ? "기록을 연결하지 못했어요. 연결을 재시도해주세요."
          : `${search.groups.length}개 이름·관계 묶음 · 보낸 마음과 받은 마음을 함께 검색해요.`}</p>
      {!isLoading && !error && search.groups.length === 0 && <p>일치하는 이름이 없어요. 다른 이름으로 검색해보세요.</p>}
      {!isLoading && !error && search.groups.length > 0 && <>
        <p className="guide-note">이름과 관계가 같은 기록을 묶었어요. 동명이인일 수 있으니 날짜와 내역을 확인해주세요.</p>
        {search.groups.map((group) => <details key={group.key} open>
          <summary><strong>{group.name}</strong> · {group.relation || "관계 없음"} · {group.records.length}건</summary>
          <div className="people-totals"><span>보낸 마음 {group.totalPaid.toLocaleString()}원</span>
            <span>받은 마음 {group.totalReceived.toLocaleString()}원</span></div>
          {group.records.map((record) => <button className="person-record" type="button" key={record.id}
            onClick={() => onRecordClick(record.id)}>
            <span>{record.type || "유형 없음"}<small>{record.date || "날짜 없음"}</small></span>
            <strong>{record.mode === "paid" ? "보낸" : "받은"} {record.amount.toLocaleString()}원</strong>
          </button>)}
        </details>)}
      </>}
    </div>}
  </section>;
}
