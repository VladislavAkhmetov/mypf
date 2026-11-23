"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { siteMeta } from "@/data/site";

export type Locale = "ru" | "en";

/** Where the current language came from. "detected" means we guessed it from the browser. */
export type LocaleSource = "url" | "saved" | "detected" | "default";

type Ctx = {
  locale: Locale;
  source: LocaleSource;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: <T extends { ru: string; en: string }>(v: T) => string;
  /** Inline pair for one-off interface strings: tr("Открыть", "Open"). */
  tr: (ru: string, en: string) => string;
};

const LocaleCtx = createContext<Ctx | null>(null);
const KEY = "xp-locale";

const isLocale = (value: unknown): value is Locale => value === "ru" || value === "en";

/** Russian for anyone who lists Russian among their browser languages, English for everyone else. */
export function detectLocale(languages: readonly string[]): Locale {
  return languages.some(lang => lang.toLowerCase().split("-")[0] === "ru") ? "ru" : "en";
}

const EN_PREFIX = /^\/en(?=\/|$)/;

/** The English version lives under /en/, the Russian one at the root. Keeps the rest of the path. */
export function localePath(pathname: string, locale: Locale): string {
  const rest = pathname.replace(EN_PREFIX, "") || "/";
  return locale === "en" ? `/en${rest === "/" ? "/" : rest}` : rest;
}

/** The address wins (/en/ or ?lang=), then an earlier explicit choice, then the browser language. */
export function resolveLocale(env: { pathname?: string; search: string; saved: string | null; languages: readonly string[] }): { locale: Locale; source: LocaleSource } {
  if (env.pathname && EN_PREFIX.test(env.pathname)) return { locale: "en", source: "url" };
  const fromUrl = new URLSearchParams(env.search).get("lang");
  if (isLocale(fromUrl)) return { locale: fromUrl, source: "url" };
  if (isLocale(env.saved)) return { locale: env.saved, source: "saved" };

  if (env.languages.length) return { locale: detectLocale(env.languages), source: "detected" };
  return { locale: "ru", source: "default" };
}

export function LocaleProvider({
  initialLocale = "ru",
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) {
  const [state, setState] = useState<{ locale: Locale; source: LocaleSource }>(() => ({
    locale: initialLocale,
    source: initialLocale === "en" ? "url" : "default",
  }));
  const { locale, source } = state;

  // On mount, resolve saved preferences or browser languages if client-side state differs from initial.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(KEY);
    } catch {
      // Storage can be blocked (private mode, strict settings); fall back to detection.
    }
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language].filter(Boolean);
    const resolved = resolveLocale({
      pathname: window.location.pathname,
      search: window.location.search,
      saved,
      languages,
    });
    queueMicrotask(() => {
      setState(prev => (prev.locale !== resolved.locale || prev.source !== resolved.source ? resolved : prev));
    });
  }, []);

  // Sync state if user navigates back/forward (popstate) between /en/ and /
  useEffect(() => {
    const handlePopState = () => {
      const fromUrl = new URLSearchParams(window.location.search).get("lang");
      let targetLocale: Locale;
      if (isLocale(fromUrl)) {
        targetLocale = fromUrl;
      } else {
        targetLocale = EN_PREFIX.test(window.location.pathname) ? "en" : "ru";
      }
      setState(prev => (prev.locale !== targetLocale ? { locale: targetLocale, source: "url" } : prev));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setState(prev => (prev.locale === l && prev.source === "saved" ? prev : { locale: l, source: "saved" }));
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      // Not persisted, but the switch still applies for this visit.
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setState(prev => {
      const next: Locale = prev.locale === "ru" ? "en" : "ru";
      try {
        window.localStorage.setItem(KEY, next);
      } catch {
        /* ignore */
      }
      return { locale: next, source: "saved" };
    });
  }, []);

  // Keep <html lang> and the address in step with the interface: English at /en/, Russian at /.
  // The old ?lang= alias is folded into the path. replaceState keeps the open windows and history intact.
  useEffect(() => {
    document.documentElement.lang = locale;
    const url = new URL(window.location.href);
    url.searchParams.delete("lang");
    url.pathname = localePath(url.pathname, locale);
    if (url.toString() !== window.location.href) window.history.replaceState(window.history.state, "", url.toString());
  }, [locale]);

  // Tab title follows the language. Next re-renders <title> from the layout metadata after hydration,
  // so the right title is re-applied whenever the head changes.
  useEffect(() => {
    const title = siteMeta(locale).title;
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);

  // Alt+Shift switches the language, as it switches the keyboard layout in Windows.
  useEffect(() => {
    let armed = false;
    const down = (event: KeyboardEvent) => {
      const isModifier = event.key === "Alt" || event.key === "Shift";
      armed = isModifier && event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey;
    };
    const up = (event: KeyboardEvent) => {
      if (armed && (event.key === "Alt" || event.key === "Shift")) {
        armed = false;
        toggleLocale();
      }
    };
    const reset = () => {
      armed = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
    };
  }, [toggleLocale]);

  const t = useCallback(
    <T extends { ru: string; en: string }>(v: T) => v[locale],
    [locale],
  );

  const tr = useCallback((ru: string, en: string) => (locale === "en" ? en : ru), [locale]);

  const value = useMemo(() => ({ locale, source, setLocale, toggleLocale, t, tr }), [locale, source, setLocale, toggleLocale, t, tr]);

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
