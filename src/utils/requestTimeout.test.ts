import { afterEach, expect, it, vi } from "vitest";
import { withRequestTimeout, RequestTimeoutError } from "./requestTimeout";

afterEach(() => vi.useRealTimers());

it("3초를 넘기는 정상 요청을 실패 처리하지 않는다", async () => {
  vi.useFakeTimers();
  const result = withRequestTimeout(new Promise(resolve => setTimeout(() => resolve("ok"), 4500)), "기록 불러오기");
  await vi.advanceTimersByTimeAsync(4500);
  await expect(result).resolves.toBe("ok");
  expect(vi.getTimerCount()).toBe(0);
});

it("15초가 지나면 어떤 단계가 지연됐는지 알리고 타이머를 정리한다", async () => {
  vi.useFakeTimers();
  const result = withRequestTimeout(new Promise(() => {}), "사용자 연결");
  const assertion = expect(result).rejects.toMatchObject({
    code: "app/request-timeout", operation: "사용자 연결",
  });
  await vi.advanceTimersByTimeAsync(15000);
  await assertion;
  expect(vi.getTimerCount()).toBe(0);
});

it("DB 권한 오류를 시간 초과 오류로 바꾸지 않는다", async () => {
  const error = Object.assign(new Error("denied"), { code: "permission-denied" });
  await expect(withRequestTimeout(Promise.reject(error), "기록 불러오기")).rejects.toBe(error);
  expect(error).not.toBeInstanceOf(RequestTimeoutError);
});
