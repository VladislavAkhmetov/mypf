import { describe, it, expect } from "vitest";
import { newestNotes } from "@/data/notes";
import { buildNavigationQuery, parseNavigationParams } from "@/lib/xp/navigation";

describe("notes navigation and content", () => {
  it("opens the feed and consumes note parameters, preserving attribution", () => {
    expect(parseNavigationParams("?view=notes&note=dombro-subtract&utm_source=test")).toEqual({ target: "notes", notes: true, noteId: "dombro-subtract", otherParams: { utm_source: "test" } });
    expect(parseNavigationParams("?view=notes").notes).toBe(true);
    expect(parseNavigationParams("?note=kroomi-characters").notes).toBe(true);
    expect(parseNavigationParams("?view=notes&project=dombro").notes).toBeUndefined();
  });
  it("builds shareable feed and post links", () => {
    expect(buildNavigationQuery("notes")).toBe("?view=notes");
    const route = buildNavigationQuery("notes", { noteId: "dombro-subtract", otherParams: { utm_source: "test" } });
    expect(parseNavigationParams(route).noteId).toBe("dombro-subtract");
    expect(parseNavigationParams(route).otherParams).toEqual({ utm_source: "test" });
  });
  it("has stable unique IDs, valid dates, newest-first order and descriptive media", () => {
    expect(newestNotes.length).toBeGreaterThan(0);
    expect(new Set(newestNotes.map(note => note.id)).size).toBe(newestNotes.length);
    newestNotes.forEach((note, index) => {
      expect(Number.isFinite(Date.parse(note.date))).toBe(true);
      expect(note.title.trim().length).toBeGreaterThan(0);
      expect(note.blocks.length).toBeGreaterThan(0);
      if (index) expect(Date.parse(note.date)).toBeLessThanOrEqual(Date.parse(newestNotes[index - 1].date));
      note.blocks.forEach(block => {
        if (block.t === "media") block.items.forEach(media => expect(media.alt.trim().length).toBeGreaterThan(0));
      });
    });
  });
});
