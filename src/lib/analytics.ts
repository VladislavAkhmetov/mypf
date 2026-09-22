declare global {
  interface Window {
    ym?: (id: number | string, action: string, ...args: unknown[]) => void;
  }
}

export const YM_COUNTER_ID = process.env.NEXT_PUBLIC_YM_ID || "";

/**
 * Dispatches a goal event to Yandex.Metrika (with dev console fallback).
 */
export function reachGoal(goal: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.debug(`[YM Analytics] reachGoal: "${goal}"`, params ?? "");
  }

  if (window.ym && YM_COUNTER_ID && YM_COUNTER_ID !== "mock") {
    try {
      window.ym(YM_COUNTER_ID, "reachGoal", goal, params);
    } catch {
      // Gracefully ignore blocked scripts or adblockers
    }
  }
}

/**
 * Initializes declarative global event delegation for analytics.
 * Listens for elements with:
 * - data-ym-goal="..." (and optional data-ym-params='{"key":"val"}')
 * - data-analytics="..."
 * - External hyperlinks (http, mailto, tg)
 */
export function initGlobalAnalyticsListener(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // 1. Explicit data-ym-goal / data-analytics
    const goalEl = target.closest<HTMLElement>("[data-ym-goal], [data-analytics]");
    if (goalEl) {
      const goal = goalEl.getAttribute("data-ym-goal") || goalEl.getAttribute("data-analytics");
      if (goal) {
        let params: Record<string, unknown> | undefined;
        const rawParams = goalEl.getAttribute("data-ym-params");
        if (rawParams) {
          try {
            params = JSON.parse(rawParams);
          } catch {
            params = { raw: rawParams };
          }
        }
        reachGoal(goal, params);
      }
    }

    // 2. External links or contact links (if not already handled by explicit goal)
    const linkEl = target.closest<HTMLAnchorElement>("a[href]");
    if (linkEl && !goalEl) {
      const href = linkEl.getAttribute("href") || "";
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tg:")
      ) {
        const isExternal =
          href.startsWith("mailto:") ||
          href.startsWith("tg:") ||
          (href.startsWith("http") && !href.includes(window.location.hostname));

        if (isExternal) {
          reachGoal("external_link_click", {
            url: href,
            text: linkEl.textContent?.trim() || "",
          });
        }
      }
    }
  };

  document.addEventListener("click", handleClick, { capture: true, passive: true });
  return () => {
    document.removeEventListener("click", handleClick, { capture: true });
  };
}
