// Pure functional engine for Minesweeper with guaranteed first-click safe opening and chord mechanics

import { getTaskbarHeight } from "./navigation";

export type DifficultyLevel = "beginner" | "intermediate" | "expert" | "sprint";

export interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
  name: string;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, GameConfig> = {
  sprint: { rows: 8, cols: 8, mines: 8, name: "Дизайн-спринт (8×8)" },
  beginner: { rows: 9, cols: 9, mines: 10, name: "Новичок (9×9)" },
  intermediate: { rows: 16, cols: 16, mines: 40, name: "Любитель (16×16)" },
  expert: { rows: 16, cols: 30, mines: 99, name: "Профессионал (16×30)" },
};

export interface MinesweeperWindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MINESWEEPER_WINDOW_PRESETS: Record<DifficultyLevel, { width: number; height: number }> = {
  sprint: { width: 420, height: 550 },
  beginner: { width: 460, height: 590 },
  intermediate: { width: 660, height: 840 },
  expert: { width: 1040, height: 840 },
};

export function getMinesweeperWindowBounds(
  difficulty: DifficultyLevel = "beginner",
  currentBounds?: { x: number; y: number; width: number; height: number }
): MinesweeperWindowBounds {
  const isClient = typeof window !== "undefined";
  const screenW = isClient ? window.innerWidth : 1024;
  const screenH = isClient ? window.innerHeight : 768;
  const taskbarH = getTaskbarHeight();
  const maxAvailableW = Math.max(320, screenW - 20);
  const maxAvailableH = Math.max(380, screenH - taskbarH - 20);

  const preset = MINESWEEPER_WINDOW_PRESETS[difficulty] ?? MINESWEEPER_WINDOW_PRESETS.beginner;
  const targetW = Math.min(preset.width, maxAvailableW);
  const targetH = Math.min(preset.height, maxAvailableH);

  let x: number;
  let y: number;

  if (currentBounds) {
    const centerX = currentBounds.x + currentBounds.width / 2;
    const centerY = currentBounds.y + currentBounds.height / 2;
    x = Math.round(centerX - targetW / 2);
    y = Math.round(centerY - targetH / 2);
  } else {
    x = Math.max(10, Math.round((screenW - targetW) / 2));
    y = Math.max(15, Math.round((screenH - taskbarH - targetH) / 2));
  }

  x = Math.max(10, Math.min(x, screenW - targetW - 10));
  y = Math.max(10, Math.min(y, screenH - taskbarH - targetH - 10));

  return { x, y, width: targetW, height: targetH };
}

export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  isQuestion: boolean;
  neighborMines: number;
  isExploded?: boolean;
  isMisflagged?: boolean; // When lost, flag was placed on non-mine
  bfsDist?: number; // BFS distance from click point for wave animation
}

export type GameStatus = "ready" | "playing" | "won" | "lost";

export interface GameEvent {
  type: "reveal" | "flag" | "chord" | "explode" | "win";
  centerRow?: number;
  centerCol?: number;
  revealedCount?: number;
}

export interface GameState {
  config: GameConfig;
  difficulty: DifficultyLevel;
  grid: Cell[][];
  status: GameStatus;
  minesLeft: number;
  elapsedSeconds: number;
  firstClickMade: boolean;
  lastEvent?: GameEvent;
  revealedWave?: Array<{ row: number; col: number; dist: number }>;
}

export function createEmptyGrid(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        isOpen: false,
        isFlagged: false,
        isQuestion: false,
        neighborMines: 0,
      });
    }
    grid.push(row);
  }
  return grid;
}

export function initGame(
  difficulty: DifficultyLevel = "beginner",
): GameState {
  const config = DIFFICULTY_CONFIGS[difficulty];
  return {
    config,
    difficulty,
    grid: createEmptyGrid(config.rows, config.cols),
    status: "ready",
    minesLeft: config.mines,
    elapsedSeconds: 0,
    firstClickMade: false,
  };
}

