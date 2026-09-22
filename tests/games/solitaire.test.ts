import { describe, it, expect } from "vitest";
import {
  dealSolitaire,
  drawCard,
  moveFoundationToTableau,
  findHint,
  canAutoFinish,
  validateSolitaireState,
  Card,
  Rank,
} from "@/lib/xp/solitaire-deck";

describe("Solitaire Atelier Pure Engine", () => {
  it("initializes a valid 52-card game state", () => {
    const state = dealSolitaire();
    expect(validateSolitaireState(state)).toBe(true);

    // Check tableau layout: col 0 has 1 card, col 6 has 7 cards
    for (let c = 0; c < 7; c++) {
      expect(state.tableau[c].length).toBe(c + 1);
      // Only top card is face-up
      for (let r = 0; r < c; r++) {
        expect(state.tableau[c][r].isFaceUp).toBe(false);
      }
      expect(state.tableau[c][c].isFaceUp).toBe(true);
    }

    // Stock has 52 - 28 = 24 cards
    expect(state.stock.length).toBe(24);
    expect(state.waste.length).toBe(0);
    expect(state.foundations.every((f) => f.length === 0)).toBe(true);
    expect(state.moveCount).toBe(0);
    expect(state.isWon).toBe(false);
  });

  it("does not increment moveCount on zero-action drawCard when stock and waste are empty", () => {
    const state = dealSolitaire();
    state.stock = [];
    state.waste = [];
    state.moveCount = 5;

    const nextState = drawCard(state);
    expect(nextState.moveCount).toBe(5);
    expect(nextState.stock.length).toBe(0);
    expect(nextState.waste.length).toBe(0);
  });

  it("handles waste reset and stock cycling cleanly", () => {
    let state = dealSolitaire();
    const initialStockCount = state.stock.length;

    // Draw all cards
    for (let i = 0; i < initialStockCount; i++) {
      state = drawCard(state);
    }
    expect(state.stock.length).toBe(0);
    expect(state.waste.length).toBe(initialStockCount);

    // Cycling back
    state = drawCard(state);
    expect(state.stock.length).toBe(initialStockCount);
    expect(state.waste.length).toBe(0);
    expect(validateSolitaireState(state)).toBe(true);
  });

  it("supports moving top foundation card back to tableau", () => {
    const state = dealSolitaire();
    // Setup scenario: foundation 0 has Ace of Spades, col 0 has 2 of Hearts
    const aceOfSpades: Card = { id: "s-1", suit: "spades", rank: 1, isFaceUp: true };
    const twoOfHearts: Card = { id: "h-2", suit: "hearts", rank: 2, isFaceUp: true };

    state.foundations[0] = [aceOfSpades];
    state.tableau[0] = [twoOfHearts];

    const nextState = moveFoundationToTableau(state, 0, 0);
    expect(nextState).not.toBeNull();
    expect(nextState!.foundations[0].length).toBe(0);
    expect(nextState!.tableau[0].length).toBe(2);
    expect(nextState!.tableau[0][1].id).toBe("s-1");
  });

  it("provides accurate hint with cardId and columnIndex", () => {
    const state = dealSolitaire();
    // Place Ace of Hearts in waste
    const ace: Card = { id: "h-1", suit: "hearts", rank: 1, isFaceUp: true };
    state.waste = [ace];

    const hint = findHint(state);
    expect(hint).not.toBeNull();
    expect(hint?.targetType).toBe("foundation");
    expect(hint?.cardId).toBe("h-1");
    expect(hint?.cardIndex).toBe(0);
  });

  it("detects and simulates auto-finish when all cards are face-up and winnable", () => {
    const state = dealSolitaire();
    state.stock = [];
    state.waste = [];

    // All foundations filled up to Queen, Kings on tableau
    const suits = ["spades", "hearts", "diamonds", "clubs"] as const;
    suits.forEach((suit, idx) => {
      state.foundations[idx] = [];
      for (let r = 1; r <= 12; r++) {
        state.foundations[idx].push({
          id: `${suit[0]}-${r}`,
          suit,
          rank: r as Rank,
          isFaceUp: true,
        });
      }
    });

    state.tableau = [
      [{ id: "s-13", suit: "spades", rank: 13, isFaceUp: true }],
      [{ id: "h-13", suit: "hearts", rank: 13, isFaceUp: true }],
      [{ id: "d-13", suit: "diamonds", rank: 13, isFaceUp: true }],
      [{ id: "c-13", suit: "clubs", rank: 13, isFaceUp: true }],
      [],
      [],
      [],
    ];

    expect(canAutoFinish(state)).toBe(true);
  });
});
