export function BootScreen() {
  return (
    <main
      aria-label="얼마냈지 불러오는 중"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
      }}
    >
      <div
        role="status"
        aria-label="불러오는 중"
        style={{
          width: 36,
          height: 36,
          border: "4px solid #e5e8eb",
          borderTopColor: "#3182f6",
          borderRadius: "50%",
          animation: "boot-spinner 0.8s linear infinite",
        }}
      />
    </main>
  );
}
