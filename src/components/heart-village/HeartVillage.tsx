import { Asset, BottomSheet, Button, Spacing, Text } from "@toss/tds-mobile";
import { FeatureHeader } from "@/components/growth/FeatureHeader";
import { ConnectionNotice } from "@/components/common/ConnectionNotice";
import { HOUSE_STYLES, VILLAGE_CHARACTERS } from "@/apis/heartVillage";
import type { useHeartVillage } from "@/hooks/useHeartVillage";
import { VillageHouse } from "./VillageHouse";
import "./village.css";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];
interface Props {
  model: ReturnType<typeof useHeartVillage>;
  isLoading: boolean;
  error: string | null;
  canDecorate: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onBack: () => void;
  onAddRecord: () => void;
  onRecord: (id: string) => void;
}
export function HeartVillage({ model, isLoading, error, canDecorate, hasMore, isLoadingMore, onLoadMore, onRetry, onBack, onAddRecord, onRecord }: Props) {
  const selected = model.selected;
  const decoration = selected ? model.getDecoration(selected) : null;
  return <main className="growth-page village-page">
    <FeatureHeader title="마음 마을" onBack={selected ? () => model.selectResident(null) : onBack} />
    <div className="growth-content">
      <Text typography="t3" fontWeight="bold">내가 기억하는 작은 마을</Text>
      <p className="growth-note">마음을 주고받은 기록들이 이웃이 되었어요.<br />집을 눌러 추억을 보고, 내 취향으로 꾸며보세요.</p>
      {error ? <ConnectionNotice error={error} onRetry={onRetry} /> : isLoading ?
        <div className="village-state" role="status">이웃들을 만나고 있어요.</div> : <>
        <section className="village-scene" aria-label="마음 마을 지도">
          <div className="village-cloud village-cloud--one" aria-hidden="true" />
          <div className="village-cloud village-cloud--two" aria-hidden="true" />
          <div className="village-greeting" aria-hidden="true">마음이 머무는 곳</div>
          <div className="village-path" aria-hidden="true" />
          {model.residents.length ? <div className="village-neighbors">
            {model.visibleResidents.map((resident) => <button className="village-neighbor" type="button" key={resident.id}
              aria-label={`${resident.name}, ${resident.relation || "관계 없음"}의 집 열기`}
              onClick={() => model.selectResident(resident.id)}>
              <VillageHouse decoration={model.getDecoration(resident)} />
              <span className="village-name">{resident.name}</span>
              <span className="village-relation">{resident.relation || "관계 없음"}</span>
            </button>)}
          </div> : <div className="village-empty">
            <VillageHouse decoration={{ house: "sky", icon: "icon-quokka" }} />
            <Text typography="t5" fontWeight="bold">첫 이웃을 기다리고 있어요</Text>
            <p>마음 하나를 기록하면<br />이곳에 작은 집이 생겨요.</p>
            <Button size="small" onClick={onAddRecord}>첫 마음 기록하기</Button>
          </div>}
          <span className="village-tree village-tree--left" aria-hidden="true">♣</span>
          <span className="village-tree village-tree--right" aria-hidden="true">♣</span>
        </section>
        {model.residents.length > 0 && <nav className="village-pagination" aria-label="마을 구역 이동">
          <Button size="small" variant="weak" disabled={model.page === 0} onClick={() => model.setPage(model.page - 1)}>이전 구역</Button>
          <span aria-live="polite">{model.page + 1} / {model.pageCount}</span>
          <Button size="small" variant="weak" disabled={model.page >= model.pageCount - 1} onClick={() => model.setPage(model.page + 1)}>다음 구역</Button>
        </nav>}
        {hasMore && <Button display="block" variant="weak" loading={isLoadingMore} disabled={isLoadingMore} onClick={onLoadMore}>이전 기록의 이웃 더 불러오기</Button>}
        <p className="growth-note">같은 이름·관계의 기록을 한 집에 모았어요. 동명이인일 수 있으니 날짜와 내용을 확인해주세요. 집의 크기는 모두 같아요.</p>
      </>}
      {model.storageMessage && <p className="growth-note" role="status">{model.storageMessage}</p>}
    </div>
    <BottomSheet open={!!selected && !isLoading && !error} onClose={() => model.selectResident(null)} maxHeight="90vh"
      header={<div className="village-detail-header"><Text typography="t4" fontWeight="bold">{selected?.name}의 집</Text>
        <Button size="small" variant="weak" onClick={() => model.selectResident(null)}>닫기</Button></div>}>
      {selected && decoration && <div className="village-detail">
        <div className="village-detail-house"><VillageHouse decoration={decoration} /></div>
        <p className="growth-note">{selected.relation || "관계 없음"} · 같은 이름·관계의 기록 {selected.records.length}개</p>
        <fieldset className="village-choices"><legend>집 꾸미기</legend>
          <div className="growth-actions">{HOUSE_STYLES.map((style) => <Button key={style.value} size="small" variant="weak"
            color={decoration.house === style.value ? "primary" : "dark"} aria-pressed={decoration.house === style.value}
            disabled={!canDecorate} onClick={() => model.decorate({ house: style.value })}>{style.label}</Button>)}</div>
        </fieldset>
        <fieldset className="village-choices"><legend>마을 캐릭터</legend>
          <div className="village-icon-choices">{VILLAGE_CHARACTERS.map(({ icon, label }) => <button key={icon} type="button"
            aria-label={`${label} 캐릭터 선택`}
            aria-pressed={decoration.icon === icon} disabled={!canDecorate} onClick={() => model.decorate({ icon })}>
            <Asset.Icon name={icon as IconName} frameShape={Asset.frameShape.CleanW40} />
          </button>)}</div>
        </fieldset>
        <p className="growth-note">꾸미기는 지금 기기에 저장해요. 원래 기록의 프로필과 금액은 그대로예요.</p>
        {model.storageMessage && <p className="growth-note" role="status">{model.storageMessage}</p>}
        <Button size="small" variant="weak" color="dark" disabled={!canDecorate} onClick={model.resetDecoration}>기본 모습으로</Button>
        <Spacing size={24} />
        <Text typography="t5" fontWeight="bold">이 집에 모인 마음</Text>
        <div className="village-totals"><span>보낸 마음 <strong>{selected.totalPaid.toLocaleString()}원</strong></span>
          <span>받은 마음 <strong>{selected.totalReceived.toLocaleString()}원</strong></span></div>
        <div className="village-history">{selected.records.map((record) => <button key={record.id} type="button" onClick={() => onRecord(record.id)}>
          <span>{record.date || "날짜 없음"}<small>{record.mode === "paid" ? "보낸" : "받은"} 마음 · {record.type || "종류 없음"}</small></span>
          <strong>{record.amount.toLocaleString()}원</strong>
        </button>)}</div>
      </div>}
    </BottomSheet>
  </main>;
}
