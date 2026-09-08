// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { getAnonymousKey, getDeviceId } from "@apps-in-toss/web-framework";
import { getTossUserIdentifier } from "./toss";

vi.mock("@apps-in-toss/web-framework", () => ({getAnonymousKey: vi.fn(), getDeviceId: vi.fn()}));
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); vi.resetAllMocks(); });

it("토스 응답이 2.5초를 넘어도 원래 사용자 키를 유지한다", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("ReactNativeWebView", {});
  vi.mocked(getAnonymousKey).mockImplementation(() => new Promise(resolve => {
    setTimeout(() => resolve({type: "HASH", hash: "existing-user"}), 4000);
  }));
  const result = getTossUserIdentifier();
  await vi.advanceTimersByTimeAsync(4000);
  await expect(result).resolves.toBe("toss-existing-user");
  expect(getDeviceId).not.toHaveBeenCalled();
});

it("토스 연결 실패를 새 익명 계정으로 바꾸지 않는다", async () => {
  vi.stubGlobal("ReactNativeWebView", {});
  vi.mocked(getAnonymousKey).mockResolvedValue("ERROR");
  await expect(getTossUserIdentifier()).rejects.toThrow("토스 사용자 정보");
  expect(getDeviceId).not.toHaveBeenCalled();
});

it("토스 응답이 없으면 재시도 가능한 단계별 오류를 반환한다", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("ReactNativeWebView", {});
  vi.mocked(getAnonymousKey).mockReturnValue(new Promise(() => {}));
  const result = getTossUserIdentifier();
  const assertion = expect(result).rejects.toMatchObject({operation: "토스 사용자 확인"});
  await vi.advanceTimersByTimeAsync(8000);
  await assertion;
});

it("미지원 구버전은 기존 기기 식별자를 사용한다", async () => {
  vi.stubGlobal("ReactNativeWebView", {});
  vi.mocked(getAnonymousKey).mockResolvedValue(undefined);
  vi.mocked(getDeviceId).mockReturnValue("legacy-device");
  await expect(getTossUserIdentifier()).resolves.toBe("device-legacy-device");
});

it("일반 브라우저는 네이티브 요청 없이 로컬 식별자를 유지한다", async () => {
  const first = await getTossUserIdentifier();
  expect(first).toMatch(/^anon-/);
  expect(await getTossUserIdentifier()).toBe(first);
  expect(getAnonymousKey).not.toHaveBeenCalled();
});
