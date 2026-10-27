// Threads Store & Storage Layer
// Manages likes, comments and user interactions with local persistence and backend-ready adapter

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
}

export interface ThreadsState {
  likedNoteIds: string[];
  noteLikeCounts: Record<string, number>;
  savedNoteIds: string[];
  comments: Record<string, NoteComment[]>;
}

// Initial seed like counts to give an authentic Threads feel
const SEED_LIKE_COUNTS: Record<string, number> = {
  "portfolio-in-progress": 28,
  "small-tools": 19,
  "unfinished": 14,
  "kora-process": 35,
  "city-notes": 22,
  "start": 41,
};

// Initial seed comments for notes
const SEED_COMMENTS: Record<string, NoteComment[]> = {
  "portfolio-in-progress": [
    {
      id: "c-pip-1",
      noteId: "portfolio-in-progress",
      authorName: "Денис Марков",
      authorHandle: "denism",
      text: "Очень крутой подход с показом процесса. Портфолио в виде ОС вообще пушка 🔥",
      createdAt: "2026-09-22T13:40:00+03:00",
      likesCount: 5,
    },
    {
      id: "c-pip-2",
      noteId: "portfolio-in-progress",
      authorName: "Алина",
      authorHandle: "alina_design",
      text: "Зонт на обложке создаёт особое настроение. Ждём новые посты!",
      createdAt: "2026-09-22T15:10:00+03:00",
      likesCount: 2,
    },
  ],
  "kora-process": [
    {
      id: "c-kora-1",
      noteId: "kora-process",
      authorName: "Михаил Ч.",
      authorHandle: "mch",
      text: "Шрифтовая пластика просто восторг. Особенно в крупном кегле.",
      createdAt: "2026-09-09T14:30:00+03:00",
      likesCount: 8,
    },
  ],
  "city-notes": [
    {
      id: "c-city-1",
      noteId: "city-notes",
      authorName: "Артур",
      authorHandle: "arthur_v",
      text: "Ереван по типографике — это отдельный музей под открытым небом.",
      createdAt: "2026-09-04T20:15:00+03:00",
      likesCount: 4,
    },
  ],
};

const STORAGE_KEY = "amazi-threads-v2";
// Legacy key to maintain compatibility with existing tests
const LEGACY_STORAGE_KEY = "amazi-notes-marks-v1";

function readInitialState(): ThreadsState {
  if (typeof window === "undefined") {
    return {
      likedNoteIds: [],
      noteLikeCounts: { ...SEED_LIKE_COUNTS },
      savedNoteIds: [],
      comments: { ...SEED_COMMENTS },
    };
  }

  try {
    let legacyLiked: string[] = [];
    let legacySaved: string[] = [];
    try {
      const leg = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "{}");
      if (Array.isArray(leg?.liked)) legacyLiked = leg.liked;
      if (Array.isArray(leg?.saved)) legacySaved = leg.saved;
    } catch {
      // ignore
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {
        likedNoteIds: legacyLiked,
        noteLikeCounts: { ...SEED_LIKE_COUNTS },
        savedNoteIds: legacySaved,
        comments: { ...SEED_COMMENTS },
      };
    }

    const parsed = JSON.parse(saved);
    return {
      likedNoteIds: Array.from(new Set([...(parsed.likedNoteIds || []), ...legacyLiked])),
      noteLikeCounts: { ...SEED_LIKE_COUNTS, ...(parsed.noteLikeCounts || {}) },
      savedNoteIds: Array.from(new Set([...(parsed.savedNoteIds || []), ...legacySaved])),
      comments: { ...SEED_COMMENTS, ...(parsed.comments || {}) },
    };
  } catch {
    return {
      likedNoteIds: [],
      noteLikeCounts: { ...SEED_LIKE_COUNTS },
      savedNoteIds: [],
      comments: { ...SEED_COMMENTS },
    };
  }
}

export function saveState(state: ThreadsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // sync legacy marks for backwards compatibility
    localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({ liked: state.likedNoteIds, saved: state.savedNoteIds })
    );
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
}

type Listener = (state: ThreadsState) => void;
const listeners = new Set<Listener>();

let currentState: ThreadsState = readInitialState();

export function subscribeToThreadsState(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  for (const listener of listeners) {
    listener(currentState);
  }
}

export function getThreadsState(): ThreadsState {
  if (typeof window !== "undefined" && currentState.likedNoteIds.length === 0 && currentState.savedNoteIds.length === 0) {
    // re-read on mount if needed
    currentState = readInitialState();
  }
  return currentState;
}

export function toggleNoteLike(noteId: string): { isLiked: boolean; count: number } {
  const isLiked = currentState.likedNoteIds.includes(noteId);
  const nextLiked = isLiked
    ? currentState.likedNoteIds.filter(id => id !== noteId)
    : [...currentState.likedNoteIds, noteId];

  const currentCount = currentState.noteLikeCounts[noteId] ?? (SEED_LIKE_COUNTS[noteId] || 0);
  const nextCount = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1;

  currentState = {
    ...currentState,
    likedNoteIds: nextLiked,
    noteLikeCounts: {
      ...currentState.noteLikeCounts,
      [noteId]: nextCount,
    },
  };

  saveState(currentState);
  notify();
  return { isLiked: !isLiked, count: nextCount };
}

export function toggleNoteSaved(noteId: string): boolean {
  const isSaved = currentState.savedNoteIds.includes(noteId);
  const nextSaved = isSaved
    ? currentState.savedNoteIds.filter(id => id !== noteId)
    : [...currentState.savedNoteIds, noteId];

  currentState = {
    ...currentState,
    savedNoteIds: nextSaved,
  };

  saveState(currentState);
  notify();
  return !isSaved;
}

export function addComment(
  noteId: string,
  authorName: string,
  text: string
): NoteComment {
  const cleanName = authorName.trim() || "Гость";
  const cleanText = text.trim();

  const newComment: NoteComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    noteId,
    authorName: cleanName,
    authorHandle: cleanName.toLowerCase().replace(/\s+/g, "_"),
    text: cleanText,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    liked: false,
  };

  const existing = currentState.comments[noteId] || [];
  currentState = {
    ...currentState,
    comments: {
      ...currentState.comments,
      [noteId]: [...existing, newComment],
    },
  };

  saveState(currentState);
  notify();
  return newComment;
}

export function toggleCommentLike(
  noteId: string,
  commentId: string
): { isLiked: boolean; count: number } {
  const existing = currentState.comments[noteId] || [];
  let updatedIsLiked = false;
  let updatedCount = 0;

  const nextComments = existing.map(c => {
    if (c.id !== commentId) return c;
    const isLiked = !c.liked;
    const count = isLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1);
    updatedIsLiked = isLiked;
    updatedCount = count;
    return {
      ...c,
      liked: isLiked,
      likesCount: count,
    };
  });

  currentState = {
    ...currentState,
    comments: {
      ...currentState.comments,
      [noteId]: nextComments,
    },
  };

  saveState(currentState);
  notify();
  return { isLiked: updatedIsLiked, count: updatedCount };
}
