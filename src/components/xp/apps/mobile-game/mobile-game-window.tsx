"use client";

import { useEffect, useState } from "react";
import { miniGames, type MiniGameId } from "@/data/mini-games";
import { useLocale } from "@/lib/i18n";
import styles from "./mobile-game-window.module.css";

type Status = "checking" | "ready" | "missing";

/**
 * A mobile game deployed as its own folder on the same server, shown in a clean narrow mobile window.
 * Until the folder exists, the window shows a friendly status screen instead of a 404 page.
 */
export function MobileGameWindow({ gameId }: { gameId: MiniGameId }) {
  const { t, tr } = useLocale();
  const game = miniGames[gameId];
  const [status, setStatus] = useState<Status>("checking");

  // Ensure path resolves correctly both on static servers and in Next.js dev server
  const targetUrl = game.url.endsWith("/") ? `${game.url}index.html` : game.url;

  useEffect(() => {
    let cancelled = false;

    // Check availability: HEAD first, fallback to GET if HEAD fails
    fetch(targetUrl, { method: "HEAD", cache: "no-store" })
      .then((response) => {
        const ct = response.headers.get("content-type") ?? "";
        const isPage = ct.includes("text/html") || ct === "";
        if (!cancelled) setStatus(response.ok && isPage ? "ready" : "missing");
      })
      .catch(() => {
        fetch(targetUrl, { method: "GET", cache: "no-store" })
          .then((res) => {
            if (!cancelled) setStatus(res.ok ? "ready" : "missing");
          })
          .catch(() => {
            if (!cancelled) setStatus("missing");
          });
      });

    return () => {
      cancelled = true;
    };
  }, [targetUrl]);

  return (
    <div
      className={styles.container}
      style={{ "--screen-a": game.screen[0], "--screen-b": game.screen[1] } as React.CSSProperties}
    >
      {status === "ready" ? (
        <iframe
          className={styles.frame}
          src={targetUrl}
          title={t(game.name)}
          allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
        />
      ) : (
        <div className={styles.placeholder} aria-live="polite">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.icon} src={game.icon} alt="" draggable={false} />
          <b>{t(game.name)}</b>
          <span>
            {status === "checking"
              ? tr("Загружаем…", "Loading…")
              : tr("Игра скоро появится здесь", "The game is coming here soon")}
          </span>
        </div>
      )}
    </div>
  );
}
