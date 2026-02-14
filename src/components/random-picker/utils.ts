export function shuffleAndPick(arr: number[], count: number): number[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

export async function copyToClipboard(text: string) {
  try {
    const { setClipboardText } = await import("@apps-in-toss/web-framework");
    await setClipboardText(text);
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      Object.assign(ta.style, { position: "fixed", opacity: "0" });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch { /* 무시 */ }
  }
}
