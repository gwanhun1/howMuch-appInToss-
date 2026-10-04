import { useMemo, useRef, useState } from "react";
import { useRecordStore } from "@/stores/useRecordStore";
import { downloadWeddingCsv, findWeddingDuplicates, MAX_CSV_BYTES, MAX_WEDDING_GUESTS, parseWeddingCsv, toWeddingRecords } from "@/apis/weddingLedger";
import type { WeddingGuestDraft } from "@/apis/weddingLedger/type";

function blankGuest(): WeddingGuestDraft { return { id: crypto.randomUUID(), name: "", amount: "", relation: "" }; }
function todayInSeoul(): string {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  return ["year", "month", "day"].map((type) => parts.find((p) => p.type === type)?.value).join("-");
}
export function useWeddingLedger() {
  const [date, setDate] = useState(todayInSeoul);
  const [guests, setGuests] = useState<WeddingGuestDraft[]>(() => [blankGuest()]);
  const [csvText, setCsvText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const busy = useRef(false);
  const records = useRecordStore((s) => s.records);
  const isLoading = useRecordStore((s) => s.isLoading);
  const connectionError = useRecordStore((s) => s.error);
  const uid = useRecordStore((s) => s.userIdentifier);
  const ledger = useMemo(() => records.filter((r) => r.mode === "received" && r.type === "축의금" && r.date === date)
    .sort((a, b) => a.name.localeCompare(b.name)), [records, date]);
  const duplicates = useMemo(() => findWeddingDuplicates(guests, date, records), [guests, date, records]);
  const prepared = useMemo(() => {
    try { return { records: toWeddingRecords(guests, date), error: null }; }
    catch (error) { return { records: [], error: error instanceof Error ? error.message : "입력 내용을 확인해주세요." }; }
  }, [guests, date]);
  const canSave = !isSaving && !isLoading && !connectionError && !!uid && !prepared.error && (!duplicates.length || allowDuplicates);
  const clearFeedback = () => { setError(null); setMessage(null); setAllowDuplicates(false); };
  const updateGuest = (id: string, patch: Partial<Omit<WeddingGuestDraft, "id">>) => {
    if (busy.current) return;
    clearFeedback(); setGuests((rows) => rows.map((r) => r.id === id ? { ...r, ...patch } : r));
  };
  const importCsv = (text = csvText) => {
    if (busy.current) return;
    try {
      const imported = parseWeddingCsv(text, date).guests;
      const hasBlank = guests.length === 1 && !guests[0].name && !guests[0].amount && !guests[0].relation;
      if ((hasBlank ? 0 : guests.length) + imported.length > MAX_WEDDING_GUESTS) throw new Error("현재 입력과 CSV를 합쳐 최대 25명까지 불러올 수 있어요.");
      clearFeedback();
      setGuests((rows) => [...(hasBlank ? [] : rows), ...imported.map((g) => ({ ...g, id: crypto.randomUUID() }))]);
      setCsvText(""); setMessage(`${imported.length}명을 입력 목록에 불러왔어요. 아직 저장되지 않았어요.`);
    } catch (error) { setError(error instanceof Error ? error.message : "CSV를 불러오지 못했어요."); }
  };
  const importFile = async (file: File) => {
    if (file.size > MAX_CSV_BYTES) { setError("CSV 파일은 100KB 이하로 선택해주세요."); return; }
    try { importCsv(await file.text()); } catch { setError("파일을 읽지 못했어요. UTF-8 CSV 내용을 붙여넣어주세요."); }
  };
  const save = async () => {
    if (busy.current || !canSave) return;
    busy.current = true; setIsSaving(true); setError(null); setMessage(null);
    try {
      await useRecordStore.getState().addRecords(prepared.records);
      setMessage(`${prepared.records.length}명의 축의금을 저장했어요.`);
      setGuests([blankGuest()]); setAllowDuplicates(false);
    } catch (error) { setError(error instanceof Error ? error.message : "저장하지 못했어요. 입력은 유지되니 다시 시도해주세요."); }
    finally { busy.current = false; setIsSaving(false); }
  };
  const exportCsv = async () => {
    if (!ledger.length || isExporting) return;
    setIsExporting(true); setError(null);
    try { await downloadWeddingCsv(ledger, date); setMessage("CSV 파일 저장을 요청했어요."); }
    catch (error) { setError(error instanceof Error ? error.message : "파일 저장을 완료하지 못했어요."); }
    finally { setIsExporting(false); }
  };
  return { date, guests, csvText, setCsvText, importCsv, importFile, ledger, duplicates, prepared,
    allowDuplicates, setAllowDuplicates, isSaving, isExporting, canSave, save, exportCsv, updateGuest, message, error,
    connectionMessage: isLoading ? "기록을 연결하고 있어요. 입력은 먼저 할 수 있어요." : connectionError ? "기록 연결에 실패했어요. 메인 화면에서 재시도해주세요." : !uid ? "기록 연결 후 저장할 수 있어요." : null,
    total: ledger.reduce((sum, r) => sum + r.amount, 0),
    setDate: (date: string) => { if (!busy.current) { clearFeedback(); setDate(date); } },
    addGuest: () => { if (!busy.current) { clearFeedback(); setGuests((rows) => rows.length < MAX_WEDDING_GUESTS ? [...rows, blankGuest()] : rows); } },
    removeGuest: (id: string) => { if (!busy.current) { clearFeedback(); setGuests((rows) => rows.filter((r) => r.id !== id)); } },
  };
}
