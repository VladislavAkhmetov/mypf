"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { xpSound } from "@/lib/xp/sound";
import { projects } from "@/data/projects";

export type WindowType =
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
  const isMobile = screenW < 840;

  const wmpWidth = isMobile ? screenW - 20 : 540;
  const wmpHeight = isMobile ? 420 : 440;
  const wmpX = isMobile ? 10 : Math.max(30, screenW - wmpWidth - 28);
  const wmpY = isMobile ? 14 : 24;

  return [
    {
      id: "media-player",
      type: "media-player",
      title: "Windows Media Player - Showreel 2026",
      iconType: "wmp",
      x: wmpX,
      y: wmpY,
      width: wmpWidth,
      height: wmpHeight,
      isMinimized: false,
      isMaximized: false,
      zIndex: 100,
    },
  ];
}

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowItem[]>(getDefaultWindows);
  const [activeWindowId, setActiveWindowId] = useState<string | null>("media-player");
  const [wallpaper, setWallpaperState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("amazi-xp-wallpaper") || "/images/bliss.jpg";
    }
    return "/images/bliss.jpg";
  });
  const [balloon, setBalloon] = useState<BalloonInfo | null>(null);

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
      const width = isMobile ? screenW - 16 : Math.min(840, screenW - 120);
      const height = isMobile ? screenH - 60 : Math.min(580, screenH - 100);
      const x = isMobile ? 8 : Math.max(30, Math.round((screenW - width) / 2) + Math.round((Math.random() * 40 - 20)));
      const y = isMobile ? 8 : Math.max(20, Math.round((screenH - height) / 2) - 30 + Math.round((Math.random() * 40 - 20)));

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

      // Update URL without full refresh
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("project", slug);
        window.history.replaceState({}, "", url.toString());
      }
    },
    [openWindow],
  );

  // Check query params on boot or show welcome balloon
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetProject = params.get("project");
    if (targetProject) {
      setTimeout(() => {
        openProject(targetProject);
      }, 200);
    } else {
      setTimeout(() => {
        showBalloon("Влад Ахметов — Портфолио", "Добро пожаловать в Windows XP! Дважды щелкните по иконке проекта для открытия.");
      }, 800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      windows,
      activeWindowId,
      wallpaper,
      setWallpaper,
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
