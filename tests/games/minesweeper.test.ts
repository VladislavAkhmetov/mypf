import { describe, it, expect } from "vitest";
import {
  initGame,
  revealCell,
  toggleFlagCell,
  chordCell,
  DIFFICULTY_CONFIGS,
  DifficultyLevel,
} from "@/lib/xp/minesweeper-game";

describe("Minesweeper Pulse Pure Engine", () => {
  it("supports all 4 difficulty levels with exact dimensions and mine counts", () => {
    const levels: DifficultyLevel[] = ["sprint", "beginner", "intermediate", "expert"];
    for (const lvl of levels) {
      const state = initGame(lvl);
      const conf = DIFFICULTY_CONFIGS[lvl];
      expect(state.config.rows).toBe(conf.rows);
      expect(state.config.cols).toBe(conf.cols);
      expect(state.config.mines).toBe(conf.mines);
      expect(state.minesLeft).toBe(conf.mines);
      expect(state.grid.length).toBe(conf.rows);
      expect(state.grid[0].length).toBe(conf.cols);
      expect(state.status).toBe("ready");
      expect(state.firstClickMade).toBe(false);
    }
  });

  it("guarantees first-click safe opening (cell and 8 neighbors have 0 mines)", () => {
    const state = initGame("beginner");
    const clickR = 4;
    const clickC = 4;

    const nextState = revealCell(state, clickR, clickC);
    expect(nextState.status).toBe("playing");
    expect(nextState.firstClickMade).toBe(true);

    // Clicked cell must have 0 neighbor mines and be open
    expect(nextState.grid[clickR][clickC].isOpen).toBe(true);
    expect(nextState.grid[clickR][clickC].isMine).toBe(false);
    expect(nextState.grid[clickR][clickC].neighborMines).toBe(0);

    // All 8 neighbors must be safe and open as part of cascade
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = clickR + dr;
        const nc = clickC + dc;
        expect(nextState.grid[nr][nc].isMine).toBe(false);
        expect(nextState.grid[nr][nc].isOpen).toBe(true);
      }
    }
  });

  it("calculates BFS wave distance for cascaded cells", () => {
    const state = initGame("beginner");
    const nextState = revealCell(state, 0, 0);
    expect(nextState.revealedWave).toBeDefined();
    expect(nextState.revealedWave!.length).toBeGreaterThan(0);
    expect(nextState.revealedWave![0]).toEqual({ row: 0, col: 0, dist: 0 });
  });

  it("handles flags and calculates negative minesLeft when overflagged", () => {
    let state = initGame("sprint"); // 8 mines
    expect(state.minesLeft).toBe(8);

    // Flag 9 cells
    for (let i = 0; i < 9; i++) {
      state = toggleFlagCell(state, 0, i % 8);
    }
    // With toggle: row 0 col 0 was toggled twice (flag then unflag)
    // Let's test distinct cells
    let fresh = initGame("sprint");
    for (let c = 0; c < 8; c++) {
      fresh = toggleFlagCell(fresh, 0, c);
    }
    fresh = toggleFlagCell(fresh, 1, 0); // 9th flag
    expect(fresh.minesLeft).toBe(-1); // 8 - 9 = -1
  });

  it("executes safe chord correctly when flags match neighbor mines", () => {
    // Manually create custom grid for deterministic test
    const state = initGame("beginner");
    state.firstClickMade = true;
    state.status = "playing";

    // Setup:
    // (1,1) has 1 mine at (0,0)
    // (0,0) is mine, flagged
    // (0,1) is open with neighborMines = 1
    // (0,2) is safe and closed
    state.grid[0][0].isMine = true;
    state.grid[0][0].isFlagged = true;
    state.grid[0][1].isOpen = true;
    state.grid[0][1].neighborMines = 1;
    state.grid[0][2].isMine = false;
    state.grid[0][2].isOpen = false;

    // Chord on (0,1): flags count around (0,1) is 1. Matches neighborMines = 1!
    const chorded = chordCell(state, 0, 1);
    expect(chorded.grid[0][2].isOpen).toBe(true);
  });

  it("explodes and marks misflagged cells on bad chord", () => {
    const state = initGame("beginner");
    state.firstClickMade = true;
    state.status = "playing";

    // Cell (0,1) has 1 neighbor mine, which is at (0,0).
    // But user incorrectly flagged (0,2) instead of (0,0)!
    state.grid[0][0].isMine = true;
    state.grid[0][0].isFlagged = false;
    state.grid[0][0].isOpen = false;

    state.grid[0][1].isOpen = true;
    state.grid[0][1].neighborMines = 1;

    state.grid[0][2].isMine = false;
    state.grid[0][2].isFlagged = true; // Incorrect flag

    const chorded = chordCell(state, 0, 1);
    expect(chorded.status).toBe("lost");
    expect(chorded.grid[0][0].isExploded).toBe(true);
    expect(chorded.grid[0][2].isMisflagged).toBe(true);
  });
});
