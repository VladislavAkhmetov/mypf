"use client";

import { LocaleProvider, type Locale } from "@/lib/i18n";
import type { ReactNode } from "react";

export function Providers({
  initialLocale = "ru",
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) {
  return <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>;
}

