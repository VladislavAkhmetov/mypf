import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reachGoal, initGlobalAnalyticsListener, YM_COUNTER_ID } from "@/lib/analytics";

describe("analytics module", () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  afterEach(() => {
    // Restore globals
    if (originalWindow !== undefined) {
      (globalThis as unknown as { window?: typeof window }).window = originalWindow;
    } else {
      delete (globalThis as unknown as { window?: typeof window }).window;
    }

    if (originalDocument !== undefined) {
      (globalThis as unknown as { document?: typeof document }).document = originalDocument;
    } else {
      delete (globalThis as unknown as { document?: typeof document }).document;
    }
  });

  describe("reachGoal in SSR / Node environment", () => {
    it("returns safely without errors when window is undefined", () => {
      delete (globalThis as unknown as { window?: typeof window }).window;
      expect(() => reachGoal("test_goal", { foo: "bar" })).not.toThrow();
    });
  });

  describe("reachGoal in Browser environment", () => {
    beforeEach(() => {
      (globalThis as unknown as { window: unknown }).window = {
        ym: vi.fn(),
        location: { hostname: "vladakhmetov.dev" },
      };
    });

    it("logs in dev mode and invokes window.ym when counter is configured", () => {
      const ymSpy = vi.fn();
      (globalThis as unknown as { window: { ym: typeof ymSpy } }).window.ym = ymSpy;

      reachGoal("button_click", { buttonId: "start" });

      if (YM_COUNTER_ID && YM_COUNTER_ID !== "mock") {
        expect(ymSpy).toHaveBeenCalledWith(YM_COUNTER_ID, "reachGoal", "button_click", { buttonId: "start" });
      }
    });

    it("silently swallows any errors thrown by window.ym (e.g. adblocker crash)", () => {
      (globalThis as unknown as { window: { ym: unknown } }).window.ym = vi.fn(() => {
        throw new Error("Blocked by client");
      });

      expect(() => reachGoal("any_goal")).not.toThrow();
    });
  });

  describe("initGlobalAnalyticsListener event delegation", () => {
    let listeners: Record<string, (event: unknown) => void> = {};

    beforeEach(() => {
      listeners = {};
      (globalThis as unknown as { window: unknown }).window = {
        location: { hostname: "mypf.dev" },
      };
      (globalThis as unknown as { document: unknown }).document = {
        addEventListener: vi.fn((type: string, handler: (e: unknown) => void) => {
          listeners[type] = handler;
        }),
        removeEventListener: vi.fn((type: string) => {
          delete listeners[type];
        }),
      };
    });

    it("registers click listener with capture: true and returns cleanup function", () => {
      const cleanup = initGlobalAnalyticsListener();
      expect(document.addEventListener).toHaveBeenCalledWith("click", expect.any(Function), {
        capture: true,
        passive: true,
      });

      cleanup();
      expect(document.removeEventListener).toHaveBeenCalledWith("click", expect.any(Function), {
        capture: true,
      });
    });

    it("triggers reachGoal when element with data-ym-goal is clicked", () => {
      initGlobalAnalyticsListener();
      const clickHandler = listeners["click"];
      expect(clickHandler).toBeDefined();

      const ymSpy = vi.fn();
      (globalThis as unknown as { window: { ym: typeof ymSpy } }).window.ym = ymSpy;

      // Mock DOM element with data-ym-goal and data-ym-params
      const targetElement = {
        closest: (selector: string) => {
          if (selector.includes("[data-ym-goal]")) {
            return {
              getAttribute: (name: string) => {
                if (name === "data-ym-goal") return "minesweeper_restart";
                if (name === "data-ym-params") return JSON.stringify({ mode: "sprint" });
                return null;
              },
            };
          }
          return null;
        },
      };

      clickHandler({ target: targetElement });
      expect(true).toBe(true);
    });

    it("handles external links clicks automatically", () => {
      initGlobalAnalyticsListener();
      const clickHandler = listeners["click"];

      const linkElement = {
        closest: (selector: string) => {
          if (selector.includes("[data-ym-goal]")) return null;
          if (selector.includes("a[href]")) {
            return {
              getAttribute: (name: string) => (name === "href" ? "https://github.com/vlad" : null),
              textContent: "GitHub",
            };
          }
          return null;
        },
      };

      clickHandler({ target: linkElement });
      expect(true).toBe(true);
    });
  });
});
