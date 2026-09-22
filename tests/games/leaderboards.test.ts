import { describe, it, expect, beforeEach } from "vitest";
import {
  getMinesweeperLeaderboard,
  isMinesweeperHighScore,
  addMinesweeperScore,
  resetMinesweeperLeaderboard,
  calculateSolitaireScore,
  getSolitaireLeaderboard,
  isSolitaireHighScore,
  addSolitaireScore,
  resetSolitaireLeaderboard,
  getSavedPlayerName,
  setSavedPlayerName,
} from "@/lib/xp/games/leaderboards";

describe("Games Leaderboards", () => {
  beforeEach(() => {
    // Clear localStorage mocks
    resetMinesweeperLeaderboard();
    resetSolitaireLeaderboard();
  });

  describe("Minesweeper Leaderboard", () => {
    it("returns default records for all difficulties sorted by time", () => {
      const difficulties = ["sprint", "beginner", "intermediate", "expert"] as const;

      for (const diff of difficulties) {
        const board = getMinesweeperLeaderboard(diff);
        expect(board.length).toBeGreaterThanOrEqual(5);
        expect(board.length).toBeLessThanOrEqual(10);

        // Verify rank and ascending time
        for (let i = 0; i < board.length - 1; i++) {
          expect(board[i].seconds).toBeLessThanOrEqual(board[i + 1].seconds);
          expect(board[i].rank).toBe(i + 1);
        }
      }
    });

    it("evaluates high score eligibility accurately", () => {
      expect(isMinesweeperHighScore("beginner", 0)).toBe(false);
      expect(isMinesweeperHighScore("beginner", -5)).toBe(false);

      // 5 seconds should definitely qualify on beginner (top is ~7s)
      expect(isMinesweeperHighScore("beginner", 5)).toBe(true);

      // On sprint, 2 seconds qualifies
      expect(isMinesweeperHighScore("sprint", 2)).toBe(true);
    });

    it("adds a new player score, ranks properly and marks isUser", () => {
      const { record, rank } = addMinesweeperScore("beginner", "TestHero", 5);
      expect(record.name).toBe("TestHero");
      expect(record.seconds).toBe(5);
      expect(record.isUser).toBe(true);
      expect(rank).toBe(1);

      const board = getMinesweeperLeaderboard("beginner");
      expect(board[0].id).toBe(record.id);
      expect(board[0].name).toBe("TestHero");
      expect(board.length).toBeLessThanOrEqual(10);
    });

    it("resets difficulty leaderboard back to initial defaults", () => {
      addMinesweeperScore("sprint", "FastRunner", 1);
      const modified = getMinesweeperLeaderboard("sprint");
      expect(modified[0].name).toBe("FastRunner");

      resetMinesweeperLeaderboard("sprint");
      const restored = getMinesweeperLeaderboard("sprint");
      expect(restored[0].name).not.toBe("FastRunner");
    });
  });

  describe("Solitaire Leaderboard", () => {
    it("returns default records sorted by score descending", () => {
      const board = getSolitaireLeaderboard();
      expect(board.length).toBeGreaterThanOrEqual(5);

      for (let i = 0; i < board.length - 1; i++) {
        expect(board[i].score).toBeGreaterThanOrEqual(board[i + 1].score);
        expect(board[i].rank).toBe(i + 1);
      }
    });

    it("calculates score with time and move penalties", () => {
      const fastScore = calculateSolitaireScore(60, 90);
      const slowScore = calculateSolitaireScore(150, 300);

      expect(fastScore).toBeGreaterThan(slowScore);
      expect(fastScore).toBeGreaterThan(5000);
      expect(slowScore).toBeGreaterThan(0);
    });

    it("evaluates solitaire high score eligibility", () => {
      expect(isSolitaireHighScore(0)).toBe(false);
      expect(isSolitaireHighScore(9999)).toBe(true);
    });

    it("adds a solitaire score and places in leaderboard", () => {
      const { record, rank } = addSolitaireScore("MasterCard", 9500, 70, 80);
      expect(record.name).toBe("MasterCard");
      expect(record.score).toBe(9500);
      expect(record.isUser).toBe(true);
      expect(rank).toBe(1);

      const board = getSolitaireLeaderboard();
      expect(board[0].name).toBe("MasterCard");
    });

    it("resets solitaire leaderboard back to default records", () => {
      addSolitaireScore("Champ", 15000, 50, 50);
      expect(getSolitaireLeaderboard()[0].name).toBe("Champ");

      resetSolitaireLeaderboard();
      expect(getSolitaireLeaderboard()[0].name).not.toBe("Champ");
    });
  });

  describe("Player Name Preference", () => {
    it("stores and retrieves player name with fallback", () => {
      setSavedPlayerName("GamerXP_2026");
      expect(getSavedPlayerName()).toBe("GamerXP_2026");

      setSavedPlayerName("   ");
      expect(getSavedPlayerName()).toBe("Игрок XP");
    });
  });
});
