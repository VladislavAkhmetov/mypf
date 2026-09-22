import { DifficultyLevel } from "@/lib/xp/minesweeper-game";

export interface MinesweeperRecord {
  id: string;
  rank?: number;
  name: string;
  seconds: number;
  date: string;
  isUser?: boolean;
}

export interface SolitaireRecord {
  id: string;
  rank?: number;
  name: string;
  score: number;
  moves: number;
  seconds: number;
  date: string;
  isUser?: boolean;
}

const MINESWEEPER_STORAGE_KEY = "amazi.games.minesweeper.leaderboards.v2";
const SOLITAIRE_STORAGE_KEY = "amazi.games.solitaire.leaderboards.v2";
const PLAYER_NAME_KEY = "amazi.games.player_name.v2";

const DEFAULT_PLAYER_NAME = "Игрок XP";

const DEFAULT_MINESWEEPER_RECORDS: Record<DifficultyLevel, MinesweeperRecord[]> = {
  sprint: [
    { id: "sp-1", name: "Neo_Matrix", seconds: 4, date: "2003-04-12" },
    { id: "sp-2", name: "WinXP_Fan", seconds: 6, date: "2004-08-21" },
    { id: "sp-3", name: "CyberAdmin", seconds: 8, date: "2005-02-14" },
    { id: "sp-4", name: "QuakeGod", seconds: 10, date: "2006-05-30" },
    { id: "sp-5", name: "DialUp_Hero", seconds: 12, date: "2007-11-09" },
    { id: "sp-6", name: "ICQ_User", seconds: 15, date: "2008-01-25" },
    { id: "sp-7", name: "Chip_Dip", seconds: 18, date: "2009-09-17" },
  ],
  beginner: [
    { id: "bg-1", name: "QuakeGod", seconds: 7, date: "2002-11-04" },
    { id: "bg-2", name: "Neo_Matrix", seconds: 10, date: "2003-06-18" },
    { id: "bg-3", name: "WinXP_Fan", seconds: 14, date: "2004-09-22" },
    { id: "bg-4", name: "Vasya_Pupkin", seconds: 18, date: "2005-12-01" },
    { id: "bg-5", name: "DialUp_Hero", seconds: 24, date: "2007-03-15" },
    { id: "bg-6", name: "TotalCommander", seconds: 30, date: "2008-07-20" },
    { id: "bg-7", name: "ClippyFriend", seconds: 38, date: "2010-10-10" },
  ],
  intermediate: [
    { id: "in-1", name: "Neo_Matrix", seconds: 39, date: "2003-08-11" },
    { id: "in-2", name: "CyberAdmin", seconds: 48, date: "2004-12-05" },
    { id: "in-3", name: "WinXP_Fan", seconds: 62, date: "2005-03-19" },
    { id: "in-4", name: "HalfLife_Pro", seconds: 76, date: "2006-09-27" },
    { id: "in-5", name: "Vasya_Pupkin", seconds: 94, date: "2007-04-14" },
    { id: "in-6", name: "TotalCommander", seconds: 118, date: "2008-06-02" },
    { id: "in-7", name: "WinAmp_Lover", seconds: 145, date: "2010-01-18" },
  ],
  expert: [
    { id: "ex-1", name: "Neo_Matrix", seconds: 115, date: "2003-09-01" },
    { id: "ex-2", name: "CyberAdmin", seconds: 142, date: "2004-10-17" },
    { id: "ex-3", name: "QuakeGod", seconds: 168, date: "2005-07-23" },
    { id: "ex-4", name: "TotalCommander", seconds: 198, date: "2006-11-30" },
    { id: "ex-5", name: "WinXP_Fan", seconds: 235, date: "2007-08-08" },
    { id: "ex-6", name: "Vasya_Pupkin", seconds: 285, date: "2008-12-19" },
    { id: "ex-7", name: "WinAmp_Lover", seconds: 340, date: "2011-04-05" },
  ],
};

const DEFAULT_SOLITAIRE_RECORDS: SolitaireRecord[] = [
  { id: "sol-1", name: "Lady_Solitaire", score: 8450, moves: 82, seconds: 105, date: "2003-05-18" },
  { id: "sol-2", name: "Neo_Matrix", score: 7800, moves: 94, seconds: 130, date: "2004-01-29" },
  { id: "sol-3", name: "RoyalFlush_XP", score: 7150, moves: 106, seconds: 158, date: "2005-04-12" },
  { id: "sol-4", name: "WinXP_Fan", score: 6400, moves: 118, seconds: 185, date: "2006-08-07" },
  { id: "sol-5", name: "TotalCommander", score: 5850, moves: 132, seconds: 212, date: "2007-10-23" },
  { id: "sol-6", name: "Vasya_Pupkin", score: 5200, moves: 145, seconds: 250, date: "2008-12-09" },
  { id: "sol-7", name: "Solitaire_Master", score: 4600, moves: 160, seconds: 295, date: "2010-06-14" },
];

const memoryStorage: Record<string, string> = {};

function storageGetItem(key: string): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStorage[key] || null;
    }
  }
  return memoryStorage[key] || null;
}

