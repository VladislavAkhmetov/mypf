import { describe, it, expect } from "vitest";
import {
  getWallpaperForCountry,
  findWallpaper,
  WALLPAPERS,
  DEFAULT_WALLPAPER,
  DEFAULT_WALLPAPER_SRC,
} from "@/lib/xp/wallpapers";

describe("wallpapers catalog and geo mapping", () => {
  it("contains valid wallpaper definitions with required fields", () => {
    expect(WALLPAPERS.length).toBeGreaterThanOrEqual(10);
    for (const wp of WALLPAPERS) {
      expect(wp.id).toBeDefined();
      expect(wp.name).toBeTruthy();
      expect(wp.src).toBeTruthy();
      expect(wp.desc).toBeTruthy();
    }
  });

  it("finds wallpaper by ID or src", () => {
    const bliss = findWallpaper("bliss");
    expect(bliss).toBeDefined();
    expect(bliss?.src).toBe(DEFAULT_WALLPAPER_SRC);

    const autumn = findWallpaper("/images/wallpapers/autumn.svg");
    expect(autumn).toBeDefined();
    expect(autumn?.id).toBe("autumn");

    expect(findWallpaper("non-existent-wallpaper")).toBeUndefined();
  });

  describe("getWallpaperForCountry mapping", () => {
    it("falls back to Bliss for undefined, null, or empty country codes", () => {
      expect(getWallpaperForCountry(undefined)).toEqual(DEFAULT_WALLPAPER);
      expect(getWallpaperForCountry(null)).toEqual(DEFAULT_WALLPAPER);
      expect(getWallpaperForCountry("")).toEqual(DEFAULT_WALLPAPER);
      expect(getWallpaperForCountry("   ")).toEqual(DEFAULT_WALLPAPER);
    });

    it("falls back to Bliss for unknown or unmapped countries", () => {
      expect(getWallpaperForCountry("ZZ")).toEqual(DEFAULT_WALLPAPER);
      expect(getWallpaperForCountry("XYZ")).toEqual(DEFAULT_WALLPAPER);
    });

    it("maps CIS and Eastern Europe to Autumn", () => {
      const cisCountries = ["RU", "BY", "KZ", "UA", "AM", "GE", "AZ", "UZ"];
      for (const code of cisCountries) {
        const wp = getWallpaperForCountry(code);
        expect(wp.id).toBe("autumn");
        expect(wp.src).toBe("/images/wallpapers/autumn.svg");
      }
    });

    it("is case-insensitive for country codes", () => {
      expect(getWallpaperForCountry("ru").id).toBe("autumn");
      expect(getWallpaperForCountry("Gb").id).toBe("stonehenge");
      expect(getWallpaperForCountry("it").id).toBe("azul");
    });

    it("maps Western and Central Europe to Stonehenge", () => {
      const weCountries = ["GB", "IE", "FR", "DE", "NL", "BE", "AT", "CH"];
      for (const code of weCountries) {
        expect(getWallpaperForCountry(code).id).toBe("stonehenge");
      }
    });

    it("maps Mediterranean and Southern Europe to Azul", () => {
      const medCountries = ["ES", "IT", "PT", "GR", "CY", "TR", "BR"];
      for (const code of medCountries) {
        expect(getWallpaperForCountry(code).id).toBe("azul");
      }
    });

    it("maps Middle East, Africa, and Australia to Red Moon Desert", () => {
      const desertCountries = ["AE", "SA", "QA", "EG", "IL", "AU"];
      for (const code of desertCountries) {
        expect(getWallpaperForCountry(code).id).toBe("desert");
      }
    });

    it("maps Nordic countries to Crystal", () => {
      const nordicCountries = ["NO", "SE", "FI", "IS", "CA"];
      for (const code of nordicCountries) {
        expect(getWallpaperForCountry(code).id).toBe("crystal");
      }
    });

    it("maps US to Bliss", () => {
      expect(getWallpaperForCountry("US").id).toBe("bliss");
      expect(getWallpaperForCountry("US").src).toBe(DEFAULT_WALLPAPER_SRC);
    });
  });
});
