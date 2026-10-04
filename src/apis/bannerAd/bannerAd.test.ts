// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { getBannerAdId } from "./index";

const sdk = vi.hoisted(() => ({
  initialize: Object.assign(vi.fn(), { isSupported: vi.fn(() => true) }),
  attachBanner: Object.assign(vi.fn(() => ({ destroy: vi.fn() })), { isSupported: vi.fn(() => true) }),
}));
vi.mock("@apps-in-toss/web-framework", () => ({ TossAds: sdk }));
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); vi.resetModules(); });

it("기본은 꺼짐이며 테스트 모드는 운영 ID를 입력해도 테스트 광고만 선택한다", () => {
  vi.stubEnv("VITE_BANNER_AD_MODE", "off");
  expect(getBannerAdId()).toBeNull();
  vi.stubEnv("VITE_BANNER_AD_MODE", "test");
  vi.stubEnv("VITE_BANNER_AD_GROUP_ID", "production-id");
  expect(getBannerAdId()).toBe("ait-ad-test-banner-id");
});

it("개발·QA 환경과 미설정 운영 ID로는 실제 광고를 요청하지 않는다", () => {
  vi.stubEnv("VITE_BANNER_AD_MODE", "live");
  vi.stubEnv("VITE_BANNER_AD_GROUP_ID", "production-id");
  vi.stubEnv("DEV", true);
  expect(getBannerAdId()).toBeNull();
  vi.stubEnv("DEV", false);
  vi.stubEnv("MODE", "qa");
  expect(getBannerAdId()).toBeNull();
  vi.stubEnv("MODE", "production");
  vi.stubEnv("VITE_BANNER_AD_GROUP_ID", "");
  expect(getBannerAdId()).toBeNull();
  vi.stubEnv("VITE_BANNER_AD_GROUP_ID", "ait-ad-test-banner-id");
  expect(getBannerAdId()).toBeNull();
});

it("초기화 대기 중 떠난 화면에는 광고를 부착하지 않는다", async () => {
  vi.stubGlobal("ReactNativeWebView", {});
  const { attachBannerAd } = await import("./index");
  const task = attachBannerAd("ait-ad-test-banner-id", document.createElement("div"), () => true, vi.fn());
  await vi.waitFor(() => expect(sdk.initialize).toHaveBeenCalledOnce());
  sdk.initialize.mock.calls[0][0].callbacks.onInitialized();
  expect(await task).toBeNull();
  expect(sdk.attachBanner).not.toHaveBeenCalled();
});

it("배너를 재부착해도 SDK 초기화는 한 번만 한다", async () => {
  vi.stubGlobal("ReactNativeWebView", {});
  const { attachBannerAd } = await import("./index");
  const first = attachBannerAd("ait-ad-test-banner-id", document.createElement("div"), () => false, vi.fn());
  await vi.waitFor(() => expect(sdk.initialize).toHaveBeenCalledOnce());
  sdk.initialize.mock.calls[0][0].callbacks.onInitialized();
  (await first)?.destroy();
  await attachBannerAd("ait-ad-test-banner-id", document.createElement("div"), () => false, vi.fn());
  expect(sdk.initialize).toHaveBeenCalledOnce();
  expect(sdk.attachBanner).toHaveBeenCalledTimes(2);
});
