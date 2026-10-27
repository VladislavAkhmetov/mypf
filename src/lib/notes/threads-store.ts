// Threads store: likes, comments and bookmarks for the notes feed.
//
// Hosting model (static bucket + Yandex Cloud Function + YDB):
// - Seed likes/comments below are a small hand-written baseline so the feed is not empty.
// - When NEXT_PUBLIC_THREADS_API_URL is set at build time, real likes and approved comments
//   are fetched from the Cloud Function (see cloud/threads-api) and added on top of the seed.
// - Without it (local dev / pure static), everything works per-browser via localStorage.
// - Bookmarks and comment likes are always personal and stay in localStorage.

export interface NoteComment {
  id: string;
  noteId: string;
  authorName: string;
  authorHandle?: string;
  avatar?: string;
  text: string;
  createdAt: string;
  likesCount: number;
  liked?: boolean;
  /** Own comment that is waiting for moderation (visible only to its author). */
  pending?: boolean;
}

export interface ThreadsState {
  likedNoteIds: string[];
  noteLikeCounts: Record<string, number>;
  savedNoteIds: string[];
  comments: Record<string, NoteComment[]>;
}

const SEED_LIKE_COUNTS: Record<string, number> = {
  "portfolio-in-progress": 5,
  "small-tools": 4,
  "unfinished": 1,
  "kora-process": 6,
  "city-notes": 2,
  "start": 3,
};

const SEED_COMMENTS: NoteComment[] = [
  {
    id: "seed-pip-1",
    noteId: "portfolio-in-progress",
    authorName: "Дима",
    text: "Залип в сапёра минут на двадцать. Кейсы посмотрю завтра, честно.",
    createdAt: "2026-09-22T13:40:00+03:00",
    likesCount: 2,
  },
  {
    id: "seed-kora-1",
    noteId: "kora-process",
    authorName: "Лена",
    text: "А Кору где-нибудь можно потрогать? Хочется набрать пару строк самой.",
    createdAt: "2026-09-09T14:30:00+03:00",
    likesCount: 1,
  },
];

export const THREADS_API_URL = (process.env.NEXT_PUBLIC_THREADS_API_URL || "").trim();
export const isThreadsApiEnabled = THREADS_API_URL.length > 0;

const STORAGE_KEY = "amazi-threads-v3";
const PREVIOUS_STORAGE_KEY = "amazi-threads-v2";
// Legacy key kept in sync for older builds and tests.
const LEGACY_STORAGE_KEY = "amazi-notes-marks-v1";

type LocalState = {
  likedNoteIds: string[];
  savedNoteIds: string[];
  likedCommentIds: string[];
  ownComments: NoteComment[];
};

const emptyLocal = (): LocalState => ({ likedNoteIds: [], savedNoteIds: [], likedCommentIds: [], ownComments: [] });

function readStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readJson(key: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function readLocal(): LocalState {
  if (typeof window === "undefined") return emptyLocal();
  try {
    const current = readJson(STORAGE_KEY);
    const previous = readJson(PREVIOUS_STORAGE_KEY);
    const legacy = readJson(LEGACY_STORAGE_KEY);
    const ownComments = Array.isArray(current.ownComments)
      ? (current.ownComments as NoteComment[]).filter(c => c && typeof c.id === "string" && typeof c.noteId === "string" && typeof c.text === "string")
      : [];
    return {
      likedNoteIds: Array.from(new Set([...readStrings(current.likedNoteIds), ...readStrings(previous.likedNoteIds), ...readStrings(legacy.liked)])),
      savedNoteIds: Array.from(new Set([...readStrings(current.savedNoteIds), ...readStrings(previous.savedNoteIds), ...readStrings(legacy.saved)])),
      likedCommentIds: readStrings(current.likedCommentIds),
      ownComments,
    };
  } catch {
    return emptyLocal();
  }
}

function writeLocal(state: LocalState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ liked: state.likedNoteIds, saved: state.savedNoteIds }));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
}

let local: LocalState = readLocal();
let remoteLikes: Record<string, number> = {};
let remoteComments: NoteComment[] = [];

function buildState(): ThreadsState {
  const noteLikeCounts: Record<string, number> = {};
  const noteIds = new Set([...Object.keys(SEED_LIKE_COUNTS), ...Object.keys(remoteLikes), ...local.likedNoteIds]);
  for (const id of noteIds) {
    const base = (SEED_LIKE_COUNTS[id] ?? 0) + (remoteLikes[id] ?? 0);
    // With the API, own likes are already part of the remote counter (optimistically applied).
    noteLikeCounts[id] = base + (!isThreadsApiEnabled && local.likedNoteIds.includes(id) ? 1 : 0);
  }

  const comments: Record<string, NoteComment[]> = {};
  const seen = new Set<string>();
  const remoteIds = new Set(remoteComments.map(c => c.id));
  const all = [
    ...SEED_COMMENTS,
    ...remoteComments,
    // Own comments: hidden once the server returns them as approved.
    ...local.ownComments.filter(c => !remoteIds.has(c.id)),
  ];
  for (const comment of all) {
    if (seen.has(comment.id)) continue;
    seen.add(comment.id);
    const liked = local.likedCommentIds.includes(comment.id);
    (comments[comment.noteId] ||= []).push({ ...comment, liked, likesCount: comment.likesCount + (liked ? 1 : 0) });
  }
  for (const list of Object.values(comments)) list.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

  return { likedNoteIds: local.likedNoteIds, savedNoteIds: local.savedNoteIds, noteLikeCounts, comments };
}