// Generate mines ensuring safe opening on (clickRow, clickCol) and its 8 neighbors
export function populateMines(
  grid: Cell[][],
  config: GameConfig,
  clickRow: number,
  clickCol: number,
  rng: () => number = Math.random
): Cell[][] {
  const rows = config.rows;
  const cols = config.cols;
  const newGrid: Cell[][] = grid.map((row) => row.map((cell) => ({ ...cell })));

  // Identify safe zone around first click (center + 8 neighbors)
  const safeCoords = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = clickRow + dr;
      const nc = clickCol + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        safeCoords.add(`${nr},${nc}`);
      }
    }
  }

  // Place mines randomly outside safe zone
  let minesPlaced = 0;
  const totalCells = rows * cols;
  const maxMines = Math.min(config.mines, totalCells - safeCoords.size);

  while (minesPlaced < maxMines) {
    const r = Math.floor(rng() * rows);
    const c = Math.floor(rng() * cols);
    const key = `${r},${c}`;

    if (!safeCoords.has(key) && !newGrid[r][c].isMine) {
      newGrid[r][c].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbor mine counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newGrid[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc].isMine) {
            count++;
          }
        }
      }
      newGrid[r][c].neighborMines = count;
    }
  }

  return newGrid;
}

// Count remaining mines (mines - flags, can be negative)
export function calculateMinesLeft(grid: Cell[][], totalMines: number): number {
  let flagged = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].isFlagged) flagged++;
    }
  }
  return totalMines - flagged;
}

// Open cell with cascading flood fill and BFS wave tracking
export function revealCell(
  state: GameState,
  row: number,
  col: number,
  rng: () => number = Math.random
): GameState {
  if (state.status === "won" || state.status === "lost") return state;
  if (row < 0 || row >= state.config.rows || col < 0 || col >= state.config.cols) return state;

  let currentGrid = state.grid;
  let firstClickMade = state.firstClickMade;
  let status: GameStatus = state.status === "ready" ? "playing" : state.status;

  // First click guaranteed safe initialization
  if (!firstClickMade) {
    currentGrid = populateMines(state.grid, state.config, row, col, rng);
    firstClickMade = true;
    status = "playing";
  }

  const target = currentGrid[row][col];
  if (target.isOpen || target.isFlagged) return state;

  const newGrid: Cell[][] = currentGrid.map((r) => r.map((c) => ({ ...c })));

  // Clicked on a mine: game over
  if (newGrid[row][col].isMine) {
    newGrid[row][col].isExploded = true;
    newGrid[row][col].isOpen = true;

    // Reveal all mines, mark misflagged
    for (let r = 0; r < state.config.rows; r++) {
      for (let c = 0; c < state.config.cols; c++) {
        const cell = newGrid[r][c];
        if (cell.isMine && !cell.isFlagged) {
          cell.isOpen = true;
        } else if (!cell.isMine && cell.isFlagged) {
          cell.isMisflagged = true;
        }
      }
    }

    return {
      ...state,
      grid: newGrid,
      status: "lost",
      firstClickMade,
      lastEvent: { type: "explode", centerRow: row, centerCol: col },
    };
  }

  // Flood fill reveal with BFS wave distances
  const queue: Array<[number, number, number]> = [[row, col, 0]];
  newGrid[row][col].isOpen = true;
  newGrid[row][col].bfsDist = 0;
  const revealedWave: Array<{ row: number; col: number; dist: number }> = [
    { row, col, dist: 0 },
  ];

  while (queue.length > 0) {
    const [currR, currC, dist] = queue.shift()!;
    const currCell = newGrid[currR][currC];

    // If zero neighbor mines, cascade into all unrevealed adjacent cells
    if (currCell.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = currR + dr;
          const nc = currC + dc;
          if (
            nr >= 0 &&
            nr < state.config.rows &&
            nc >= 0 &&
            nc < state.config.cols
          ) {
            const neighbor = newGrid[nr][nc];
            if (!neighbor.isOpen && !neighbor.isFlagged && !neighbor.isMine) {
              neighbor.isOpen = true;
              neighbor.bfsDist = dist + 1;
              revealedWave.push({ row: nr, col: nc, dist: dist + 1 });
              if (neighbor.neighborMines === 0) {
                queue.push([nr, nc, dist + 1]);
              }
            }
          }
        }
      }
    }
  }

  // Check win condition: all non-mine cells opened
  let nonMinesUnopened = 0;
  for (let r = 0; r < state.config.rows; r++) {
    for (let c = 0; c < state.config.cols; c++) {
      if (!newGrid[r][c].isMine && !newGrid[r][c].isOpen) {
        nonMinesUnopened++;
      }
    }
  }

  const isWon = nonMinesUnopened === 0;

  return {
    ...state,
    grid: newGrid,
    status: isWon ? "won" : status,
    firstClickMade,
    revealedWave,
    lastEvent: isWon
      ? { type: "win", centerRow: row, centerCol: col }
      : { type: "reveal", centerRow: row, centerCol: col, revealedCount: revealedWave.length },
  };
}

