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

export type Locale = "ru" | "en";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: <T extends { ru: string; en: string }>(v: T) => string;
};

const LocaleCtx = createContext<Ctx | null>(null);
const KEY = "amazi-locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "ru" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    <T extends { ru: string; en: string }>(v: T) => v[locale],
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