type Listener = (state: ThreadsState) => void;
const listeners = new Set<Listener>();
let currentState: ThreadsState = buildState();

function commit(nextLocal: LocalState = local): void {
  local = nextLocal;
  writeLocal(local);
  currentState = buildState();
  for (const listener of listeners) listener(currentState);
}

/** @deprecated Kept for compatibility; state is persisted automatically. */
export function saveState(state: ThreadsState): void {
  commit({ ...local, likedNoteIds: state.likedNoteIds, savedNoteIds: state.savedNoteIds });
}

// ---------- Remote API (Yandex Cloud Function) ----------

type RemoteComment = { id: string; note: string; author: string; body: string; created: string };

async function callApi<T>(payload?: Record<string, unknown>): Promise<T> {
  // text/plain keeps this a "simple" CORS request, so no preflight is needed.
  const response = await fetch(THREADS_API_URL, payload
    ? { method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(payload) }
    : { method: "GET" });
  if (!response.ok) throw new Error(`Threads API ${response.status}`);
  return response.json() as Promise<T>;
}

function fromRemote(comment: RemoteComment): NoteComment {
  return { id: comment.id, noteId: comment.note, authorName: comment.author, text: comment.body, createdAt: comment.created, likesCount: 0 };
}

let syncPromise: Promise<void> | null = null;

/** Loads real likes and approved comments once per page load. Safe to call repeatedly. */
export function syncThreadsFromRemote(): Promise<void> {
  if (!isThreadsApiEnabled || typeof window === "undefined") return Promise.resolve();
  syncPromise ||= callApi<{ likes?: Record<string, number>; comments?: RemoteComment[] }>()
    .then(data => {
      remoteLikes = data.likes && typeof data.likes === "object" ? data.likes : {};
      remoteComments = Array.isArray(data.comments) ? data.comments.map(fromRemote) : [];
      const approved = new Set(remoteComments.map(c => c.id));
      // Drop local copies of own comments that are now published.
      commit({ ...local, ownComments: local.ownComments.filter(c => !approved.has(c.id)) });
    })
    .catch(error => {
      console.warn("Threads API is unavailable, showing local data", error);
    });
  return syncPromise;
}

// ---------- Public actions ----------

export function subscribeToThreadsState(listener: Listener): () => void {
  listeners.add(listener);
  void syncThreadsFromRemote();
  return () => {
    listeners.delete(listener);
  };
}

export function getThreadsState(): ThreadsState {
  return currentState;
}

export function toggleNoteLike(noteId: string): { isLiked: boolean; count: number } {
  const isLiked = local.likedNoteIds.includes(noteId);
  const delta = isLiked ? -1 : 1;
  if (isThreadsApiEnabled) {
    remoteLikes = { ...remoteLikes, [noteId]: Math.max(0, (remoteLikes[noteId] ?? 0) + delta) };
    void callApi<{ likes?: number }>({ action: "like", note: noteId, delta }).catch(error => {
      console.warn("Could not sync like", error);
    });
  }
  commit({
    ...local,
    likedNoteIds: isLiked ? local.likedNoteIds.filter(id => id !== noteId) : [...local.likedNoteIds, noteId],
  });
  return { isLiked: !isLiked, count: currentState.noteLikeCounts[noteId] ?? 0 };
}

export function toggleNoteSaved(noteId: string): boolean {
  const isSaved = local.savedNoteIds.includes(noteId);
  commit({
    ...local,
    savedNoteIds: isSaved ? local.savedNoteIds.filter(id => id !== noteId) : [...local.savedNoteIds, noteId],
  });
  return !isSaved;
}

export function addComment(noteId: string, authorName: string, text: string): NoteComment {
  const cleanName = authorName.trim().slice(0, 40) || "Гость";
  const cleanText = text.trim().slice(0, 1000);
  const comment: NoteComment = {
    id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    noteId,
    authorName: cleanName,
    text: cleanText,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    pending: isThreadsApiEnabled,
  };
  commit({ ...local, ownComments: [...local.ownComments, comment] });

  if (isThreadsApiEnabled) {
    void callApi<{ visible?: boolean }>({ action: "comment", id: comment.id, note: noteId, author: cleanName, body: cleanText })
      .then(result => {
        if (result.visible) {
          commit({ ...local, ownComments: local.ownComments.map(c => (c.id === comment.id ? { ...c, pending: false } : c)) });
        }
      })
      .catch(error => {
        console.warn("Could not send comment", error);
      });
  }
  return comment;
}

export function toggleCommentLike(noteId: string, commentId: string): { isLiked: boolean; count: number } {
  const isLiked = local.likedCommentIds.includes(commentId);
  commit({
    ...local,
    likedCommentIds: isLiked ? local.likedCommentIds.filter(id => id !== commentId) : [...local.likedCommentIds, commentId],
  });
  const comment = currentState.comments[noteId]?.find(c => c.id === commentId);
  return { isLiked: !isLiked, count: comment?.likesCount ?? 0 };
}
