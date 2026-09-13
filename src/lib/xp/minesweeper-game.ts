// Pure functional engine for Minesweeper with guaranteed first-click safe opening

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

export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  isQuestion: boolean;
  neighborMines: number;
  isExploded?: boolean;
}

export type GameStatus = "ready" | "playing" | "won" | "lost";

export interface GameState {
  config: GameConfig;
  difficulty: DifficultyLevel;
  grid: Cell[][];
  status: GameStatus;
  minesLeft: number;
  elapsedSeconds: number;
  firstClickMade: boolean;
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

export function initGame(difficulty: DifficultyLevel = "beginner"): GameState {
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

// Generate mines ensuring safe opening on (clickRow, clickCol) and its neighbors
export function populateMines(
  grid: Cell[][],
  config: GameConfig,
  clickRow: number,
  clickCol: number
): Cell[][] {
  const rows = config.rows;
  const cols = config.cols;
  const newGrid: Cell[][] = grid.map((row) => row.map((cell) => ({ ...cell })));

  // Identify safe zone around first click
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
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
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

// Open cell with cascading flood fill
export function revealCell(state: GameState, row: number, col: number): GameState {
  if (state.status === "won" || state.status === "lost") return state;

  let currentGrid = state.grid;
  let firstClickMade = state.firstClickMade;
  let status: GameStatus = state.status === "ready" ? "playing" : state.status;

  // First click guaranteed safe initialization
  if (!firstClickMade) {
    currentGrid = populateMines(state.grid, state.config, row, col);
    firstClickMade = true;
    status = "playing";
  }

  const target = currentGrid[row][col];
  if (target.isOpen || target.isFlagged) return state;

  const newGrid: Cell[][] = currentGrid.map((r) => r.map((c) => ({ ...c })));

  // Clicked on a mine: game over
  if (newGrid[row][col].isMine) {
    newGrid[row][col].isExploded = true;
    // Reveal all mines
    for (let r = 0; r < state.config.rows; r++) {
      for (let c = 0; c < state.config.cols; c++) {
        if (newGrid[r][c].isMine) {
          newGrid[r][c].isOpen = true;
        }
      }
    }
    return {
      ...state,
      grid: newGrid,
      status: "lost",
      firstClickMade,
    };
  }

  // Flood fill reveal
  const queue: Array<[number, number]> = [[row, col]];
  newGrid[row][col].isOpen = true;

  while (queue.length > 0) {
    const [currR, currC] = queue.shift()!;
    const currCell = newGrid[currR][currC];

    // If zero neighbor mines, cascade into all unrevealed adjacent cells
    if (currCell.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
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
              if (neighbor.neighborMines === 0) {
                queue.push([nr, nc]);
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
  };
}

// Toggle flag / question mark
export function toggleFlagCell(state: GameState, row: number, col: number): GameState {
  if (state.status === "won" || state.status === "lost") return state;

  const target = state.grid[row][col];
  if (target.isOpen) return state;

  const newGrid: Cell[][] = state.grid.map((r) => r.map((c) => ({ ...c })));
  let deltaMines = 0;

  const cell = newGrid[row][col];
  if (!cell.isFlagged && !cell.isQuestion) {
    cell.isFlagged = true;
    deltaMines = -1;
  } else if (cell.isFlagged) {
    cell.isFlagged = false;
    cell.isQuestion = true;
    deltaMines = +1;
  } else {
    cell.isQuestion = false;
  }

  return {
    ...state,
    grid: newGrid,
    minesLeft: state.minesLeft + deltaMines,
  };
}
