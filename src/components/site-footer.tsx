"use client";

import { site } from "@/data/site";
import { useLocale } from "../lib/i18n";

export function SiteFooter() {
  const { locale } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <span className="meta">
        {site.location[locale]} · {year}
      </span>
    </footer>
  );
}
