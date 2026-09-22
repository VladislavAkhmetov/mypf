import { describe, expect, it } from "vitest";
import { getWallpaperPeriod, TIME_WALLPAPERS } from "@/lib/xp/time-wallpaper";
import { DEFAULT_WALLPAPER_SRC } from "@/lib/xp/wallpapers";

describe("local-time Bliss wallpaper", () => {
  it.each([
    [0, 0, "night"], [5, 59, "night"], [6, 0, "morning"],
    [10, 59, "morning"], [11, 0, "day"], [17, 59, "day"],
    [18, 0, "evening"], [21, 59, "evening"], [22, 0, "night"], [23, 59, "night"],
  ] as const)("%i:%i selects %s", (hour, minute, expected) => {
    expect(getWallpaperPeriod(new Date(2026, 8, 22, hour, minute))).toBe(expected);
  });

  it("keeps the original Bliss for daytime", () => {
    expect(TIME_WALLPAPERS.day).toBe(DEFAULT_WALLPAPER_SRC);
    expect(new Set(Object.values(TIME_WALLPAPERS)).size).toBe(4);
  });
});
