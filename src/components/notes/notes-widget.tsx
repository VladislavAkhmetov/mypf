"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { newestNotes } from "@/data/notes";
import { useWindowManager } from "@/components/xp/window-manager-context";
import styles from "./notes-widget.module.css";
import { useLocale } from "@/lib/i18n";

function formatPostDate(iso: string, locale: "ru" | "en"): string {
  try {
    const d = new Date(iso);
    const month = d.toLocaleDateString(locale === "en" ? "en-US" : "ru-RU", { month: "long" });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${capitalizedMonth} ${d.getFullYear()}`;
  } catch {
    return "";
  }
}

export function NotesWidget() {
  const { tr, locale } = useLocale();
  const { openNotes, windows } = useWindowManager();
  const expanded = windows.some(win => win.id === "notes" && !win.isMinimized);
  const latest = newestNotes[0];

  if (expanded || !latest) return null;

  return (
    <aside
      className={styles.widget}
      aria-label={tr("Виджет журнала", "Journal widget")}
      onPointerDown={event => event.stopPropagation()}
      onContextMenu={event => event.stopPropagation()}
    >
      {/* Widget Header */}
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <h2>{tr("Журнал", "Journal")}</h2>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.1, rotate: 6 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 450, damping: 22 }}
          className={styles.expand}
          onClick={() => openNotes()}
          aria-label={tr("Раскрыть журнал", "Expand journal")}
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
          const media = note.cover;
          return (
            <button
              key={note.id}
              type="button"
              className={styles.entry}
              data-widget-note={note.id}
              onClick={() => openNotes({ noteId: note.id })}
              aria-label={index === 0 ? tr("Читать последнюю запись", "Read the latest entry") : tr("Читать предыдущую запись", "Read the previous entry")}
            >
              {/* Date Header */}
              <div className={styles.dateRow}>
                <time className={styles.date} dateTime={note.date}>
                  {formatPostDate(note.date, locale)}
                </time>
              </div>

              {/* Text content */}
              <span className={styles.excerpt}><strong>{note.title}</strong> {note.excerpt}</span>

              {/* Media image */}
              {media && (
                <span className={styles.cover}>
                  {media.type === "image" ? (
                    // Fixed size instead of `fill`: if the stylesheet is late (e.g. after a hot reload),
                    // a `fill` image would position itself against the whole desktop and cover it.
                    <Image src={media.src} alt={media.alt} width={800} height={500} unoptimized />
                  ) : (
                    <video src={media.src} preload="metadata" muted playsInline aria-label={media.alt} />
                  )}
                  {media.type === "video" && <span className={styles.play} aria-hidden="true">▶</span>}
                </span>
              )}
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
        <span>{tr("Открыть журнал", "Open journal")}</span>
        <span aria-hidden="true">↗</span>
      </motion.button>
    </aside>
  );
}
