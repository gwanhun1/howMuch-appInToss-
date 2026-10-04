import { describe, expect, it } from "vitest";
import { exportWeddingCsv, findWeddingDuplicates, parseCsv, parseWeddingCsv, toWeddingRecords } from "./index";
import type { WeddingGuestDraft } from "./type";
const guest = (id: string, name = "김민수"): WeddingGuestDraft => ({ id, name, amount: "100000", relation: "신랑측 친구" });

describe("빠른 축의금 장부", () => {
  it("기존 받은 축의금 형식으로 변환하고 잘못된 날짜·금액·중복 ID를 거부한다", () => {
    expect(toWeddingRecords([guest("1")], "2026-10-04")[0]).toMatchObject({ mode: "received", type: "축의금", amount: 100000, date: "2026-10-04" });
    expect(() => toWeddingRecords([guest("1")], "2026-02-30")).toThrow();
    expect(() => toWeddingRecords([{ ...guest("1"), amount: "1e5" }], "2026-10-04")).toThrow();
    expect(() => toWeddingRecords([guest("1"), guest("1")], "2026-10-04")).toThrow();
  });
  it("날짜·이름·관계·금액이 같은 기존 기록과 입력 내 중복을 찾되 다른 날짜는 분리한다", () => {
    const existing = toWeddingRecords([guest("saved")], "2026-10-04");
    expect(findWeddingDuplicates([guest("new")], "2026-10-04", existing)).toEqual(["new"]);
    expect(findWeddingDuplicates([guest("new")], "2026-10-05", existing)).toEqual([]);
    expect(findWeddingDuplicates([guest("saved")], "2026-10-04", existing)).toEqual([]);
    expect(findWeddingDuplicates([guest("1"), guest("2")], "2026-10-04", [])).toEqual(["1", "2"]);
  });
  it("한글·쉼표·큰따옴표·줄바꿈을 포함한 CSV를 왕복하며 BOM을 지원한다", () => {
    const records = toWeddingRecords([guest("1", '김,"민수"\n친구')], "2026-10-04");
    const parsed = parseWeddingCsv(exportWeddingCsv(records), "2026-10-04");
    expect(parsed.guests[0].name).toBe(records[0].name);
    expect(parsed.guests[0].amount).toBe("100000");
    expect(parseWeddingCsv('이름,금액\n홍길동,"100,000"', "2026-10-04").guests[0].amount).toBe("100000");
  });
  it("열·날짜·인원·따옴표·크기 오류에서 일부만 불러오지 않는다", () => {
    for (const text of ['이름,금액\n민수', '이름,금액\n민수,0', '이름,금액,관계,날짜\n민수,100000,친구,2026-10-05',
      '이름,금액\n"민수,100000', '이름,금액\n"민수"x,100000', `이름,금액\n${'민수,100000\n'.repeat(26)}`, '가'.repeat(100001)]) {
      expect(() => parseWeddingCsv(text, "2026-10-04")).toThrow();
    }
    expect(parseCsv('이름,금액\n\n민수,100000\n')).toHaveLength(2);
  });
  it("스프레드시트 수식 시작 문자를 텍스트로 내보낸다", () => {
    const records = toWeddingRecords([guest("1", '=HYPERLINK("https://example.com")')], "2026-10-04");
    expect(parseCsv(exportWeddingCsv(records))[1][0]).toBe('\'=HYPERLINK("https://example.com")');
  });
});
