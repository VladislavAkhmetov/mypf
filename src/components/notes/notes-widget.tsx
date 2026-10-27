"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { newestNotes } from "@/data/notes";
import { useWindowManager } from "@/components/xp/window-manager-context";
import styles from "./notes-widget.module.css";

function formatPostDate(iso: string): string {
  try {
    const d = new Date(iso);
    const month = d.toLocaleDateString("ru-RU", { month: "long" });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${capitalizedMonth} ${d.getFullYear()}`;
  } catch {
    return "";
  }
}

export function NotesWidget() {
  const { openNotes, windows } = useWindowManager();
  const expanded = windows.some(win => win.id === "notes" && !win.isMinimized);
  const latest = newestNotes[0];

  if (expanded || !latest) return null;

  return (
    <aside
      className={styles.widget}
      aria-label="Виджет журнала"
      onPointerDown={event => event.stopPropagation()}
      onContextMenu={event => event.stopPropagation()}
    >
      {/* Widget Header */}
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <h2>Журнал</h2>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.1, rotate: 6 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 450, damping: 22 }}
          className={styles.expand}
          onClick={() => openNotes()}
          aria-label="Раскрыть журнал"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
          </svg>
        </motion.button>
      </header>

      {/* Clipped Feed */}
      <div className={styles.clippedFeed}>
        {newestNotes.slice(0, 2).map((note, index) => {
          const media = note.media?.[0];
          return (
            <button
              key={note.id}
              type="button"
              className={styles.entry}
              data-widget-note={note.id}
              onClick={() => openNotes()}
              aria-label={index === 0 ? "Читать последнюю запись" : "Читать предыдущую запись"}
            >
              {/* Date Header */}
              <div className={styles.dateRow}>
                <time className={styles.date} dateTime={note.date}>
                  {formatPostDate(note.date)}
                </time>
              </div>

              {/* Text content */}
              <span className={styles.excerpt}>{note.text.split("\n\n")[0]}</span>

              {/* Media image */}
              {media && (
                <span className={styles.cover}>
                  {media.type === "image" ? (
                    <Image src={media.src} alt={media.alt} fill sizes="400px" unoptimized />
                  ) : media.poster ? (
                    <Image src={media.poster} alt={media.alt} fill sizes="400px" unoptimized />
                  ) : (
                    <video src={media.src} preload="metadata" muted playsInline aria-label={media.alt} />
                  )}
                  {media.type === "video" && <span className={styles.play} aria-hidden="true">▶</span>}
                </span>
              )}

              {/* Mini Threads Action Bar */}
              <div className={styles.miniActions} aria-hidden="true">
                <span className={styles.miniActionIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </span>
                <span className={styles.miniActionIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </span>
                <span className={styles.miniActionIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Button in Threads Pill Style */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        className={styles.open}
        onClick={() => openNotes()}
      >
        <span>Открыть журнал</span>
        <span aria-hidden="true">↗</span>
      </motion.button>
    </aside>
  );
}
