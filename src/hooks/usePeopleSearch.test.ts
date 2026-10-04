import { describe, expect, it } from "vitest";
import { searchPeople } from "./usePeopleSearch";
import type { MoneyRecord } from "@/types/record";
const record = (patch: Partial<MoneyRecord>): MoneyRecord => ({
  id: "1", name: "김민수", relation: "친구", mode: "paid", amount: 100000,
  type: "축의금", date: "2026-10-01", profileIcon: "icon-face-cap", ...patch,
});

describe("사람별 검색", () => {
  it("보낸·받은 내역을 함께 검색하고 관계가 다른 동명이인은 분리한다", () => {
    const records = [record({}), record({ id: "2", mode: "received", amount: 200000, date: "2024-01-01" }),
      record({ id: "3", relation: "동료" }), record({ id: "4", name: "이지수" })];
    const groups = searchPeople(records, "  민수  ");
    expect(groups).toHaveLength(2);
    const friend = groups.find((g) => g.relation === "친구")!;
    expect(friend.totalPaid).toBe(100000);
    expect(friend.totalReceived).toBe(200000);
    expect(friend.records.map((r) => r.id)).toEqual(["1", "2"]);
    expect(records.map((r) => r.id)).toEqual(["1", "2", "3", "4"]);
  });
  it("빈 검색과 검색 결과 없음, 한글 정규화를 처리한다", () => {
    const records = [record({})];
    expect(searchPeople(records, "  ")).toEqual([]);
    expect(searchPeople(records, "없는이름")).toEqual([]);
    expect(searchPeople(records, "김민수".normalize("NFD"))).toHaveLength(1);
  });
});
