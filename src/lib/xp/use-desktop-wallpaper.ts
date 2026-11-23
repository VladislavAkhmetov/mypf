"use client";

import { useCallback, useState } from "react";
import { DEFAULT_WALLPAPER_SRC } from "./wallpapers";

export type WallpaperSource = "user" | "default" | "time";
const wallpaperKey = "xp-wallpaper";
const sourceKey = "xp-wallpaper-source";

export function useDesktopWallpaper() {
  // Desktop wallpaper is static by default (classic Bliss).
  const [{ wallpaper, wallpaperSource }, setSelection] = useState<{
    wallpaper: string;
    wallpaperSource: WallpaperSource;
  }>(() => {
    try {
      const savedSource = localStorage.getItem(sourceKey);
      const saved = localStorage.getItem(wallpaperKey);
      if (savedSource === "user" && saved) {
        return { wallpaper: saved, wallpaperSource: "user" };
      }
    } catch {
      /* Private browsing may disable storage. */
    }
    return { wallpaper: DEFAULT_WALLPAPER_SRC, wallpaperSource: "default" };
  });

  const setWallpaper = useCallback((src: string) => {
    setSelection({ wallpaper: src, wallpaperSource: "user" });
    try {
      localStorage.setItem(wallpaperKey, src);
      localStorage.setItem(sourceKey, "user");
    } catch {
      /* Manual selection still works for this session. */
    }
  }, []);

  const resetWallpaperToDefault = useCallback(() => {
    setSelection({ wallpaper: DEFAULT_WALLPAPER_SRC, wallpaperSource: "default" });
    try {
      localStorage.removeItem(wallpaperKey);
      localStorage.removeItem(sourceKey);
    } catch {
      /* Storage optional */
    }
  }, []);

  return {
    wallpaper,
    wallpaperSource,
    setWallpaper,
    resetWallpaperToDefault,
    resetWallpaperToTime: resetWallpaperToDefault,
  };
}