function storageSetItem(key: string, value: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  }
  memoryStorage[key] = value;
}

function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

// --- Player Name ---
export function getSavedPlayerName(): string {
  try {
    return storageGetItem(PLAYER_NAME_KEY) || DEFAULT_PLAYER_NAME;
  } catch {
    return DEFAULT_PLAYER_NAME;
  }
}

export function setSavedPlayerName(name: string): void {
  const trimmed = name.trim() || DEFAULT_PLAYER_NAME;
  storageSetItem(PLAYER_NAME_KEY, trimmed);
}

// --- Minesweeper Leaderboard ---
export function getMinesweeperLeaderboard(difficulty: DifficultyLevel): MinesweeperRecord[] {
  try {
    const raw = storageGetItem(MINESWEEPER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[difficulty] && Array.isArray(parsed[difficulty])) {
        return parsed[difficulty].map((r: MinesweeperRecord, i: number) => ({ ...r, rank: i + 1 }));
      }
    }
  } catch {}

  return DEFAULT_MINESWEEPER_RECORDS[difficulty].map((r, i) => ({ ...r, rank: i + 1 }));
}

export function isMinesweeperHighScore(difficulty: DifficultyLevel, seconds: number): boolean {
  if (seconds <= 0) return false;
  const current = getMinesweeperLeaderboard(difficulty);
  if (current.length < 10) return true;
  return seconds < current[current.length - 1].seconds;
}

export function addMinesweeperScore(
  difficulty: DifficultyLevel,
  name: string,
  seconds: number
): { record: MinesweeperRecord; rank: number } {
  const current = getMinesweeperLeaderboard(difficulty);
  const cleanName = name.trim() || DEFAULT_PLAYER_NAME;
  setSavedPlayerName(cleanName);

  const newRecord: MinesweeperRecord = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName,
    seconds,
    date: getTodayDateString(),
    isUser: true,
  };

  const updated = [...current, newRecord]
    .sort((a, b) => a.seconds - b.seconds)
    .slice(0, 10);

  const rank = updated.findIndex((r) => r.id === newRecord.id) + 1;

  try {
    const raw = storageGetItem(MINESWEEPER_STORAGE_KEY);
    const allDifficulties = raw ? JSON.parse(raw) : { ...DEFAULT_MINESWEEPER_RECORDS };
    allDifficulties[difficulty] = updated;
    storageSetItem(MINESWEEPER_STORAGE_KEY, JSON.stringify(allDifficulties));
  } catch {}

  return { record: newRecord, rank };
}

export function resetMinesweeperLeaderboard(difficulty?: DifficultyLevel): void {
  try {
    if (difficulty) {
      const raw = storageGetItem(MINESWEEPER_STORAGE_KEY);
      const all = raw ? JSON.parse(raw) : { ...DEFAULT_MINESWEEPER_RECORDS };
      all[difficulty] = DEFAULT_MINESWEEPER_RECORDS[difficulty];
      storageSetItem(MINESWEEPER_STORAGE_KEY, JSON.stringify(all));
    } else {
      storageSetItem(
        MINESWEEPER_STORAGE_KEY,
        JSON.stringify(DEFAULT_MINESWEEPER_RECORDS)
      );
    }
  } catch {}
}

// --- Solitaire Leaderboard ---
export function calculateSolitaireScore(moves: number, seconds: number): number {
  // Base 10,000 points minus time penalty and move penalty
  const timePenalty = seconds * 8;
  const movePenalty = moves * 15;
  return Math.max(100, Math.round(10000 - timePenalty - movePenalty));
}

export function getSolitaireLeaderboard(): SolitaireRecord[] {
  try {
    const raw = storageGetItem(SOLITAIRE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((r: SolitaireRecord, i: number) => ({ ...r, rank: i + 1 }));
      }
    }
  } catch {}

  return DEFAULT_SOLITAIRE_RECORDS.map((r, i) => ({ ...r, rank: i + 1 }));
}

export function isSolitaireHighScore(score: number): boolean {
  if (score <= 0) return false;
  const current = getSolitaireLeaderboard();
  if (current.length < 10) return true;
  return score > current[current.length - 1].score;
}

export function addSolitaireScore(
  name: string,
  score: number,
  moves: number,
  seconds: number
): { record: SolitaireRecord; rank: number } {
  const current = getSolitaireLeaderboard();
  const cleanName = name.trim() || DEFAULT_PLAYER_NAME;
  setSavedPlayerName(cleanName);

  const newRecord: SolitaireRecord = {
    id: `sol-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName,
    score,
    moves,
    seconds,
    date: getTodayDateString(),
    isUser: true,
  };

  const updated = [...current, newRecord]
    .sort((a, b) => b.score - a.score || a.seconds - b.seconds)
    .slice(0, 10);

  const rank = updated.findIndex((r) => r.id === newRecord.id) + 1;

  try {
    storageSetItem(SOLITAIRE_STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return { record: newRecord, rank };
}

export function resetSolitaireLeaderboard(): void {
  try {
    storageSetItem(SOLITAIRE_STORAGE_KEY, JSON.stringify(DEFAULT_SOLITAIRE_RECORDS));
  } catch {}
}
