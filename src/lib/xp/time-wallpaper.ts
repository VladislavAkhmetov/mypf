import { DEFAULT_WALLPAPER_SRC } from "./wallpapers";

export type WallpaperPeriod = "morning" | "day" | "evening" | "night";

export const TIME_WALLPAPERS: Record<WallpaperPeriod, string> = {
  morning: "/images/wallpapers/bliss-morning.jpg",
  day: DEFAULT_WALLPAPER_SRC,
  evening: "/images/wallpapers/bliss-evening.jpg",
  night: "/images/wallpapers/bliss-night.jpg",
};

/** Uses the visitor's local clock, never the server timezone or IP location. */
export function getWallpaperPeriod(date: Date): WallpaperPeriod {
  const hour = date.getHours();
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 18) return "day";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}
