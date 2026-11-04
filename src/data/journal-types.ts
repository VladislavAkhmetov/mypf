export interface JournalMedia {
  type: "image" | "video";
  src: string;
  alt: string;
}

export type JournalBlock =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "media"; items: JournalMedia[] };

export interface JournalEntry {
  id: string;
  title: string;
  /** ISO date with timezone. */
  date: string;
  /** Slug of a project from src/data/projects.ts. */
  project?: string;
  minutes: number;
  /** Plain-text first paragraph, used by the desktop widget. */
  excerpt: string;
  cover?: JournalMedia;
  blocks: JournalBlock[];
}
