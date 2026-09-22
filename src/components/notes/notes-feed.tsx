"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { newestNotes, type Note, type NoteMedia } from "@/data/notes";
import { site } from "@/data/site";
import styles from "./notes-feed.module.css";

type IconName = "home" | "search" | "heart" | "reply" | "share" | "bookmark" | "back";
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
    search: "m20 20-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
    heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
    reply: "M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2v-9.5A8.5 8.5 0 1 1 21 11.5Z",
    share: "m21 3-7 18-4-7-7-4L21 3ZM10 14 21 3",
    bookmark: "M6 3h12v18l-6-4-6 4V3Z",
    back: "m14 5-7 7 7 7M7 12h14",
  };
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

type Marks = { liked: string[]; saved: string[] };
const storageKey = "amazi-notes-marks-v1";
function readMarks(): Marks {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return { liked: Array.isArray(value?.liked) ? value.liked.filter((id: unknown) => typeof id === "string") : [], saved: Array.isArray(value?.saved) ? value.saved.filter((id: unknown) => typeof id === "string") : [] };
  } catch { return { liked: [], saved: [] }; }
}

export function NotesFeed({ noteId, scrollContainer, onOpenNote, onPortfolio }: {
  noteId?: string;
  scrollContainer: RefObject<HTMLDivElement | null>;
  onOpenNote: (id?: string) => void;
  onPortfolio: (projectSlug?: string) => void;
}) {
  const [marks, setMarks] = useState<Marks>(readMarks);
  const [tab, setTab] = useState<"all" | "saved">("all");
  const [category, setCategory] = useState("Все");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [media, setMedia] = useState<NoteMedia | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const selected = newestNotes.find(note => note.id === noteId);
  const filtered = newestNotes.filter(note => (tab !== "saved" || marks.saved.includes(note.id)) && (category === "Все" || note.category === category) && `${note.text} ${note.category}`.toLocaleLowerCase("ru").includes(query.trim().toLocaleLowerCase("ru")));

  useLayoutEffect(() => {
    const viewport = scrollContainer.current;
    if (viewport) viewport.scrollTo({ top: 0, behavior: "instant" });
  }, [tab, category, query, searchOpen, noteId, scrollContainer]);

  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    const viewport = scrollContainer.current;
    if (!viewport) return;
    const measure = () => root.current?.style.setProperty("--notes-viewport-height", `${viewport.clientHeight}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    measure();
    return () => observer.disconnect();
  }, [scrollContainer]);
  useEffect(() => {
    if (media) dialog.current?.showModal();
    else dialog.current?.close();
  }, [media]);
  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(""), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const toggle = (kind: keyof Marks, id: string) => {
    const next = { ...marks, [kind]: marks[kind].includes(id) ? marks[kind].filter(value => value !== id) : [...marks[kind], id] };
    setMarks(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { setStatus("Отметка действует только до закрытия страницы: браузер запретил сохранение."); }
  };
  const share = async (id: string) => {
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("view", "notes");
    url.searchParams.set("note", id);
    try { await navigator.clipboard.writeText(url.toString()); setStatus("Ссылка на заметку скопирована"); }
    catch { setStatus("Не удалось скопировать. Открой заметку и скопируй адрес страницы."); }
  };
  const jump = (end: boolean) => scrollContainer.current?.scrollTo({ top: end ? scrollContainer.current.scrollHeight : 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  const gallery = (items?: NoteMedia[]) => items?.length ? (
    <div className={styles.gallery} data-multiple={items.length > 1}>
      {items.map((item, index) => item.type === "video" ? <video key={item.src} src={item.src} poster={item.poster} controls preload="metadata" aria-label={item.alt} /> : (
        <button type="button" key={`${item.src}-${index}`} onClick={() => setMedia(item)} aria-label={`Увеличить: ${item.alt}`}>
          <Image src={item.src} alt={item.alt} width={1000} height={720} unoptimized />
        </button>
      ))}
    </div>
  ) : null;

  const post = (note: Note, expanded = false) => (
    <article className={styles.post} key={note.id} data-note-id={note.id} aria-label={`Заметка: ${note.category}`}>
      <Image className={styles.avatar} src={site.avatar} alt="" width={42} height={42} unoptimized />
      <div className={styles.postBody}>
        <div className={styles.byline}><strong>{site.name}</strong><span>{note.category}</span><button type="button" onClick={() => onOpenNote(note.id)} aria-label={`Открыть заметку от ${new Date(note.date).toLocaleDateString("ru-RU")}`}><time dateTime={note.date}>{new Date(note.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</time></button></div>
        {note.demo && <span className={styles.demo}>Пример записи</span>}
        <p className={styles.postText}>{note.text}</p>
        {gallery(note.media)}
        {note.projectSlug && <button type="button" className={styles.projectLink} onClick={() => onPortfolio(note.projectSlug)}>Смотреть проект ↗</button>}
        <div className={styles.actions}>
          <button type="button" aria-label="Мне нравится" title="Личная отметка, сохранится в этом браузере" aria-pressed={marks.liked.includes(note.id)} className={styles.like} onClick={() => toggle("liked", note.id)}><Icon name="heart" /></button>
          <button type="button" aria-label="Открыть ветку заметки" onClick={() => onOpenNote(note.id)}><Icon name="reply" />{note.continuation?.length ? <span>{note.continuation.length}</span> : null}</button>
          <button type="button" aria-label="Скопировать ссылку на заметку" onClick={() => share(note.id)}><Icon name="share" /></button>
          <button type="button" aria-label="Сохранить заметку" aria-pressed={marks.saved.includes(note.id)} className={styles.save} onClick={() => toggle("saved", note.id)}><Icon name="bookmark" /></button>
        </div>
        {!expanded && note.continuation?.length ? <button type="button" className={styles.continueLink} onClick={() => onOpenNote(note.id)}>Читать продолжение · {note.continuation.length} ↗</button> : null}
      </div>
    </article>
  );

  return (
    <div ref={root} className={styles.notes}>
      <nav className={styles.sideNav} aria-label="Навигация микроблога">
        <button type="button" className={styles.monogram} onClick={() => { setTab("all"); setCategory("Все"); setQuery(""); setSearchOpen(false); onOpenNote(); }} aria-label="Все заметки">а.</button>
        <button type="button" aria-label="Лента заметок" aria-pressed={!noteId && tab === "all"} onClick={() => { setTab("all"); setCategory("Все"); setQuery(""); setSearchOpen(false); onOpenNote(); }}><Icon name="home" /></button>
        <button type="button" aria-label="Поиск заметок" aria-pressed={searchOpen} onClick={() => { setSearchOpen(value => !value); if (noteId) onOpenNote(); }}><Icon name="search" /></button>
        <button type="button" aria-label="Сохранённые заметки" aria-pressed={!noteId && tab === "saved"} onClick={() => { setTab("saved"); setCategory("Все"); setQuery(""); setSearchOpen(false); onOpenNote(); }}><Icon name="bookmark" /></button>
        <button type="button" aria-label="Вернуться к портфолио" onClick={() => onPortfolio()}><Icon name="back" /></button>
      </nav>
      <main className={styles.column}>
        <header className={styles.header}>
          {noteId ? <button type="button" onClick={() => onOpenNote()} aria-label="Назад в ленту"><Icon name="back" /></button> : <span className={styles.liveDot} aria-hidden="true" />}
          <h1>{noteId ? "Ветка" : tab === "saved" ? "Сохранённое" : "Заметки"}</h1>
          {!noteId && <button type="button" className={styles.latest} onClick={() => jump(false)}>К новым ↑</button>}
        </header>
        {searchOpen && !noteId && <div className={styles.search}><Icon name="search" /><input ref={searchInput} type="search" aria-label="Найти в заметках" placeholder="Найти мысль, место, проект…" value={query} onChange={event => setQuery(event.target.value)} /><button type="button" aria-label="Закрыть поиск" onClick={() => { setSearchOpen(false); setQuery(""); }}>×</button></div>}
        {!noteId && <>
          <section className={styles.profile} aria-label="Автор микроблога">
            <div><h2>{site.name}</h2><span>{site.handle} <span className={styles.profileTag}>личный дневник</span></span><p>Дизайн, код и жизнь между проектами.<br />Показываю не только результат, но и процесс.</p></div>
            <Image src={site.avatar} alt={site.name} width={76} height={76} unoptimized />
          </section>
          <div className={styles.profileLinks}><button type="button" onClick={() => onPortfolio()}>Портфолио ↗</button><a href={site.telegram} target="_blank" rel="noreferrer">Написать мне ↗</a></div>
          <div className={styles.filters} aria-label="Темы заметок">{["Все", "Проекты", "Путешествия", "Эксперименты"].map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div>
          <p className={styles.feedHint}>Новые записи — сверху</p>
        </>}
        {noteId ? selected ? <>
          {post(selected, true)}
          {selected.continuation?.map(item => <article key={item.id} className={`${styles.post} ${styles.continuation}`}><Image className={styles.avatar} src={site.avatar} alt="" width={42} height={42} unoptimized /><div className={styles.postBody}><div className={styles.byline}><strong>{site.name}</strong><span>Продолжение</span></div><p className={styles.postText}>{item.text}</p>{gallery(item.media)}</div></article>)}
          <div className={styles.replyBox}><p>Есть мысль или вопрос?</p><a href={site.telegram} target="_blank" rel="noreferrer"><Icon name="reply" />Ответить автору в Telegram ↗</a><span>Обсуждение — лично, без регистрации на сайте.</span></div>
        </> : <div className={styles.empty}><h2>Запись не найдена</h2><p>Возможно, ссылка устарела.</p><button type="button" onClick={() => onOpenNote()}>Открыть все заметки →</button></div> : filtered.length ? filtered.map(note => post(note)) : <div className={styles.empty}><Icon name={tab === "saved" ? "bookmark" : "search"} /><h2>{tab === "saved" ? "Здесь будет то, что хочется оставить" : "Ничего не нашлось"}</h2><p>{tab === "saved" ? "Нажми на закладку под записью. Она сохранится только в этом браузере." : "Попробуй другую тему или поисковый запрос."}</p></div>}
        <footer className={styles.footer}><span>{noteId ? "Одна мысль — одна ветка." : "Начало истории. Продолжение — наверху."}</span>{!noteId && <button type="button" onClick={() => jump(false)}>К началу ↑</button>}<small>Лайки и закладки — личные, хранятся в этом браузере.</small></footer>
      </main>
      <div className={styles.toast} role="status" aria-live="polite">{status}</div>
      <dialog ref={dialog} className={styles.lightbox} onCancel={() => setMedia(null)} onClose={() => setMedia(null)} onClick={event => { if (event.target === event.currentTarget) setMedia(null); }} aria-label="Просмотр изображения">
        <button type="button" onClick={() => setMedia(null)} aria-label="Закрыть изображение">×</button>
        {media && <Image src={media.src} alt={media.alt} width={1600} height={1200} unoptimized />}
        <p>{media?.alt}</p>
      </dialog>
    </div>
  );
}
