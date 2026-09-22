import { describe, it, expect } from "vitest";
import { chronologicalNotes, newestNotes, latestNote } from "@/data/notes";
import { buildNavigationQuery, parseNavigationParams } from "@/lib/xp/navigation";

describe("notes navigation and content", () => {
  it("opens the feed and consumes note parameters, preserving attribution", () => {
    expect(parseNavigationParams("?view=notes&note=kora-process&utm_source=test")).toEqual({ target: "notes", notes: true, noteId: "kora-process", otherParams: { utm_source: "test" } });
    expect(parseNavigationParams("?view=notes").notes).toBe(true);
    expect(parseNavigationParams("?note=start").notes).toBe(true);
    expect(parseNavigationParams("?view=notes&project=kora").notes).toBeUndefined();
  });
  it("builds shareable feed and post links", () => {
    expect(buildNavigationQuery("notes")).toBe("?view=notes");
    const route = buildNavigationQuery("notes", { noteId: "kora-process", otherParams: { utm_source: "test" } });
    expect(parseNavigationParams(route).noteId).toBe("kora-process");
    expect(parseNavigationParams(route).otherParams).toEqual({ utm_source: "test" });
  });
  it("has stable unique IDs, valid dates, oldest-first order and descriptive media", () => {
    expect(new Set(chronologicalNotes.map(note => note.id)).size).toBe(chronologicalNotes.length);
    chronologicalNotes.forEach((note, index) => {
      expect(Number.isFinite(Date.parse(note.date))).toBe(true);
      expect(note.text.trim().length).toBeGreaterThan(0);
      if (index) expect(Date.parse(note.date)).toBeGreaterThanOrEqual(Date.parse(chronologicalNotes[index - 1].date));
      note.media?.forEach(media => expect(media.alt.trim().length).toBeGreaterThan(0));
    });
    expect(latestNote).toBe(chronologicalNotes.at(-1));
    expect(newestNotes[0]).toBe(latestNote);
    expect(newestNotes.map(note => note.id)).toEqual([...chronologicalNotes].reverse().map(note => note.id));
  });
});