// Chord action: Clicking an already open cell with numbers
export function chordCell(state: GameState, row: number, col: number): GameState {
  if (state.status !== "playing") return state;
  const cell = state.grid[row][col];
  if (!cell.isOpen || cell.neighborMines === 0) return state;

  const rows = state.config.rows;
  const cols = state.config.cols;

  // Count flags around this cell
  let flagCount = 0;
  const closedNeighbors: Array<[number, number]> = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const neighbor = state.grid[nr][nc];
        if (neighbor.isFlagged) {
          flagCount++;
        } else if (!neighbor.isOpen) {
          closedNeighbors.push([nr, nc]);
        }
      }
    }
  }

  // Only perform chord if flag count matches neighbor mines exactly
  if (flagCount !== cell.neighborMines || closedNeighbors.length === 0) {
    return state;
  }

  // Check if any closed neighbor is a mine (misplaced flags!)
  let hitMine: [number, number] | null = null;
  for (const [nr, nc] of closedNeighbors) {
    if (state.grid[nr][nc].isMine) {
      hitMine = [nr, nc];
      break;
    }
  }

  if (hitMine) {
    // Boom! Explode hit mine and end game
    const [mineR, mineC] = hitMine;
    const newGrid: Cell[][] = state.grid.map((r) => r.map((c) => ({ ...c })));
    newGrid[mineR][mineC].isExploded = true;
    newGrid[mineR][mineC].isOpen = true;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cCell = newGrid[r][c];
        if (cCell.isMine && !cCell.isFlagged) {
          cCell.isOpen = true;
        } else if (!cCell.isMine && cCell.isFlagged) {
          cCell.isMisflagged = true;
        }
      }
    }

    return {
      ...state,
      grid: newGrid,
      status: "lost",
      lastEvent: { type: "explode", centerRow: mineR, centerCol: mineC },
    };
  }

  // Safe chord: reveal all closed neighbors with cascade
  let nextState = state;
  for (const [nr, nc] of closedNeighbors) {
    nextState = revealCell(nextState, nr, nc);
    if (nextState.status === "lost") break;
  }

  return {
    ...nextState,
    lastEvent: nextState.status === "won"
      ? { type: "win", centerRow: row, centerCol: col }
      : { type: "chord", centerRow: row, centerCol: col },
  };
}

// Toggle flag / question mark
export function toggleFlagCell(
  state: GameState,
  row: number,
  col: number,
  allowQuestion = false
): GameState {
  if (state.status === "won" || state.status === "lost") return state;
  if (row < 0 || row >= state.config.rows || col < 0 || col >= state.config.cols) return state;

  const target = state.grid[row][col];
  if (target.isOpen) return state;

  const newGrid: Cell[][] = state.grid.map((r) => r.map((c) => ({ ...c })));
  const cell = newGrid[row][col];

  if (!cell.isFlagged && !cell.isQuestion) {
    cell.isFlagged = true;
  } else if (cell.isFlagged) {
    cell.isFlagged = false;
    if (allowQuestion) {
      cell.isQuestion = true;
    }
  } else {
    cell.isQuestion = false;
  }

  const minesLeft = calculateMinesLeft(newGrid, state.config.mines);

  return {
    ...state,
    grid: newGrid,
    minesLeft,
    lastEvent: { type: "flag", centerRow: row, centerCol: col },
  };
}
