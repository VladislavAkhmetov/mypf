"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import Image from "next/image";
import { newestNotes, projectAccent, defaultAccent, type JournalBlock, type JournalMedia } from "@/data/notes";
import { getProject } from "@/data/projects";
import styles from "./notes-feed.module.css";
import { useLocale } from "@/lib/i18n";

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

// Минимальный разбор разметки внутри абзаца: **жирный**, *курсив*, `код`, [ссылка](url).
function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = /^https?:/.test(link[2]);
      return (
        <a key={index} href={link[2]} {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}>
          {link[1]}
        </a>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function formatDate(iso: string, locale: "ru" | "en"): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(" г.", "");
}

function monthLabel(iso: string, locale: "ru" | "en"): string {
  const label = new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "ru-RU", { month: "long", year: "numeric" }).replace(" г.", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function NotesFeed({
  noteId,
  scrollContainer,
  onPortfolio,
}: {
  noteId?: string;
  scrollContainer: RefObject<HTMLDivElement | null>;
  onOpenNote?: (id?: string) => void;
  onPortfolio: (projectSlug?: string) => void;
}) {
  const [media, setMedia] = useState<JournalMedia | null>(null);
  const { tr, locale } = useLocale();
  const dialog = useRef<HTMLDialogElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (media) dialog.current?.showModal();
    else dialog.current?.close();
  }, [media]);

  // Ссылка на конкретную запись: прокручиваем к ней.
  useEffect(() => {
    if (!noteId) return;
    const target = root.current?.querySelector<HTMLElement>(`[data-note-id="${noteId}"]`);
    const viewport = scrollContainer.current;
    if (target && viewport) viewport.scrollTo({ top: Math.max(0, target.offsetTop - 56), behavior: "instant" });
  }, [noteId, scrollContainer]);

  const renderMedia = (items: JournalMedia[], key: number) => (
    <div key={key} className={styles.media} data-count={Math.min(items.length, 3)}>
      {items.map((item, index) => (
        <figure key={`${item.src}-${index}`}>
          {item.type === "video" ? (
            <video src={item.src} controls playsInline preload="metadata" aria-label={item.alt} />
          ) : (
            <button type="button" onClick={() => setMedia(item)} aria-label={`${tr("Увеличить", "Zoom")}: ${item.alt}`}>
              <Image src={item.src} alt={item.alt} width={1400} height={1000} unoptimized />
            </button>
          )}
          {item.alt && <figcaption>{item.alt}</figcaption>}
        </figure>
      ))}
    </div>
  );

  const renderBlock = (block: JournalBlock, index: number) => {
    switch (block.t) {
      case "p":
        return <p key={index}>{renderInline(block.text)}</p>;
      case "h":
        return <h4 key={index}>{renderInline(block.text)}</h4>;
      case "ul":
        return (
          <ul key={index}>
            {block.items.map((item, i) => (
              <li key={i}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      case "media":
        return renderMedia(block.items, index);
    }
  };

  return (
    <div ref={root} className={styles.notes}>
      <main className={styles.column}>
        {newestNotes.length === 0 && <p className={styles.empty}>{tr("Пока записей нет.", "No entries yet.")}</p>}
        {newestNotes.map((note, index) => {
          const month = monthLabel(note.date, locale);
          const showMonth = index === 0 || month !== monthLabel(newestNotes[index - 1].date, locale);
          const project = note.project ? getProject(note.project) : undefined;
          return (
            <Fragment key={note.id}>
              {showMonth && <h2 className={styles.month}>{month}</h2>}
              <article
                className={styles.entry}
                data-note-id={note.id}
                data-current={noteId === note.id}
                style={{ "--accent": (note.project && projectAccent[note.project]) || defaultAccent } as CSSProperties}
              >
                <header>
                  <p className={styles.date}>
                    <time dateTime={note.date}>{formatDate(note.date, locale)}</time>
                    <span aria-hidden="true">·</span>
                    {note.minutes} мин чтения
                  </p>
                  <h3>{note.title}</h3>
                </header>
                <div className={styles.prose}>{note.blocks.map(renderBlock)}</div>
                {project && (
                  <button type="button" className={styles.projectLink} onClick={() => onPortfolio(project.slug)}>
                    Смотреть проект {project.title} <span aria-hidden="true">↗</span>
                  </button>
                )}
              </article>
            </Fragment>
          );
        })}
      </main>

      <dialog
        ref={dialog}
        className={styles.lightbox}
        onCancel={() => setMedia(null)}
        onClose={() => setMedia(null)}
        onClick={event => {
          if (event.target === event.currentTarget) setMedia(null);
        }}
        aria-label={tr("Просмотр изображения", "Image viewer")}
      >
        <button type="button" onClick={() => setMedia(null)} aria-label={tr("Закрыть изображение", "Close image")}>×</button>
        {media && <Image src={media.src} alt={media.alt} width={1600} height={1200} unoptimized />}
        <p>{media?.alt}</p>
      </dialog>
    </div>
  );
}
