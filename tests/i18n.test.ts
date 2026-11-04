import { describe, it, expect } from "vitest";
import { detectLocale, localePath, resolveLocale } from "@/lib/i18n";

describe("language detection", () => {
  it("gives Russian to anyone who lists Russian, English to everyone else", () => {
    expect(detectLocale(["ru-RU", "en-US"])).toBe("ru");
    expect(detectLocale(["en-US", "ru"])).toBe("ru");
    expect(detectLocale(["en-GB"])).toBe("en");
    expect(detectLocale(["de-DE", "en"])).toBe("en");
    expect(detectLocale(["rue"])).toBe("en");
  });

  it("prefers the address, then a saved choice, then the browser", () => {
    expect(resolveLocale({ search: "?lang=en", saved: "ru", languages: ["ru-RU"] })).toEqual({ locale: "en", source: "url" });
    expect(resolveLocale({ search: "?lang=xx", saved: "ru", languages: ["en-US"] })).toEqual({ locale: "ru", source: "saved" });
    expect(resolveLocale({ search: "", saved: null, languages: ["en-US"] })).toEqual({ locale: "en", source: "detected" });
    expect(resolveLocale({ search: "", saved: null, languages: [] })).toEqual({ locale: "ru", source: "default" });
    expect(resolveLocale({ pathname: "/en/", search: "", saved: "ru", languages: ["ru-RU"] })).toEqual({ locale: "en", source: "url" });
    expect(resolveLocale({ pathname: "/english/", search: "", saved: "ru", languages: [] })).toEqual({ locale: "ru", source: "saved" });
  });

  it("moves between / and /en/ without touching the rest of the path", () => {
    expect(localePath("/", "en")).toBe("/en/");
    expect(localePath("/en/", "ru")).toBe("/");
    expect(localePath("/en", "ru")).toBe("/");
    expect(localePath("/en/", "en")).toBe("/en/");
    expect(localePath("/work/dombro/", "en")).toBe("/en/work/dombro/");
    expect(localePath("/en/work/dombro/", "ru")).toBe("/work/dombro/");
  });
});
