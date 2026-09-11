"use client";

import { motion } from "motion/react";
import { useLocale, type Locale } from "../lib/i18n";
import { cn } from "@/lib/utils";

export function LangSwitch() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="lang-switch">
      {(["ru", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            "relative z-10 px-2.5 py-1 text-[15px] uppercase tracking-[0.08em]",
            locale === l ? "text-white" : "text-white/40 hover:text-white/70",
          )}
        >
          {locale === l && (
            <motion.span
              layoutId="lang-pill"
              className="absolute inset-0 -z-10 rounded-full bg-white/10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          {l}
        </button>
      ))}
    </div>
  );
}
