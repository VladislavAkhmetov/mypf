"use client";

import Image from "next/image";
import { newestNotes } from "@/data/notes";
import { site } from "@/data/site";
import { useWindowManager } from "@/components/xp/window-manager-context";
import styles from "./notes-widget.module.css";

export function NotesWidget() {
  const { openNotes, windows } = useWindowManager();
  const expanded = windows.some(win => win.id === "notes" && !win.isMinimized);
  const latest = newestNotes[0];
  if (expanded || !latest) return null;
  return (
    <aside className={styles.widget} aria-label="Виджет журнала" onPointerDown={event => event.stopPropagation()} onContextMenu={event => event.stopPropagation()}>
      <header className={styles.header}>
        <div><span className={styles.eyebrow}><span />Личный журнал</span><h2>Заметки<span>.</span></h2></div>
        <button type="button" className={styles.expand} onClick={() => openNotes()} aria-label="Раскрыть журнал"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" /></svg></button>
      </header>
      <div className={styles.clippedFeed}>
        {newestNotes.slice(0, 2).map((note, index) => {
          const media = note.media?.[0];
          return <button key={note.id} type="button" className={styles.entry} data-widget-note={note.id} onClick={() => openNotes({ noteId: note.id })} aria-label={index === 0 ? "Читать последнюю запись" : "Читать предыдущую запись"}>
            <span className={styles.meta}><span>{index === 0 ? "Последняя запись" : "Ранее"}</span><time dateTime={note.date}>{new Date(note.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</time></span>
            {media && <span className={styles.cover}>{media.type === "image" ? <Image src={media.src} alt={media.alt} fill sizes="400px" unoptimized /> : media.poster ? <Image src={media.poster} alt={media.alt} fill sizes="400px" unoptimized /> : <video src={media.src} preload="metadata" muted playsInline aria-label={media.alt} />}{media.type === "video" && <span className={styles.play} aria-hidden="true">▶</span>}<span className={styles.category}>{note.category}</span></span>}
            <span className={styles.excerpt}>{note.text.split("\n\n")[0]}</span>
            {index === 0 && <span className={styles.author}><Image src={site.avatar} alt="" width={36} height={36} unoptimized /><span>{site.name}</span>{note.demo && <span className={styles.demo}>Демо</span>}</span>}
          </button>;
        })}
      </div>
      <button type="button" className={styles.open} onClick={() => openNotes()}><span>Открыть журнал</span><span aria-hidden="true">↗</span></button>
    </aside>
  );
}
