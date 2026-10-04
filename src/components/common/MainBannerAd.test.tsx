// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MainBannerAd } from "./MainBannerAd";
import { attachBannerAd } from "@/apis/bannerAd";
import type { BannerSlot } from "@/apis/bannerAd/type";

vi.mock("@/apis/bannerAd", () => ({ getBannerAdId: () => "ait-ad-test-banner-id", attachBannerAd: vi.fn() }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.mocked(attachBannerAd).mockReset(); });

it("일반 브라우저에는 광고 영역과 SDK 요청을 만들지 않는다", () => {
  render(<MainBannerAd />);
  expect(screen.queryByRole("complementary")).toBeNull();
  expect(attachBannerAd).not.toHaveBeenCalled();
});

it("광고가 없으면 영역을 없애고 부착한 슬롯도 정리한다", async () => {
  vi.stubGlobal("ReactNativeWebView", {});
  const destroy = vi.fn();
  vi.mocked(attachBannerAd).mockResolvedValue({ destroy });
  render(<MainBannerAd />);
  await waitFor(() => expect(attachBannerAd).toHaveBeenCalledOnce());
  await act(async () => { vi.mocked(attachBannerAd).mock.calls[0][3](); });
  expect(screen.queryByRole("complementary")).toBeNull();
  expect(destroy).toHaveBeenCalledOnce();
});

it("화면이 닫힌 뒤 도착한 슬롯도 즉시 제거한다", async () => {
  vi.stubGlobal("ReactNativeWebView", {});
  const destroy = vi.fn();
  let complete!: (slot: BannerSlot) => void;
  vi.mocked(attachBannerAd).mockImplementation(() => new Promise((resolve) => { complete = resolve; }));
  const { unmount } = render(<MainBannerAd />);
  unmount();
  await act(async () => { complete({ destroy }); });
  expect(destroy).toHaveBeenCalledOnce();
});
