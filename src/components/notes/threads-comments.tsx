"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  type NoteComment,
  addComment,
  isThreadsApiEnabled,
  toggleCommentLike,
} from "@/lib/notes/threads-store";
import styles from "./threads-comments.module.css";

function formatCommentDate(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return "только что";
    if (diffMin < 60) return `${diffMin}м`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}ч`;
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

const AVATAR_COLORS = [
  "#1e3a8a",
  "#14532d",
  "#701a75",
  "#7c2d12",
  "#312e81",
  "#064e3b",
  "#831843",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function ThreadsComments({
  noteId,
  comments,
  onCommentAdded,
}: {
  noteId: string;
  comments: NoteComment[];
  onCommentAdded?: () => void;
}) {
  const [authorName, setAuthorName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("amazi-commenter-name") || "";
    }
    return "";
  });
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const nameToSave = authorName.trim() || "Гость";
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("amazi-commenter-name", nameToSave);
      } catch {
        // ignore
      }
    }

    addComment(noteId, nameToSave, text);
    setText("");
    setIsSubmitting(false);
    onCommentAdded?.();
  };

  return (
    <div className={styles.commentsContainer}>
      {/* Existing Comments List with beUI style spring entrance */}
      <div className={styles.commentsList}>
        <AnimatePresence initial={false}>
          {comments.map((comment, idx) => {
            const isLast = idx === comments.length - 1;
            const letter = (comment.authorName[0] || "Г").toUpperCase();
            return (
              <motion.div
                key={comment.id}
                layout="position"
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={styles.commentItem}
              >
                <div className={styles.avatarColumn}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={styles.commentAvatar}
                    style={{ backgroundColor: getAvatarColor(comment.authorName) }}
                  >
                    {letter}
                  </motion.div>
                  {!isLast && <div className={styles.commentLine} />}
                </div>

                <div className={styles.commentContent}>
                  <div className={styles.commentHeader}>
                    <span className={styles.authorName}>{comment.authorName}</span>
                    {comment.authorHandle && (
                      <span className={styles.authorHandle}>@{comment.authorHandle}</span>
                    )}
                    <span className={styles.dot}>·</span>
                    <time className={styles.commentTime} dateTime={comment.createdAt}>
                      {formatCommentDate(comment.createdAt)}
                    </time>
                    {comment.pending && <span className={styles.pendingBadge}>на модерации</span>}
                  </div>

                  <p className={styles.commentText}>{comment.text}</p>

                  <div className={styles.commentActions}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.85 }}
                      className={`${styles.commentLikeBtn} ${
                        comment.liked ? styles.commentLiked : ""
                      }`}
                      onClick={() => toggleCommentLike(noteId, comment.id)}
                      aria-label="Лайк комментария"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={comment.liked ? "#ff3040" : "none"}
                        stroke={comment.liked ? "#ff3040" : "currentColor"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Reply Input Form with iOS fluid feedback */}
      <form onSubmit={handleSubmit} className={styles.replyForm}>
        <div className={styles.replyAvatarCol}>
          <div
            className={styles.commentAvatar}
            style={{ backgroundColor: getAvatarColor(authorName || "В") }}
          >
            {(authorName[0] || "В").toUpperCase()}
          </div>
        </div>

        <div className={styles.replyInputCol}>
          <div className={styles.replyTopRow}>
            <input
              type="text"
              placeholder="Ваше имя (или «Гость»)"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              className={styles.nameInput}
              maxLength={40}
            />
          </div>

          <textarea
            placeholder="Ответить в тред..."
            value={text}
            onChange={e => setText(e.target.value)}
            className={styles.textArea}
            rows={2}
            maxLength={1000}
            required
            onKeyDown={e => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e);
              }
            }}
          />

          <div className={styles.replyBottomRow}>
            <span className={styles.shortcutHint}>
              {isThreadsApiEnabled ? "Появится после модерации · Ctrl + Enter" : "Ctrl + Enter"}
            </span>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              disabled={!text.trim() || isSubmitting}
              className={styles.submitBtn}
            >
              Отправить
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
