import { journalEntries } from "./journal.generated";
import type { JournalEntry } from "./journal-types";

export type { JournalBlock, JournalEntry, JournalMedia } from "./journal-types";

// Записи пишутся в content/journal/*.md, подробности в docs/notes.md.
export const newestNotes: JournalEntry[] = [...journalEntries].sort(
  (a, b) => Date.parse(b.date) - Date.parse(a.date),
);

export const projectAccent: Record<string, string> = {
  dombro: "#ffb36b",
  tasker: "#c8ee94",
  kroomi: "#b98cff",
};
export const defaultAccent = "#e8e9df";
