"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { xpSound } from "@/lib/xp/sound";
import {
  parseNavigationParams,
  getPrimaryWindowBounds,
  getWordWindowBounds,
  getNotesWindowBounds,
  getTaskbarHeight,
  FocusDirection,
} from "@/lib/xp/navigation";
import { useDesktopWallpaper, type WallpaperSource } from "@/lib/xp/use-desktop-wallpaper";

export type WindowType =
  | "notes"
  | "portfolio"
  | "solitaire"
  | "media-player"
  | "my-computer"
  | "my-documents"
  | "notepad"
  | "stories"
  | "cmd"
  | "display-properties"
  | "properties"
  | "resume"
  | "tools"
  | "word"
  | "minesweeper"
  | "paint"
  | "help";

export interface WindowItem {
  id: string;
  type: WindowType;
  title: string;
  iconType?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  props?: Record<string, unknown>;
}

export type XpTheme = "luna-blue" | "luna-silver" | "classic" | "royale-noir";

export interface BalloonInfo {
  title: string;
  message: string;
  id: number;
}

interface WindowManagerContextType {
  windows: WindowItem[];
  activeWindowId: string | null;
  wallpaper: string;
  setWallpaper: (wp: string) => void;
  wallpaperSource: WallpaperSource;
  resetWallpaperToTime: () => void;
  theme: XpTheme;
  setTheme: (theme: XpTheme) => void;
  openWindow: (
    win: Omit<WindowItem, "zIndex" | "isMinimized" | "isMaximized"> & {
      isMinimized?: boolean;
      isMaximized?: boolean;
    }
  ) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowBounds: (
    id: string,
    bounds: { x?: number; y?: number; width?: number; height?: number }
  ) => void;
  minimizeAll: () => void;
  openProject: (slug: string) => void;
  openPortfolio: (options?: {
    projectSlug?: string;
    focus?: FocusDirection;
    notFound?: boolean;
    pushHistory?: boolean;
  }) => void;
  openNotes: (options?: { noteId?: string; pushHistory?: boolean }) => void;
  openProfile: (options?: { pushHistory?: boolean }) => void;
  balloon: BalloonInfo | null;
  showBalloon: (title: string, message: string) => void;
  closeBalloon: () => void;
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

let topZ = 100;

function getDefaultWindows(): WindowItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const nav = parseNavigationParams(window.location.search);
  const bounds = getPrimaryWindowBounds();

  if (nav.target === "notes") {
    return [{ id: "notes", type: "notes", title: "Личный журнал", iconType: "stories", ...getNotesWindowBounds(), isMinimized: false, isMaximized: false, zIndex: 100, props: { noteId: nav.noteId } }];
  }

  if (nav.target === "portfolio") {
    return [
      {
        id: "portfolio",
        type: "portfolio",
        title: "Портфолио — Internet Explorer",
        iconType: "ie",
        ...bounds,
        isMinimized: false,
        isMaximized: false,
        zIndex: 100,
        props: {
          projectSlug: nav.projectSlug,
          focus: nav.focus,
          notFound: nav.projectNotFound,
        },
      },
    ];
  }

