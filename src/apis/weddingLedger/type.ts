export interface WeddingGuestDraft {
  id: string;
  name: string;
  amount: string;
  relation: string;
}
export interface ParsedWeddingCsv {
  guests: Omit<WeddingGuestDraft, "id">[];
}
