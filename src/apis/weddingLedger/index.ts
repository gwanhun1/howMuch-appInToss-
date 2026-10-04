import type { MoneyRecord } from "@/types/record";
import type { WeddingGuestDraft, ParsedWeddingCsv } from "./type";
import { parseExpenseAmount } from "@/apis/budgetCalculator";
export const MAX_WEDDING_GUESTS = 25;
export const MAX_CSV_BYTES = 100000;

export function isValidRecordDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function toWeddingRecords(guests: WeddingGuestDraft[], date: string): MoneyRecord[] {
  if (!isValidRecordDate(date)) throw new Error("결혼식 날짜를 선택해주세요.");
  if (!guests.length || guests.length > MAX_WEDDING_GUESTS) throw new Error(`한 번에 1~${MAX_WEDDING_GUESTS}명까지 저장할 수 있어요.`);
  if (new Set(guests.map((g) => g.id)).size !== guests.length) throw new Error("중복된 입력 행이 있어요.");
  return guests.map((guest, index) => {
    const amount = parseExpenseAmount(guest.amount);
    if (!guest.name.trim() || guest.name.trim().length > 50 || guest.relation.length > 50 || amount === null) {
      throw new Error(`${index + 1}번째 이름과 금액을 확인해주세요. 금액은 1원부터 1억 원까지 입력할 수 있어요.`);
    }
    return { id: guest.id, name: guest.name.trim(), amount, relation: guest.relation.trim(),
      date, type: "축의금", mode: "received", profileIcon: "icon-face-cap", isFavorite: false };
  });
}

export function findWeddingDuplicates(guests: WeddingGuestDraft[], date: string, existing: MoneyRecord[]): string[] {
  const key = (name: string, amount: number, relation: string) => JSON.stringify([name.trim().normalize("NFC").toLocaleLowerCase(), amount, relation.trim()]);
  const known = new Set(existing.filter((r) => r.mode === "received" && r.type === "축의금" && r.date === date && !guests.some((g) => g.id === r.id))
    .map((r) => key(r.name, r.amount, r.relation)));
  const duplicates = new Set<string>();
  const seen = new Map<string, string>();
  for (const guest of guests) {
    const amount = parseExpenseAmount(guest.amount);
    if (!guest.name.trim() || amount === null) continue;
    const guestKey = key(guest.name, amount, guest.relation);
    if (known.has(guestKey)) duplicates.add(guest.id);
    const previousId = seen.get(guestKey);
    if (previousId) { duplicates.add(previousId); duplicates.add(guest.id); }
    seen.set(guestKey, guest.id);
  }
  return [...duplicates];
}

/** RFC-style quoted fields, double quotes and newlines. No spreadsheet evaluation. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field = ""; let quoted = false; let closed = false;
  const input = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') { field += '"'; i++; } else { quoted = false; closed = true; }
      } else field += char;
    } else if (char === ',' || char === '\n') {
      row.push(field); field = ""; closed = false;
      if (char === '\n') { if (row.some((c) => c.trim())) rows.push(row); row = []; }
    } else if (char === '"' && !field && !closed) quoted = true;
    else if (closed || char === '"') throw new Error("CSV 따옴표 형식을 확인해주세요.");
    else field += char;
  }
  if (quoted) throw new Error("CSV 따옴표가 닫히지 않았어요.");
  row.push(field); if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

export function parseWeddingCsv(text: string, date: string): ParsedWeddingCsv {
  if (new TextEncoder().encode(text).byteLength > MAX_CSV_BYTES) throw new Error("CSV는 100KB 이하로 불러올 수 있어요.");
  const [header, ...rows] = parseCsv(text);
  if (!header || header[0] !== "이름" || header[1] !== "금액" || header.length > 4 ||
    (header.length >= 3 && header[2] !== "관계") || (header.length === 4 && header[3] !== "날짜")) {
    throw new Error("첫 줄은 이름,금액 또는 이름,금액,관계,날짜로 입력해주세요.");
  }
  if (!rows.length || rows.length > MAX_WEDDING_GUESTS) throw new Error(`CSV에는 1~${MAX_WEDDING_GUESTS}명을 입력해주세요.`);
  const guests = rows.map((row, index) => {
    if (row.length !== header.length) throw new Error(`${index + 2}번째 CSV 줄의 열 개수를 확인해주세요.`);
    if (row[3] && row[3] !== date) throw new Error("CSV 날짜와 선택한 결혼식 날짜가 달라요. 같은 날짜의 기록만 불러와주세요.");
    return { name: row[0].trim(), amount: row[1].replace(/,/g, "").trim(), relation: (row[2] ?? "").trim() };
  });
  toWeddingRecords(guests.map((g, index) => ({ ...g, id: String(index) })), date);
  return { guests };
}

function safeCsvCell(value: string): string {
  // Excel 등에서 사용자 이름·관계가 수식으로 실행되지 않도록 텍스트화한다.
  const safe = /^[\s]*[=+\-@\t\r\n]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function exportWeddingCsv(records: MoneyRecord[]): string {
  const rows = records.filter((r) => r.mode === "received" && r.type === "축의금")
    .map((r) => [r.name, String(r.amount), r.relation, r.date].map(safeCsvCell).join(","));
  return `\uFEFF이름,금액,관계,날짜\r\n${rows.join("\r\n")}\r\n`;
}

export async function downloadWeddingCsv(records: MoneyRecord[], date: string): Promise<void> {
  const csv = exportWeddingCsv(records);
  const fileName = `축의금장부-${date}.csv`;
  if ("ReactNativeWebView" in window) {
    const { File } = await import("@apps-in-toss/web-framework");
    if (!File.saveBase64.isSupported()) throw new Error("토스 앱을 업데이트한 뒤 파일 저장을 이용해주세요.");
    const bytes = new TextEncoder().encode(csv);
    let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte);
    await File.saveBase64({ data: btoa(binary), fileName, mimeType: "text/csv" });
  } else {
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = fileName;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
