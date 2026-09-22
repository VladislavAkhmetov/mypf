"use client";

import { useSyncExternalStore } from "react";
import {
  SolitaireState,
  dealSolitaire,
  validateSolitaireState,
  cloneState,
} from "@/lib/xp/solitaire-deck";
import {
  GameState,
  DifficultyLevel,
  initGame,
} from "@/lib/xp/minesweeper-game";

// Storage Keys
const SOLITAIRE_STORAGE_KEY = "amazi.games.solitaire.v1";
const MINESWEEPER_STORAGE_KEY = "amazi.games.minesweeper.v1";
const PREFERENCES_STORAGE_KEY = "amazi.games.preferences.v1";

// --- Preferences ---
export interface GamePreferences {
  effectsMode: "full" | "reduced";
  allowQuestionMarks: boolean;
}

const DEFAULT_PREFERENCES: GamePreferences = {
  effectsMode: "full",
  allowQuestionMarks: false,
};

let currentPreferences: GamePreferences = DEFAULT_PREFERENCES;
const preferenceListeners = new Set<() => void>();

function loadPreferences(): GamePreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch {}
  return DEFAULT_PREFERENCES;
}

export function getGamePreferences(): GamePreferences {
  return currentPreferences;
}

export function updateGamePreferences(updates: Partial<GamePreferences>) {
  currentPreferences = { ...currentPreferences, ...updates };
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(currentPreferences));
    }
  } catch {}
  preferenceListeners.forEach((l) => l());
}

export function useGamePreferences(): GamePreferences {
  return useSyncExternalStore(
    (notify) => {
      preferenceListeners.add(notify);
      return () => preferenceListeners.delete(notify);
    },
    () => currentPreferences,
    () => DEFAULT_PREFERENCES
  );
}

// --- Solitaire Session ---
export interface SolitaireSession {
  sessionId: string;
  state: SolitaireState;
  history: SolitaireState[];
  elapsedSeconds: number;
  hasStarted: boolean;
  isPaused: boolean;
}

let solitaireSession: SolitaireSession = {
  sessionId: "init-solitaire",
  state: dealSolitaire(),
  history: [],
  elapsedSeconds: 0,
  hasStarted: false,
  isPaused: false,
};

const solitaireListeners = new Set<() => void>();

function notifySolitaire() {
  solitaireListeners.forEach((l) => l());
  saveSolitaireToStorage();
}

function saveSolitaireToStorage() {
  if (typeof window === "undefined") return;
  try {
    // Only store recent 50 history steps to conserve storage quota
    const trimmedHistory = solitaireSession.history.slice(-50);
    const payload = {
      schemaVersion: 1,
      sessionId: solitaireSession.sessionId,
      state: solitaireSession.state,
      history: trimmedHistory,
      elapsedSeconds: solitaireSession.elapsedSeconds,
      hasStarted: solitaireSession.hasStarted,
    };
    window.localStorage.setItem(SOLITAIRE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Gracefully ignore quota errors
  }
}

function loadSolitaireFromStorage(): SolitaireSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SOLITAIRE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.schemaVersion === 1 && parsed.state && validateSolitaireState(parsed.state)) {
      return {
        sessionId: parsed.sessionId || Math.random().toString(36).slice(2),
        state: parsed.state,
        history: Array.isArray(parsed.history) ? parsed.history : [],
        elapsedSeconds: typeof parsed.elapsedSeconds === "number" ? parsed.elapsedSeconds : 0,
        hasStarted: !!parsed.hasStarted,
        isPaused: false,
      };
    }
  } catch {}
  return null;
}

export const solitaireStore = {
  getSnapshot(): SolitaireSession {
    return solitaireSession;
  },

  startNewGame() {
    solitaireSession = {
      sessionId: Math.random().toString(36).slice(2),
      state: dealSolitaire(),
      history: [],
      elapsedSeconds: 0,
      hasStarted: false,
      isPaused: false,
    };
    notifySolitaire();
  },

  applyState(nextState: SolitaireState, isUndo = false) {
    const nextHistory = isUndo
      ? solitaireSession.history
      : [...solitaireSession.history, cloneState(solitaireSession.state)];
    solitaireSession = {
      ...solitaireSession,
      history: nextHistory,
      state: nextState,
      hasStarted: true,
    };
    notifySolitaire();
  },

  undo() {
    if (solitaireSession.history.length === 0) return;
    const nextHistory = [...solitaireSession.history];
    const prevState = nextHistory.pop()!;
    solitaireSession = {
      ...solitaireSession,
      history: nextHistory,
      state: prevState,
    };
    notifySolitaire();
  },

  setPaused(paused: boolean) {
    solitaireSession = {
      ...solitaireSession,
      isPaused: paused,
    };
    notifySolitaire();
  },

  tickTimer() {
    if (
      solitaireSession.hasStarted &&
      !solitaireSession.isPaused &&
      !solitaireSession.state.isWon
    ) {
      solitaireSession = {
        ...solitaireSession,
        elapsedSeconds: Math.min(9999, solitaireSession.elapsedSeconds + 1),
      };
      notifySolitaire();
    }
  },
};

