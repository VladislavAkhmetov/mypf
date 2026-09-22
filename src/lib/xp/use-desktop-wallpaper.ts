"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_WALLPAPER_SRC } from "./wallpapers";
import { getWallpaperPeriod, TIME_WALLPAPERS } from "./time-wallpaper";

export type WallpaperSource = "user" | "time";
const wallpaperKey = "amazi-xp-wallpaper";
const sourceKey = "amazi-xp-wallpaper-source";

export function useDesktopWallpaper() {
  // The desktop is client-only (ssr: false); read explicit manual preferences once.
  const [{ wallpaper, wallpaperSource }, setSelection] = useState<{ wallpaper: string; wallpaperSource: WallpaperSource }>(() => {
    try {
      const saved = localStorage.getItem(sourceKey) === "user" ? localStorage.getItem(wallpaperKey) : null;
      if (saved) return { wallpaper: saved, wallpaperSource: "user" };
    } catch { /* Private browsing may disable storage. */ }
    // Old geo selections are deliberately migrated to time-based Bliss.
    return { wallpaper: DEFAULT_WALLPAPER_SRC, wallpaperSource: "time" };
  });
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);

  useEffect(() => {
    if (wallpaperSource !== "time") return;
    const currentGeneration = ++generation.current;
    let disposed = false;
    let requested = "";
    let requestId = 0;
    const update = () => {
      const candidate = TIME_WALLPAPERS[getWallpaperPeriod(new Date())];
      if (requested === candidate) return;
      requested = candidate;
      const id = ++requestId;
      const apply = (src: string) => {
        if (!disposed && currentGeneration === generation.current && id === requestId) {
          setSelection(previous => previous.wallpaper === src ? previous : { wallpaper: src, wallpaperSource: "time" });
        }
      };
      if (candidate === DEFAULT_WALLPAPER_SRC) {
        apply(candidate);
        return;
      }
      const image = new Image();
      image.onload = () => apply(candidate);
      image.onerror = () => apply(DEFAULT_WALLPAPER_SRC);
      image.src = candidate;
    };
    update();
    const interval = window.setInterval(update, 30_000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [wallpaperSource, revision]);

  const setWallpaper = useCallback((src: string) => {
    generation.current++;
    setSelection({ wallpaper: src, wallpaperSource: "user" });
    try {
      localStorage.setItem(wallpaperKey, src);
      localStorage.setItem(sourceKey, "user");
    } catch { /* Manual selection still works for this session. */ }
  }, []);

  const resetWallpaperToTime = useCallback(() => {
    generation.current++;
    setSelection(previous => ({ ...previous, wallpaperSource: "time" }));
    setRevision(value => value + 1);
    try {
      localStorage.removeItem(wallpaperKey);
      localStorage.setItem(sourceKey, "time");
    } catch { /* Automatic selection does not require storage. */ }
  }, []);

  return { wallpaper, wallpaperSource, setWallpaper, resetWallpaperToTime };
}
