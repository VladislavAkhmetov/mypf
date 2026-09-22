"use client";

import { useRef } from "react";
import { NotesFeed } from "./notes-feed";
import { useWindowManager } from "@/components/xp/window-manager-context";
import styles from "./notes-window.module.css";

export function NotesWindow({ noteId }: { noteId?: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const { openNotes, openPortfolio } = useWindowManager();
  return <div className={styles.viewport} ref={viewport} data-notes-viewport><NotesFeed noteId={noteId} scrollContainer={viewport} onOpenNote={id => openNotes({ noteId: id })} onPortfolio={slug => openPortfolio({ projectSlug: slug })} /></div>;
}