export function useSolitaireSession(): SolitaireSession {
  return useSyncExternalStore(
    (notify) => {
      solitaireListeners.add(notify);
      return () => solitaireListeners.delete(notify);
    },
    () => solitaireStore.getSnapshot(),
    () => solitaireSession
  );
}

// --- Minesweeper Session ---
export interface MinesweeperSession {
  sessionId: string;
  state: GameState;
  difficulty: DifficultyLevel;
  elapsedSeconds: number;
  hasStarted: boolean;
  isPaused: boolean;
  highScores: Record<DifficultyLevel, number | null>;
}

const DEFAULT_HIGH_SCORES: Record<DifficultyLevel, number | null> = {
  sprint: null,
  beginner: null,
  intermediate: null,
  expert: null,
};

let minesweeperSession: MinesweeperSession = {
  sessionId: "init-minesweeper",
  state: initGame("beginner"),
  difficulty: "beginner",
  elapsedSeconds: 0,
  hasStarted: false,
  isPaused: false,
  highScores: DEFAULT_HIGH_SCORES,
};

const minesweeperListeners = new Set<() => void>();

function notifyMinesweeper() {
  minesweeperListeners.forEach((l) => l());
  saveMinesweeperToStorage();
}

function saveMinesweeperToStorage() {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      schemaVersion: 1,
      sessionId: minesweeperSession.sessionId,
      state: minesweeperSession.state,
      difficulty: minesweeperSession.difficulty,
      elapsedSeconds: minesweeperSession.elapsedSeconds,
      hasStarted: minesweeperSession.hasStarted,
      highScores: minesweeperSession.highScores,
    };
    window.localStorage.setItem(MINESWEEPER_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

function loadMinesweeperFromStorage(): MinesweeperSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MINESWEEPER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.schemaVersion === 1 && parsed.state && parsed.difficulty) {
      return {
        sessionId: parsed.sessionId || Math.random().toString(36).slice(2),
        state: parsed.state,
        difficulty: parsed.difficulty,
        elapsedSeconds: typeof parsed.elapsedSeconds === "number" ? parsed.elapsedSeconds : 0,
        hasStarted: !!parsed.hasStarted,
        isPaused: false,
        highScores: parsed.highScores || DEFAULT_HIGH_SCORES,
      };
    }
  } catch {}
  return null;
}

export const minesweeperStore = {
  getSnapshot(): MinesweeperSession {
    return minesweeperSession;
  },

  startNewGame(difficulty: DifficultyLevel = minesweeperSession.difficulty) {
    minesweeperSession = {
      ...minesweeperSession,
      sessionId: Math.random().toString(36).slice(2),
      state: initGame(difficulty),
      difficulty,
      elapsedSeconds: 0,
      hasStarted: false,
      isPaused: false,
    };
    notifyMinesweeper();
  },

  applyState(nextState: GameState) {
    let nextHighScores = minesweeperSession.highScores;
    if (nextState.status === "won") {
      const currentRecord = minesweeperSession.highScores[minesweeperSession.difficulty];
      const time = minesweeperSession.elapsedSeconds;
      if (currentRecord === null || time < currentRecord) {
        nextHighScores = {
          ...minesweeperSession.highScores,
          [minesweeperSession.difficulty]: time,
        };
      }
    }

    minesweeperSession = {
      ...minesweeperSession,
      state: nextState,
      hasStarted: minesweeperSession.hasStarted || nextState.firstClickMade,
      highScores: nextHighScores,
    };
    notifyMinesweeper();
  },

  setPaused(paused: boolean) {
    minesweeperSession = {
      ...minesweeperSession,
      isPaused: paused,
    };
    notifyMinesweeper();
  },

  tickTimer() {
    if (
      minesweeperSession.hasStarted &&
      !minesweeperSession.isPaused &&
      minesweeperSession.state.status === "playing"
    ) {
      minesweeperSession = {
        ...minesweeperSession,
        elapsedSeconds: Math.min(999, minesweeperSession.elapsedSeconds + 1),
      };
      notifyMinesweeper();
    }
  },
};

export function useMinesweeperSession(): MinesweeperSession {
  return useSyncExternalStore(
    (notify) => {
      minesweeperListeners.add(notify);
      return () => minesweeperListeners.delete(notify);
    },
    () => minesweeperStore.getSnapshot(),
    () => minesweeperSession
  );
}

// Client initialization and global timer interval
if (typeof window !== "undefined") {
  currentPreferences = loadPreferences();

  const savedSolitaire = loadSolitaireFromStorage();
  if (savedSolitaire) {
    solitaireSession = savedSolitaire;
  }

  const savedMinesweeper = loadMinesweeperFromStorage();
  if (savedMinesweeper) {
    minesweeperSession = savedMinesweeper;
  }

  // Active monotonic timer running once a second
  window.setInterval(() => {
    solitaireStore.tickTimer();
    minesweeperStore.tickTimer();
  }, 1000);

  // Auto-pause when tab is hidden
  document.addEventListener("visibilitychange", () => {
    const isHidden = document.hidden;
    solitaireStore.setPaused(isHidden);
    minesweeperStore.setPaused(isHidden);
  });
}
