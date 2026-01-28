export function emojiCodeToString(code: string): string {
  return String.fromCodePoint(parseInt(code.slice(1), 16));
}

export function isEmojiCode(icon: string): boolean {
  return icon.startsWith("u");
}
