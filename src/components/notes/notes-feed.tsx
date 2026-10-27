"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { newestNotes, type Note, type NoteMedia } from "@/data/notes";
import { site } from "@/data/site";
import {
  getThreadsState,
  subscribeToThreadsState,
  toggleNoteLike,
  toggleNoteSaved,
  type ThreadsState,
} from "@/lib/notes/threads-store";
import { ThreadsComments } from "./threads-comments";
import styles from "./notes-feed.module.css";

type IconName = "threads" | "home" | "search" | "heart" | "bubble" | "share" | "bookmark" | "dots" | "back";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    threads:
      "M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z",
    home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
    search: "m20 20-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
    heart:
      "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    bubble:
      "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
    share: "m21 3-7 18-4-7-7-4L21 3ZM10 14 21 3",
    bookmark: "M6 3h12v18l-6-4-6 4V3Z",
    dots: "M12 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
    back: "m14 5-7 7 7 7M7 12h14",
  };

  if (name === "threads") {
    return (
      <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.186 24C5.545 24 0 18.577 0 12.064 0 5.424 5.545 0 12.186 0c6.413 0 11.597 4.954 11.792 11.378h-2.585c-.19-5.006-4.237-8.877-9.207-8.877-5.187 0-9.479 4.19-9.479 9.563 0 5.372 4.292 9.563 9.479 9.563 4.15 0 7.42-2.736 8.363-6.495H12.14v-2.476h10.985c.19 1.109.288 2.247.288 3.413C23.413 18.847 18.397 24 12.186 24z" />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}


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

function pluralizeReplies(count: number): string {
  const rem10 = count % 10;
  const rem100 = count % 100;
  if (rem100 >= 11 && rem100 <= 19) return `${count} ответов`;
  if (rem10 === 1) return `${count} ответ`;
  if (rem10 >= 2 && rem10 <= 4) return `${count} ответа`;
  return `${count} ответов`;
}

function pluralizeLikes(count: number): string {
  const rem10 = count % 10;
  const rem100 = count % 100;
  if (rem100 >= 11 && rem100 <= 19) return `${count} отметок`;
  if (rem10 === 1) return `${count} отметка`;
  if (rem10 >= 2 && rem10 <= 4) return `${count} отметки`;
  return `${count} отметок`;
}

export function NotesFeed({
  noteId,
  scrollContainer,
  onOpenNote,
  onPortfolio,
}: {
  noteId?: string;
  scrollContainer: RefObject<HTMLDivElement | null>;
  onOpenNote: (id?: string) => void;
  onPortfolio: (projectSlug?: string) => void;
}) {
  const [threadsState, setThreadsState] = useState<ThreadsState>(getThreadsState);
  const [tab, setTab] = useState<"all" | "saved">("all");
  const [category, setCategory] = useState("Все");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [media, setMedia] = useState<NoteMedia | null>(null);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [activeMenuNoteId, setActiveMenuNoteId] = useState<string | null>(null);

  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeToThreadsState(setThreadsState);
  }, []);

  const selected = newestNotes.find(note => note.id === noteId);
  const filtered = newestNotes.filter(
    note =>
      (tab !== "saved" || threadsState.savedNoteIds.includes(note.id)) &&
      (category === "Все" || note.category === category) &&
      `${note.text} ${note.category}`.toLocaleLowerCase("ru").includes(query.trim().toLocaleLowerCase("ru"))
  );

  useLayoutEffect(() => {
    const viewport = scrollContainer.current;
    if (viewport) viewport.scrollTo({ top: 0, behavior: "instant" });
  }, [tab, category, query, searchOpen, noteId, scrollContainer]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const viewport = scrollContainer.current;
    if (!viewport) return;
    const measure = () =>
      root.current?.style.setProperty("--notes-viewport-height", `${viewport.clientHeight}px`);
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
    const timer = window.setTimeout(() => setStatus(""), 3500);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (!activeMenuNoteId) return;
    const handleWindowClick = () => setActiveMenuNoteId(null);
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, [activeMenuNoteId]);

  const handleLike = (id: string) => {
    toggleNoteLike(id);
  };

  const handleSave = (id: string) => {
    const isSaved = toggleNoteSaved(id);
    setStatus(isSaved ? "Заметка сохранена" : "Удалено из сохранённых");
  };

  const handleShare = async (id: string) => {
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("view", "notes");
    url.searchParams.set("note", id);
    try {
      await navigator.clipboard.writeText(url.toString());
      setStatus("Ссылка на заметку скопирована");
    } catch {
      setStatus("Не удалось скопировать. Открой заметку и скопируй адрес страницы.");
    }
  };

  const toggleComments = (id: string) => {
    setOpenComments(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const jump = (end: boolean) =>
    scrollContainer.current?.scrollTo({
      top: end ? scrollContainer.current.scrollHeight : 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });

  const gallery = (items?: NoteMedia[]) =>
    items?.length ? (
      <div className={styles.gallery} data-multiple={items.length > 1}>
        {items.map((item, index) =>
          item.type === "video" ? (
            <video
              key={item.src}
              src={item.src}
              poster={item.poster}
              controls
              preload="metadata"
              aria-label={item.alt}
            />
          ) : (
            <button
              type="button"
              key={`${item.src}-${index}`}
              onClick={() => setMedia(item)}
              aria-label={`Увеличить: ${item.alt}`}
            >
              <Image src={item.src} alt={item.alt} width={1000} height={720} unoptimized />
            </button>
          )
        )}
      </div>
    ) : null;

  const renderPost = (note: Note, expanded = false) => {
    const isLiked = threadsState.likedNoteIds.includes(note.id);
    const likeCount = threadsState.noteLikeCounts[note.id] ?? 0;
    const isSaved = threadsState.savedNoteIds.includes(note.id);
    const noteComments = threadsState.comments[note.id] || [];
    const commentsCount = noteComments.length;
    const areCommentsVisible = noteId === note.id || openComments[note.id];
    const hasBranch = !expanded && Boolean(note.continuation?.length);

    return (
      <article
        className={styles.post}
        key={note.id}
        data-note-id={note.id}
        aria-label={`Заметка: ${note.category}`}
      >
        {/* Left column: Avatar and Thread Connector Line */}
        <div className={styles.avatarColumn}>
          <div className={styles.avatarWrapper}>
            <Image
              className={styles.avatar}
              src={site.avatar}
              alt={site.name}
              width={40}
              height={40}
              unoptimized
            />
          </div>
          {(areCommentsVisible || hasBranch) && <div className={styles.threadLine} />}
        </div>

        {/* Right column: Content, Actions, Comments */}
        <div className={styles.postBody}>
          <div className={styles.byline}>
            <div className={styles.authorMeta}>
              <button
                type="button"
                className={styles.timeBtn}
                onClick={() => onOpenNote(note.id)}
                aria-label={`Открыть заметку за ${formatPostDate(note.date)}`}
              >
                <time dateTime={note.date}>{formatPostDate(note.date)}</time>
              </button>
            </div>

            {/* Menu button (···) */}
            <div className={styles.menuContainer}>
              <button
                type="button"
                className={styles.menuBtn}
                onClick={e => {
                  e.stopPropagation();
                  setActiveMenuNoteId(prev => (prev === note.id ? null : note.id));
                }}
                aria-label="Опции заметки"
              >
                <Icon name="dots" />
              </button>

              <AnimatePresence>
                {activeMenuNoteId === note.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -4 }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    className={styles.menuDropdown}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        handleShare(note.id);
                        setActiveMenuNoteId(null);
                      }}
                    >
                      <Icon name="share" />
                      <span>Скопировать ссылку</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSave(note.id);
                        setActiveMenuNoteId(null);
                      }}
                    >
                      <Icon name="bookmark" />
                      <span>{isSaved ? "Удалить из сохранённых" : "Сохранить заметку"}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className={styles.postText}>{note.text}</p>

          {gallery(note.media)}

          {note.projectSlug && (
            <button
              type="button"
              className={styles.projectLink}
              onClick={() => onPortfolio(note.projectSlug)}
            >
              Смотреть проект ↗
            </button>
          )}

          {/* Action Row in authentic Threads style with beUI spring bounce */}
          <div className={styles.actions}>
            {/* 1. Like button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.82 }}
              aria-label="Мне нравится"
              aria-pressed={isLiked}
              className={`${styles.actionBtn} ${styles.likeBtn} ${isLiked ? styles.activeLike : ""}`}
              onClick={() => handleLike(note.id)}
            >
              <motion.span
                animate={isLiked ? { scale: [1, 1.42, 0.94, 1.06, 1] } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className={styles.iconWrapper}
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill={isLiked ? "#ff3040" : "none"}
                  stroke={isLiked ? "#ff3040" : "currentColor"}
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </motion.span>
            </motion.button>

            {/* 2. Comment button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.82 }}
              aria-label="Открыть ветку заметки"
              className={`${styles.actionBtn} ${styles.commentBtn}`}
              onClick={() => toggleComments(note.id)}
            >
              <Icon name="bubble" />
            </motion.button>

            {/* 3. Share button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.82 }}
              aria-label="Скопировать ссылку на заметку"
              className={`${styles.actionBtn} ${styles.shareBtn}`}
              onClick={() => handleShare(note.id)}
            >
              <Icon name="share" />
            </motion.button>

            {/* 4. Bookmark button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.82 }}
              aria-label="Сохранить заметку"
              aria-pressed={isSaved}
              className={`${styles.actionBtn} ${styles.bookmarkBtn} ${isSaved ? styles.activeSave : ""}`}
              onClick={() => handleSave(note.id)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3h12v18l-6-4-6 4V3Z" />
              </svg>
            </motion.button>
          </div>

          {/* Social proof counters row in Threads style */}
          <div className={styles.socialProof}>
            <button
              type="button"
              className={styles.socialSummaryBtn}
              onClick={() => toggleComments(note.id)}
            >
              <div className={styles.miniAvatars}>
                <span className={styles.miniAvatar} style={{ background: "#2b4c7e" }}>
                  Д
                </span>
                <span className={styles.miniAvatar} style={{ background: "#7e3b2b" }}>
                  А
                </span>
              </div>
              <span className={styles.socialText}>
                {pluralizeReplies(commentsCount)} · {pluralizeLikes(likeCount)} «Нравится»
              </span>
            </button>
          </div>

          {/* Continuation prompt if any */}
          {!expanded && note.continuation?.length ? (
            <button
              type="button"
              className={styles.continueLink}
              onClick={() => onOpenNote(note.id)}
            >
              Читать продолжение ветки · {note.continuation.length} ↗
            </button>
          ) : null}

          {/* Interactive Comments Section with iOS-like spring expansion */}
          <AnimatePresence initial={false}>
            {areCommentsVisible && (
              <motion.div
                key="comments-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                style={{ overflow: "hidden" }}
              >
                <ThreadsComments noteId={note.id} comments={noteComments} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </article>
    );
  };

  return (
    <div ref={root} className={styles.notes}>
      {/* Side Navigation Rail */}
      <nav className={styles.sideNav} aria-label="Навигация микроблога">
        <motion.button
          type="button"
          whileHover={{ scale: 1.12, rotate: 6 }}
          whileTap={{ scale: 0.9 }}
          className={styles.monogram}
          onClick={() => {
            setTab("all");
            setCategory("Все");
            setQuery("");
            setSearchOpen(false);
            onOpenNote();
          }}
          aria-label="Все заметки"
        >
          <Icon name="threads" />
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Лента заметок"
          aria-pressed={!noteId && tab === "all"}
          onClick={() => {
            setTab("all");
            setCategory("Все");
            setQuery("");
            setSearchOpen(false);
            onOpenNote();
          }}
        >
          <Icon name="home" />
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Поиск заметок"
          aria-pressed={searchOpen}
          onClick={() => {
            setSearchOpen(value => !value);
            if (noteId) onOpenNote();
          }}
        >
          <Icon name="search" />
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Сохранённые заметки"
          aria-pressed={!noteId && tab === "saved"}
          onClick={() => {
            setTab("saved");
            setCategory("Все");
            setQuery("");
            setSearchOpen(false);
            onOpenNote();
          }}
        >
          <Icon name="bookmark" />
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Вернуться к портфолио"
          onClick={() => onPortfolio()}
        >
          <Icon name="back" />
        </motion.button>
      </nav>

      {/* Main Feed Column */}
      <main className={styles.column}>
        <header className={styles.header}>
          {noteId && (
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => onOpenNote()}
              aria-label="Назад в ленту"
            >
              <Icon name="back" />
            </button>
          )}

          <h1 className={styles.headerTitle}>
            {noteId ? "Ветка" : tab === "saved" ? "Сохранённое" : "Заметки"}
          </h1>

          {!noteId && (
            <button type="button" className={styles.latest} onClick={() => jump(false)}>
              К новым ↑
            </button>
          )}
        </header>

        {searchOpen && !noteId && (
          <div className={styles.search}>
            <Icon name="search" />
            <input
              ref={searchInput}
              type="search"
              aria-label="Найти в заметках"
              placeholder="Найти мысль, тему, проект…"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
            <button
              type="button"
              aria-label="Закрыть поиск"
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Category Tabs in Threads style */}
        {!noteId && (
          <>
            {/* beUI-style Gliding Segmented Pill Tabs */}
            <div className={styles.tabsWrapper} aria-label="Темы заметок">
              <div className={styles.tabList}>
                {["Все", "Проекты", "Путешествия", "Эксперименты"].map(value => {
                  const isActive = category === value;
                  return (
                    <button
                      type="button"
                      key={value}
                      aria-pressed={isActive}
                      onClick={() => setCategory(value)}
                      className={`${styles.tabBtn} ${isActive ? styles.tabActive : ""}`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeCategoryPill"
                          className={styles.activePill}
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span className={styles.tabLabel}>{value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Threads Post List or Branch */}
        {noteId ? (
          selected ? (
            <div className={styles.singleBranch}>
              {renderPost(selected, true)}
              {selected.continuation?.map(item => (
                <article
                  key={item.id}
                  className={`${styles.post} ${styles.continuation}`}
                >
                  <div className={styles.avatarColumn}>
                    <Image
                      className={styles.avatar}
                      src={site.avatar}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                    />
                  </div>
                  <div className={styles.postBody}>
                    <div className={styles.byline}>
                      <div className={styles.authorMeta}>
                        <span className={styles.continuationBadge}>Продолжение</span>
                      </div>
                    </div>
                    <p className={styles.postText}>{item.text}</p>
                    {gallery(item.media)}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <h2>Запись не найдена</h2>
              <p>Возможно, ссылка устарела или запись была удалена.</p>
              <button type="button" onClick={() => onOpenNote()}>
                Открыть все заметки →
              </button>
            </div>
          )
        ) : filtered.length ? (
          <div className={styles.feedList}>{filtered.map(note => renderPost(note))}</div>
        ) : (
          <div className={styles.empty}>
            <Icon name={tab === "saved" ? "bookmark" : "search"} />
            <h2>
              {tab === "saved"
                ? "Здесь будет то, что хочется оставить"
                : "Ничего не нашлось"}
            </h2>
            <p>
              {tab === "saved"
                ? "Нажми на закладку под записью, чтобы сохранить её."
                : "Попробуй другую тему или поисковый запрос."}
            </p>
          </div>
        )}

        <footer className={styles.footer}>
          {!noteId && (
            <button type="button" onClick={() => jump(false)}>
              К началу ↑
            </button>
          )}
        </footer>
      </main>

      {/* iOS Dynamic Island Floating Capsule Notification */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 450, damping: 26 }}
            className={styles.toast}
            role="status"
            aria-live="polite"
          >
            <span className={styles.toastDot} />
            <span>{status}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <dialog
        ref={dialog}
        className={styles.lightbox}
        onCancel={() => setMedia(null)}
        onClose={() => setMedia(null)}
        onClick={event => {
          if (event.target === event.currentTarget) setMedia(null);
        }}
        aria-label="Просмотр изображения"
      >
        <button
          type="button"
          onClick={() => setMedia(null)}
          aria-label="Закрыть изображение"
        >
          ×
        </button>
        {media && (
          <Image src={media.src} alt={media.alt} width={1600} height={1200} unoptimized />
        )}
        <p>{media?.alt}</p>
      </dialog>
    </div>
  );
}
