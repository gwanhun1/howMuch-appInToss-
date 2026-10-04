// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { buildVillage, loadVillageDecorations, saveVillageDecorations } from "./index";
import type { MoneyRecord } from "@/types/record";

const record = (patch: Partial<MoneyRecord> = {}): MoneyRecord => ({
  id: "a", name: "민수", relation: "친구", mode: "paid", amount: 100000, type: "축의금",
  date: "2026-10-01", profileIcon: "icon-quokka", createdAt: "2026-10-01T00:00:00Z", ...patch,
});
afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

it("같은 이름·관계의 주고받은 기록을 합치고 동명이인의 다른 관계는 분리한다", () => {
  const groups = buildVillage([record(), record({ id: "b", mode: "received", amount: 50000, date: "2026-10-02" }), record({ id: "c", relation: "직장" })]);
  expect(groups).toHaveLength(2);
  const friend = groups.find((g) => g.relation === "친구");
  expect(friend?.records.map((r) => r.id)).toEqual(["b", "a"]);
  expect(friend?.totalPaid).toBe(100000);
  expect(friend?.totalReceived).toBe(50000);
});
it("입력 순서와 금액으로 집의 순서가 달라지지 않고 원본 기록을 바꾸지 않는다", () => {
  const records = [record({ id: "z", name: "현수", amount: 1 }), record({ id: "b", name: "가람", amount: 100000000 })];
  const before = structuredClone(records);
  expect(buildVillage(records).map((g) => g.name)).toEqual(["가람", "현수"]);
  expect(buildVillage([...records].reverse())).toEqual(buildVillage(records));
  expect(records).toEqual(before);
});
it("새 기록 추가 뒤에도 최초 기록을 꾸미기 키로 유지한다", () => {
  expect(buildVillage([record(), record({ id: "new", date: "2026-10-03", createdAt: "2026-10-03T00:00:00Z" })])[0].id).toBe("a");
});
it("이름 앞뒤 공백을 정리하고 이름 없는 기록은 가짜 이웃으로 만들지 않는다", () => {
  expect(buildVillage([record(), record({ id: "b", name: " 민수 ", relation: " 친구 " }), record({ id: "c", name: "  " })])).toHaveLength(1);
});
it("꾸미기를 사용자별로 분리하고 이름·금액·전체 기록을 저장하지 않는다", () => {
  const items = { a: { house: "rose" as const, icon: "icon-quokka" } };
  expect(saveVillageDecorations("user-a", items)).toBe(true);
  expect(loadVillageDecorations("user-a")).toEqual(items);
  expect(loadVillageDecorations("user-b")).toEqual({});
  expect(localStorage.getItem(localStorage.key(0)!)).toBe(JSON.stringify({ version: 1, items }));
});
it("손상된 설정과 미지원 버전·집·아이콘은 무시한다", () => {
  saveVillageDecorations("u", {});
  const key = localStorage.key(0)!;
  localStorage.setItem(key, "bad-json");
  expect(loadVillageDecorations("u")).toEqual({});
  localStorage.setItem(key, JSON.stringify({ version: 1, items: { a: { house: "unknown", icon: "icon-quokka" }, b: { house: "sky", icon: "bad" }, c: { house: "forest", icon: "icon-quokka", name: "저장하면 안 되는 이름" } } }));
  expect(loadVillageDecorations("u")).toEqual({ c: { house: "forest", icon: "icon-quokka" } });
  localStorage.setItem(key, JSON.stringify({ version: 2, items: {} }));
  expect(loadVillageDecorations("u")).toEqual({});
});
it("기기 저장이 차단되면 오류를 반환해도 앱을 중단하지 않는다", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  expect(loadVillageDecorations("u")).toEqual({});
  expect(saveVillageDecorations("u", {})).toBe(false);
});
