import { toolsList } from "@/data/tools";

export type FocusDirection = "communication" | "engineering";

export const PORTFOLIO_DIRECTIONS: Record<FocusDirection, { title: string; slugs: string[] }> = {
  communication: {
    title: "Коммуникационный дизайн",
    slugs: [
      "printforge",
      "altyn-solok",
      "kora",
      "signalatlas",
      "afterimage",
      "voltform",
      "hearth",
      "iris-gate",
      "ledgerfold",
      "soft-lock",
      "pulp-index",
    ],
  },
  engineering: {
    title: "Интерфейсы и прототипы",
    slugs: ["printforge", "altyn-solok", "noclip", "dockyard", "sieve"],
  },
};

export const ALL_PROJECT_SLUGS: string[] = [
  "printforge",
  "altyn-solok",
  "kora",
  "signalatlas",
  "noclip",
  "sieve",
  "afterimage",
  "voltform",
  "hearth",
  "dockyard",
  "iris-gate",
  "ledgerfold",
  "soft-lock",
  "pulp-index",
];

export interface ParsedNavigation {
  target: "profile" | "portfolio";
  projectSlug?: string;
  toolSlug?: string;
  projectNotFound?: boolean;
  focus?: FocusDirection;
  otherParams: Record<string, string>;
}

/**
 * Pure function to parse URL search parameters according to the specification contract:
 * - Known project has priority over view.
 * - Unknown project leads to catalog with projectNotFound = true.
 * - Unknown focus defaults to general catalog.
 * - Unknown view without project defaults to profile.
 * - Extraneous query parameters are preserved in otherParams.
 */
export function parseNavigationParams(
  search: string | URLSearchParams
): ParsedNavigation {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;

  const otherParams: Record<string, string> = {};
  params.forEach((val, key) => {
    if (key !== "project" && key !== "tool" && key !== "view" && key !== "focus") {
      otherParams[key] = val;
    }
  });

  const rawProject = params.get("project");
  const rawView = params.get("view");
  const rawFocus = params.get("focus");

  const focus: FocusDirection | undefined =
    rawFocus === "communication" || rawFocus === "engineering"
      ? rawFocus
      : undefined;

  // Case 1: project parameter is present
  if (rawProject !== null && rawProject !== "") {
    if (ALL_PROJECT_SLUGS.includes(rawProject)) {
      return {
        target: "portfolio",
        projectSlug: rawProject,
        focus,
        otherParams,
      };
    }
    // Unknown project
    return {
      target: "portfolio",
      projectNotFound: true,
      focus,
      otherParams,
    };
  }

  const rawTool = params.get("tool");
  if (rawTool) {
    return toolsList.some(tool => tool.slug === rawTool)
      ? { target: "portfolio", toolSlug: rawTool, focus, otherParams }
      : { target: "portfolio", projectNotFound: true, focus, otherParams };
  }

  // Case 2: no project or tool, check view
  if (rawView === "portfolio") {
    return {
      target: "portfolio",
      focus,
      otherParams,
    };
  }

  // Any other case (no params, ?view=profile, unknown view) defaults to profile
  return {
    target: "profile",
    otherParams,
  };
}

/**
 * Builds a query string or relative URL path according to navigation state,
 * preserving extraneous parameters.
 */
export function buildNavigationQuery(
  target: "profile" | "portfolio",
  options?: {
    projectSlug?: string | null;
    toolSlug?: string | null;
    focus?: FocusDirection | null;
    otherParams?: Record<string, string>;
  }
): string {
  const params = new URLSearchParams(options?.otherParams || {});

  if (target === "profile") {
    // If there are other params, retain view=profile explicitly
    if (Object.keys(options?.otherParams || {}).length > 0) {
      params.set("view", "profile");
    }
  } else {
    // Portfolio target
    if (options?.projectSlug) {
      params.set("project", options.projectSlug);
      if (options.focus) {
        params.set("focus", options.focus);
      }
    } else if (options?.toolSlug) {
      params.set("tool", options.toolSlug);
      if (options.focus) params.set("focus", options.focus);
    } else {
      params.set("view", "portfolio");
      if (options?.focus) {
        params.set("focus", options.focus);
      }
    }
  }

  const str = params.toString();
  return str ? `?${str}` : "";
}

/**
 * Reads actual taskbar height from DOM or CSS variables without hardcoding new literals.
 */
export function getTaskbarHeight(): number {
  if (typeof document !== "undefined") {
    const taskbarEl = document.querySelector<HTMLElement>(".xp-taskbar");
    if (taskbarEl && taskbarEl.offsetHeight > 0) {
      return taskbarEl.offsetHeight;
    }
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue(
      "--xp-taskbar-h"
    );
    const parsed = parseFloat(cssVar);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 40;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculates primary window geometry:
 * - On width >= 1024px: 90% width, 92% available height, centered.
 * - On width < 1024px: 100% width, 100% available height, x=0, y=0.
 */
export function getPrimaryWindowBounds(): WindowBounds {
  const isClient = typeof window !== "undefined";
  const screenW = isClient ? window.innerWidth : 1024;
  const screenH = isClient ? window.innerHeight : 768;
  const taskbarH = getTaskbarHeight();
  const availH = Math.max(100, screenH - taskbarH);

  if (screenW >= 1024) {
    const width = Math.round(screenW * 0.9);
    const height = Math.round(availH * 0.92);
    const x = Math.max(0, Math.round((screenW - width) / 2));
    const y = Math.max(0, Math.round((availH - height) / 2));
    return { x, y, width, height };
  }

  return {
    x: 0,
    y: 0,
    width: screenW,
    height: availH,
  };
}

/**
 * Calculates Word window geometry:
 * Narrower than primary window to resemble Microsoft Word document view
 * and keep desktop icons visible on the left.
 */
export function getWordWindowBounds(): WindowBounds {
  const isClient = typeof window !== "undefined";
  const screenW = isClient ? window.innerWidth : 1024;
  const screenH = isClient ? window.innerHeight : 768;
  const taskbarH = getTaskbarHeight();
  const availH = Math.max(100, screenH - taskbarH);

  if (screenW >= 1024) {
    const width = Math.min(880, Math.max(780, Math.round(screenW * 0.72)));
    const height = Math.round(availH * 0.92);
    const x = Math.max(100, Math.round((screenW - width) / 2));
    const y = Math.max(10, Math.round((availH - height) / 2));
    return { x, y, width, height };
  }

  return {
    x: 0,
    y: 0,
    width: screenW,
    height: availH,
  };
}
