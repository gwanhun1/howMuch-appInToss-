import { adaptive } from "@toss/tds-colors";

export function ConnectionNotice({ error, onRetry }: {
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <div role={error ? "alert" : "status"} style={{
      margin: "0 20px 16px", padding: 20, borderRadius: 16,
      background: adaptive.grey100, color: adaptive.grey800, lineHeight: 1.6,
    }}>
      <strong>{error ? "기록을 불러오지 못했어요" : "기록을 불러오고 있어요"}</strong>
      <p style={{ margin: "8px 0 0", fontSize: 14 }}>
        {error ?? "연결이 평소보다 늦어지고 있어요. 잠시만 기다려 주세요."}
      </p>
      {error && (
        <button type="button" onClick={onRetry} style={{
          marginTop: 12, padding: "10px 16px", border: 0, borderRadius: 10,
          background: adaptive.blue500, color: "#fff", font: "inherit", cursor: "pointer",
        }}>다시 불러오기</button>
      )}
    </div>
  );
}
