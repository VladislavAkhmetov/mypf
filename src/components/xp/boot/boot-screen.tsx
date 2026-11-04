"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { WindowsFlagIcon } from "../xp-icons";
import styles from "./boot-screen.module.css";

const SESSION_KEY = "xp-booted";
/** First visit in a session gets one full pass of the bar; later loads only wait for the app. */
const FIRST_BOOT_MS = 1300;
const FADE_MS = 450;

/**
 * XP-style boot screen. It is part of the static HTML, so it appears before any script runs,
 * and fades out once the desktop has mounted underneath it.
 */
export function BootScreen({ ready, locale }: { ready: boolean; locale: "ru" | "en" }) {
  const [phase, setPhase] = useState<"boot" | "fade" | "gone">("boot");

  useEffect(() => {
    if (!ready) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    const wait = seen ? 0 : Math.max(0, FIRST_BOOT_MS - performance.now());
    const fade = window.setTimeout(() => setPhase("fade"), wait);
    const gone = window.setTimeout(() => setPhase("gone"), wait + FADE_MS);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(gone);
    };
  }, [ready]);

  if (phase === "gone") return null;

  const name = locale === "en" ? site.nameEn : site.name;

  return (
    <div
      className={`${styles.screen} ${phase === "fade" ? styles.fade : ""}`}
      role="status"
      aria-live="polite"
      aria-label={locale === "en" ? "Loading" : "Загрузка"}
    >
      <div className={styles.center}>
        <div className={styles.logo}>
          <WindowsFlagIcon className={styles.flag} />
          <div className={styles.wordmark}>
            <span className={styles.name}>
              {name}
              <sup className={styles.sup}>ai</sup>
            </span>
            <span className={styles.role}>{site.role.en}</span>
          </div>
        </div>
        <div className={styles.track} aria-hidden="true">
          <div className={styles.blocks}>
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
      <div className={styles.footer} aria-hidden="true">
        <span>© {new Date().getFullYear()} {name}</span>
        <span className={styles.brand}>amazi</span>
      </div>
    </div>
  );
}