  // Clean entry without special params opens only Word with profile
  const wordBounds = getWordWindowBounds();
  return [
    {
      id: "word",
      type: "word",
      title: "Документы — Влад Ахметов",
      iconType: "word",
      ...wordBounds,
      isMinimized: false,
      isMaximized: false,
      zIndex: 100,
      props: {
        docSlug: "profile",
      },
    },
  ];
}

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowItem[]>(getDefaultWindows);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const nav = parseNavigationParams(window.location.search);
      return nav.target === "notes" ? "notes" : nav.target === "portfolio" ? "portfolio" : "word";
    }
    return null;
  });

  const { wallpaper, wallpaperSource, setWallpaper, resetWallpaperToTime } = useDesktopWallpaper();

  const [theme, setThemeState] = useState<XpTheme>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("amazi-xp-theme") as XpTheme;
      if (saved && ["luna-blue", "luna-silver", "classic", "royale-noir"].includes(saved)) {
        return saved;
      }
    }
    return "luna-blue";
  });

  const [balloon, setBalloon] = useState<BalloonInfo | null>(null);

  // Synchronize theme token attribute on root html tag
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-xp-theme", theme);
    }
  }, [theme]);

  const showBalloon = useCallback((title: string, message: string) => {
    xpSound.balloon();
    setBalloon({ title, message, id: Date.now() });
  }, []);

  const closeBalloon = useCallback(() => {
    setBalloon(null);
  }, []);

  const setTheme = useCallback((newTheme: XpTheme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("amazi-xp-theme", newTheme);
      document.documentElement.setAttribute("data-xp-theme", newTheme);
    }
  }, []);

  // Bring to front
  const focusWindow = useCallback((id: string) => {
    topZ += 1;
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          return { ...w, zIndex: topZ, isMinimized: false };
        }
        return w;
      })
    );
    setActiveWindowId(id);
  }, []);

  // Open or focus window
  const openWindow = useCallback(
    (
      win: Omit<WindowItem, "zIndex" | "isMinimized" | "isMaximized"> & {
        isMinimized?: boolean;
        isMaximized?: boolean;
      }
    ) => {
      setWindows((prev) => {
        const existing = prev.find((w) => w.id === win.id);
        topZ += 1;
        if (existing) {
          xpSound.open();
          return prev.map((w) =>
            w.id === win.id
              ? {
                  ...w,
                  isMinimized: false,
                  zIndex: topZ,
                  ...(win.props ? { props: { ...w.props, ...win.props } } : {}),
                }
              : w
          );
        }
        xpSound.open();
        return [
          ...prev,
          {
            ...win,
            isMinimized: win.isMinimized ?? false,
            isMaximized: win.isMaximized ?? false,
            zIndex: topZ,
          },
        ];
      });
      setActiveWindowId(win.id);
    },
    []
  );

  const closeWindow = useCallback((id: string) => {
    xpSound.click();
    setWindows((prev) => {
      const remaining = prev.filter((w) => w.id !== id);
      const visible = remaining.filter((w) => !w.isMinimized);
      if (visible.length > 0) {
        const nextActive = visible.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), visible[0]);
        setActiveWindowId(nextActive.id);
      } else {
        setActiveWindowId(null);
      }
      return remaining;
    });

    // Closing portfolio window clears its URL params via replaceState without opening Word immediately
    if (typeof window !== "undefined" && id === "notes" && parseNavigationParams(window.location.search).target === "notes") {
      const url = new URL(window.location.href);
      url.searchParams.delete("view");
      url.searchParams.delete("note");
      window.history.replaceState({}, "", url.toString());
    }
    if (typeof window !== "undefined" && (id === "portfolio" || id.startsWith("project-")) && parseNavigationParams(window.location.search).target === "portfolio") {
      const url = new URL(window.location.href);
      url.searchParams.delete("project");
      url.searchParams.delete("tool");
      url.searchParams.delete("view");
      url.searchParams.delete("focus");
      window.history.replaceState({}, "", url.toString());
      window.sessionStorage.removeItem("amazi-portfolio-slug");
      window.sessionStorage.removeItem("amazi-portfolio-focus");
      window.sessionStorage.removeItem("amazi-portfolio-scroll");
    }
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    xpSound.minimize();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId((cur) => (cur === id ? null : cur));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    xpSound.click();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: true } : w))
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    xpSound.restore();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: false, isMinimized: false } : w))
    );
  }, []);

  const updateWindowBounds = useCallback(
    (id: string, bounds: { x?: number; y?: number; width?: number; height?: number }) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...bounds } : w))
      );
    },
    []
  );

  const minimizeAll = useCallback(() => {
    xpSound.minimize();
    setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })));
    setActiveWindowId(null);
  }, []);

  const openNotes = useCallback((options?: { noteId?: string; pushHistory?: boolean }) => {
    openWindow({ id: "notes", type: "notes", title: "Личный журнал", iconType: "stories", ...getNotesWindowBounds(), props: { noteId: options?.noteId } });
    if (options?.pushHistory !== false) {
      const url = new URL(window.location.href);
      ["project", "tool", "focus", "note"].forEach(key => url.searchParams.delete(key));
      url.searchParams.set("view", "notes");
      if (options?.noteId) url.searchParams.set("note", options.noteId);
      window.history.pushState({ target: "notes" }, "", url.toString());
      window.dispatchEvent(new Event("portfolio:navigate"));
    }
  }, [openWindow]);

  // Unified Portfolio Browser launcher
  const openPortfolio = useCallback(
    (options?: {
      projectSlug?: string;
      focus?: FocusDirection;
      notFound?: boolean;
      pushHistory?: boolean;
    }) => {
      const bounds = getPrimaryWindowBounds();
      openWindow({
        id: "portfolio",
        type: "portfolio",
        title: "Портфолио — Internet Explorer",
        iconType: "ie",
        ...bounds,
        props: {
          projectSlug: options?.projectSlug,
          focus: options?.focus,
          notFound: options?.notFound,
        },
      });

      if (options?.pushHistory !== false && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("tool");
        url.searchParams.delete("note");
        if (options?.projectSlug) {
          url.searchParams.set("project", options.projectSlug);
          if (options.focus) {
            url.searchParams.set("focus", options.focus);
          } else {
            url.searchParams.delete("focus");
          }
          url.searchParams.delete("view");
        } else {
          url.searchParams.delete("project");
          url.searchParams.set("view", "portfolio");
          if (options?.focus) {
            url.searchParams.set("focus", options.focus);
          } else {
            url.searchParams.delete("focus");
          }
        }
        window.history.pushState(
          { target: "portfolio", project: options?.projectSlug, focus: options?.focus },
          "",
          url.toString()
        );
        window.dispatchEvent(new Event("portfolio:navigate"));
      }
    },
    [openWindow]
  );

  // Unified Profile launcher
  const openProfile = useCallback(
    (options?: { pushHistory?: boolean }) => {
      const bounds = getWordWindowBounds();
      openWindow({
        id: "word",
        type: "word",
        title: "Документы — Влад Ахметов",
        iconType: "word",
        ...bounds,
        props: {
          docSlug: "profile",
        },
      });

      if (options?.pushHistory !== false && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("project");
        url.searchParams.delete("tool");
        url.searchParams.delete("note");
        url.searchParams.delete("focus");
        const hasOther = Array.from(url.searchParams.keys()).some(
          (k) => k !== "view" && k !== "project" && k !== "focus"
        );
        if (hasOther) {
          url.searchParams.set("view", "profile");
        } else {
          url.searchParams.delete("view");
        }
        window.history.pushState({ target: "profile" }, "", url.toString());
      }
    },
    [openWindow]
  );

  // Maintain backwards-compatible openProject router leading directly into the portfolio browser
  const openProject = useCallback(
    (slug: string) => {
      openPortfolio({ projectSlug: slug, pushHistory: true });
    },
    [openPortfolio]
  );

  // Handle browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const nav = parseNavigationParams(window.location.search);
      if (nav.target === "notes") {
        openNotes({ noteId: nav.noteId, pushHistory: false });
      } else if (nav.target === "portfolio") {
        openPortfolio({
          projectSlug: nav.projectSlug,
          focus: nav.focus,
          notFound: nav.projectNotFound,
          pushHistory: false, // Popstate must not push a new history entry
        });
      } else {
        openProfile({
          pushHistory: false, // Popstate must not push a new history entry
        });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [openPortfolio, openProfile, openNotes]);

  // Keep window controls visible and accessible when viewport resizes
  useEffect(() => {
    const handleResize = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const taskbarH = getTaskbarHeight();
      const availH = Math.max(100, screenH - taskbarH);

      setWindows((prev) =>
        prev.map((w) => {
          if (w.id === "notes") return { ...w, ...getNotesWindowBounds() };
          const isPrimary = w.id === "word" || w.id === "portfolio";
          const newW = screenW < 1024 && isPrimary ? screenW : Math.min(w.width, screenW);
          const newH = screenW < 1024 && isPrimary ? availH : Math.min(w.height, availH);
          const newX = screenW < 1024 && isPrimary ? 0 : Math.max(0, Math.min(w.x, screenW - 80));
          const newY = screenW < 1024 && isPrimary ? 0 : Math.max(0, Math.min(w.y, availH - 30));

          return {
            ...w,
            x: newX,
            y: newY,
            width: newW,
            height: newH,
          };
        })
      );
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const value = useMemo(
    () => ({
      windows,
      activeWindowId,
      wallpaper,
      setWallpaper,
      wallpaperSource,
      resetWallpaperToTime,
      theme,
      setTheme,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      updateWindowBounds,
      minimizeAll,
      openProject,
      openPortfolio,
      openNotes,
      openProfile,
      balloon,
      showBalloon,
      closeBalloon,
    }),
    [
      windows,
      activeWindowId,
      wallpaper,
      setWallpaper,
      wallpaperSource,
      resetWallpaperToTime,
      theme,
      setTheme,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      updateWindowBounds,
      minimizeAll,
      openProject,
      openPortfolio,
      openNotes,
      openProfile,
      balloon,
      showBalloon,
      closeBalloon,
    ]
  );

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error("useWindowManager must be used inside WindowManagerProvider");
  return ctx;
}
