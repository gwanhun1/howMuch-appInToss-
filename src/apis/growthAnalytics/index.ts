import type { GrowthTool, RecordSaveMethod } from "./type";

// Fixed event names and values only. Never accept records or user-entered fields here.
async function logEvent(logName: string, params: Record<string, string>): Promise<void> {
  if (typeof window === "undefined" || !("ReactNativeWebView" in window)) return;
  try {
    const { Analytics } = await import("@apps-in-toss/web-framework");
    await Analytics.log({ log_name: logName, log_type: "event", params });
  } catch {
    // Analytics failure must not turn a persisted record into a failed save.
  }
}

export function trackRecordSaved(method: RecordSaveMethod): Promise<void> {
  return logEvent("howmuch_record_saved", { method });
}

export function trackGrowthToolOpened(tool: GrowthTool): Promise<void> {
  return logEvent("howmuch_tool_opened", { tool });
}
