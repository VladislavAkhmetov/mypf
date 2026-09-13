"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { xpSound } from "@/lib/xp/sound";
import { projects } from "@/data/projects";

export type WindowType =
  | "starter"
  | "solitaire"
  | "media-player"
  | "project"
  | "my-computer"
  | "my-documents"
  | "notepad"
  | "stories"
  | "cmd"
  | "display-properties"
  | "recycle-bin"
  | "properties"
  | "resume";

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
  theme: XpTheme;
  setTheme: (theme: XpTheme) => void;
  openWindow: (win: Omit<WindowItem, "zIndex" | "isMinimized" | "isMaximized"> & { isMinimized?: boolean; isMaximized?: boolean }) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowBounds: (id: string, bounds: { x?: number; y?: number; width?: number; height?: number }) => void;
  minimizeAll: () => void;
  openProject: (slug: string) => void;
  balloon: BalloonInfo | null;
  showBalloon: (title: string, message: string) => void;
  closeBalloon: () => void;
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

let topZ = 100;

function getDefaultWindows(): WindowItem[] {
  const isClient = typeof window !== "undefined";
  const screenW = isClient ? window.innerWidth : 1024;
  const isMobile = screenW < 768;

  const width = isMobile ? screenW : 720;
  const height = isMobile ? (isClient ? window.innerHeight - 46 : 520) : 480;
  const x = isMobile ? 0 : Math.max(20, Math.round((screenW - width) / 2));
  const y = isMobile ? 0 : 36;

  return [
    {
      id: "starter",
      type: "starter",
      title: "Влад Ахметов — Портфолио",
      iconType: "starter",
      x,
      y,
      width,
      height,
      isMinimized: false,
      isMaximized: false,
      zIndex: 100,
    },
  ];
}

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowItem[]>(getDefaultWindows);
  const [activeWindowId, setActiveWindowId] = useState<string | null>("starter");
  const [wallpaper, setWallpaperState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("amazi-xp-wallpaper") || "/images/bliss.jpg";
    }
    return "/images/bliss.jpg";
  });
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

  const setWallpaper = useCallback((wp: string) => {
    setWallpaperState(wp);
    window.localStorage.setItem("amazi-xp-wallpaper", wp);
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
      }),
    );
    setActiveWindowId(id);
  }, []);

  // Open or focus window
  const openWindow = useCallback(
    (win: Omit<WindowItem, "zIndex" | "isMinimized" | "isMaximized"> & { isMinimized?: boolean; isMaximized?: boolean }) => {
      setWindows((prev) => {
        const existing = prev.find((w) => w.id === win.id);
        topZ += 1;
        if (existing) {
          xpSound.open();
          return prev.map((w) =>
            w.id === win.id
              ? { ...w, isMinimized: false, zIndex: topZ, ...(win.props ? { props: win.props } : {}) }
              : w,
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
    [],
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

    // Clear project param if closing project window
    if (typeof window !== "undefined" && id.startsWith("project-")) {
      const url = new URL(window.location.href);
      if (url.searchParams.has("project")) {
        url.searchParams.delete("project");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    xpSound.minimize();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
    );
    setActiveWindowId((cur) => (cur === id ? null : cur));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    xpSound.click();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: true } : w)),
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    xpSound.restore();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: false, isMinimized: false } : w)),
    );
  }, []);

  const updateWindowBounds = useCallback(
    (id: string, bounds: { x?: number; y?: number; width?: number; height?: number }) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...bounds } : w)),
      );
    },
    [],
  );

  const minimizeAll = useCallback(() => {
    xpSound.minimize();
    setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })));
    setActiveWindowId(null);
  }, []);

  const openProject = useCallback(
    (slug: string) => {
      const proj = projects.find((p) => p.slug === slug);
      if (!proj) return;
      const screenW = typeof window !== "undefined" ? window.innerWidth : 1024;
      const screenH = typeof window !== "undefined" ? window.innerHeight : 768;

      const isMobile = screenW < 768;
      const width = isMobile ? screenW : Math.min(840, screenW - 120);
      const height = isMobile ? screenH - 46 : Math.min(580, screenH - 100);
      const x = isMobile ? 0 : Math.max(30, Math.round((screenW - width) / 2));
      const y = isMobile ? 0 : Math.max(20, Math.round((screenH - height) / 2) - 30);

      openWindow({
        id: `project-${slug}`,
        type: "project",
        title: `${proj.title} - C:\\Projects\\${proj.slug}`,
        iconType: proj.motif,
        x,
        y,
        width,
        height,
        props: { slug },
      });

      // Update URL with history entry
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.get("project") !== slug) {
          url.searchParams.set("project", slug);
          window.history.pushState({ project: slug }, "", url.toString());
        }
      }
    },
    [openWindow],
  );

  // Check query params on boot (without distracting unneeded welcome balloon A12)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetProject = params.get("project");
    if (targetProject) {
      setTimeout(() => {
        openProject(targetProject);
      }, 150);
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const projSlug = currentParams.get("project");
      if (projSlug) {
        openProject(projSlug);
      } else {
        setWindows((prev) => prev.filter((w) => !w.id.startsWith("project-")));
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [openProject]);

  const value = useMemo(
    () => ({
      windows,
      activeWindowId,
      wallpaper,
      setWallpaper,
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
      balloon,
      showBalloon,
      closeBalloon,
    }),
    [
      windows,
      activeWindowId,
      wallpaper,
      setWallpaper,
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
      balloon,
      showBalloon,
      closeBalloon,
    ],
  );

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error("useWindowManager must be used inside WindowManagerProvider");
  return ctx;
}
