"use client";

import { useEffect, useState } from "react";
import { miniGames, type MiniGameId } from "@/data/mini-games";
import { useLocale } from "@/lib/i18n";
import styles from "./mobile-game-window.module.css";

type Status = "checking" | "ready" | "missing";

/**
 * A mobile game deployed as its own folder on the same server, shown inside a phone.
 * Until the folder exists, the phone shows a "coming soon" screen instead of a 404 page.
 */
export function MobileGameWindow({ gameId }: { gameId: MiniGameId }) {
  const { t, tr } = useLocale();
  const game = miniGames[gameId];
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;
    fetch(game.url, { method: "HEAD", cache: "no-store" })
      .then(response => {
        const isPage = (response.headers.get("content-type") ?? "").includes("text/html");
        if (!cancelled) setStatus(response.ok && isPage ? "ready" : "missing");
      })
      .catch(() => !cancelled && setStatus("missing"));
    return () => {
      cancelled = true;
    };
  }, [game.url]);

  return (
    <div className={styles.stage} style={{ "--screen-a": game.screen[0], "--screen-b": game.screen[1] } as React.CSSProperties}>
      <div className={styles.phone}>
        <div className={styles.screen}>
          {status === "ready" ? (
            <iframe className={styles.frame} src={game.url} title={t(game.name)} allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope" />
          ) : (
            <div className={styles.placeholder} aria-live="polite">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.icon} src={game.icon} alt="" draggable={false} />
              <b>{t(game.name)}</b>
              <span>{status === "checking" ? tr("Загружаем…", "Loading…") : tr("Игра скоро появится здесь", "The game is coming here soon")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
