export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
}

export interface SolitaireState {
  stock: Card[];
  waste: Card[];
  foundations: [Card[], Card[], Card[], Card[]];
  tableau: [Card[], Card[], Card[], Card[], Card[], Card[], Card[]];
  moveCount: number;
  score: number;
  isWon: boolean;
}

export function getSuitColor(suit: Suit): "red" | "black" {
  return suit === "hearts" || suit === "diamonds" ? "red" : "black";
}

export function getRankLabel(rank: Rank): string {
  switch (rank) {
    case 1:
      return "A";
    case 11:
      return "J";
    case 12:
      return "Q";
    case 13:
      return "K";
    default:
      return rank.toString();
  }
}

export function getRankNameRu(rank: Rank): string {
  switch (rank) {
    case 1:
      return "Туз";
    case 11:
      return "Валет";
    case 12:
      return "Дама";
    case 13:
      return "Король";
    default:
      return rank.toString();
  }
}

export function getSuitNameRu(suit: Suit): string {
  switch (suit) {
    case "spades":
      return "Пики";
    case "hearts":
      return "Черви";
    case "diamonds":
      return "Бубны";
    case "clubs":
      return "Трефы";
  }
}

export function createDeck(): Card[] {
  const suits: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
  const deck: Card[] = [];
  suits.forEach((suit) => {
    for (let r = 1; r <= 13; r++) {
      const rank = r as Rank;
      deck.push({
        id: `${suit[0]}-${rank}`,
        suit,
        rank,
        isFaceUp: false,
      });
    }
  });
  return deck;
}

export function shuffleDeck(deck: Card[], rng: () => number = Math.random): Card[] {
  const shuffled = deck.map((c) => ({ ...c }));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealSolitaire(rng: () => number = Math.random): SolitaireState {
  const deck = shuffleDeck(createDeck(), rng);
  const tableau: [Card[], Card[], Card[], Card[], Card[], Card[], Card[]] = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ];

  let cardIdx = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[cardIdx++] };
      card.isFaceUp = row === col; // Only top card is face-up
      tableau[col].push(card);
    }
  }

  const stock = deck.slice(cardIdx).map((c) => ({ ...c, isFaceUp: false }));

  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    moveCount: 0,
    score: 0,
    isWon: false,
  };
}

export function canMoveToFoundation(card: Card, pile: Card[]): boolean {
  if (pile.length === 0) {
    return card.rank === 1; // Ace
  }
  const top = pile[pile.length - 1];
  return top.suit === card.suit && card.rank === top.rank + 1;
}

export function canMoveToTableau(card: Card, column: Card[]): boolean {
  if (column.length === 0) {
    return card.rank === 13; // Only King can fill an empty space
  }
  const top = column[column.length - 1];
  if (!top.isFaceUp) return false;
  return getSuitColor(top.suit) !== getSuitColor(card.suit) && card.rank === top.rank - 1;
}

export function checkWin(foundations: [Card[], Card[], Card[], Card[]]): boolean {
  return foundations.every((pile) => pile.length === 13);
}

// Deep clone helper for state immutability
export function cloneState(state: SolitaireState): SolitaireState {
  return {
    stock: state.stock.map((c) => ({ ...c })),
    waste: state.waste.map((c) => ({ ...c })),
    foundations: [
      state.foundations[0].map((c) => ({ ...c })),
      state.foundations[1].map((c) => ({ ...c })),
      state.foundations[2].map((c) => ({ ...c })),
      state.foundations[3].map((c) => ({ ...c })),
    ],
    tableau: [
      state.tableau[0].map((c) => ({ ...c })),
      state.tableau[1].map((c) => ({ ...c })),
      state.tableau[2].map((c) => ({ ...c })),
      state.tableau[3].map((c) => ({ ...c })),
      state.tableau[4].map((c) => ({ ...c })),
      state.tableau[5].map((c) => ({ ...c })),
      state.tableau[6].map((c) => ({ ...c })),
    ],
    moveCount: state.moveCount,
    score: state.score,
    isWon: state.isWon,
  };
}

export function drawCard(prevState: SolitaireState): SolitaireState {
  // If both stock and waste are empty, zero-action: do not increment moveCount
  if (prevState.stock.length === 0 && prevState.waste.length === 0) {
    return prevState;
  }

  const state = cloneState(prevState);

  if (state.stock.length > 0) {
    const card = state.stock.pop()!;
    card.isFaceUp = true;
    state.waste.push(card);
    state.moveCount += 1;
  } else if (state.waste.length > 0) {
    // Reset stock from waste (pass through stock)
    state.stock = state.waste.reverse().map((c) => ({ ...c, isFaceUp: false }));
    state.waste = [];
    state.score = Math.max(0, state.score - 15);
    state.moveCount += 1;
  }

  return state;
}

export function moveWasteToFoundation(
  prevState: SolitaireState,
  fIdx: number,
): SolitaireState | null {
  if (fIdx < 0 || fIdx > 3 || prevState.waste.length === 0) return null;
  const topWaste = prevState.waste[prevState.waste.length - 1];
  if (!canMoveToFoundation(topWaste, prevState.foundations[fIdx])) return null;

  const state = cloneState(prevState);
  const card = state.waste.pop()!;
  state.foundations[fIdx].push(card);
  state.moveCount += 1;
  state.score += 10;
  state.isWon = checkWin(state.foundations);
  return state;
}

export function moveWasteToTableau(
  prevState: SolitaireState,
  colIdx: number,
): SolitaireState | null {
  if (colIdx < 0 || colIdx > 6 || prevState.waste.length === 0) return null;
  const topWaste = prevState.waste[prevState.waste.length - 1];
  if (!canMoveToTableau(topWaste, prevState.tableau[colIdx])) return null;

  const state = cloneState(prevState);
  const card = state.waste.pop()!;
  state.tableau[colIdx].push(card);
  state.moveCount += 1;
  state.score += 5;
  return state;
}

export function moveTableauToFoundation(
  prevState: SolitaireState,
  fromCol: number,
  fIdx: number,
): SolitaireState | null {
  if (fromCol < 0 || fromCol > 6 || fIdx < 0 || fIdx > 3) return null;
  const col = prevState.tableau[fromCol];
  if (col.length === 0) return null;
  const topCard = col[col.length - 1];
  if (!topCard.isFaceUp) return null;
  if (!canMoveToFoundation(topCard, prevState.foundations[fIdx])) return null;

  const state = cloneState(prevState);
  const card = state.tableau[fromCol].pop()!;
  state.foundations[fIdx].push(card);

  // Flip new top card in fromCol if face down
  const remaining = state.tableau[fromCol];
  if (remaining.length > 0 && !remaining[remaining.length - 1].isFaceUp) {
    remaining[remaining.length - 1].isFaceUp = true;
    state.score += 5;
  }

  state.moveCount += 1;
  state.score += 10;
  state.isWon = checkWin(state.foundations);
  return state;
}

export function moveTableauToTableau(
  prevState: SolitaireState,
  fromCol: number,
  cardIdx: number,
  toCol: number,
): SolitaireState | null {
  if (fromCol < 0 || fromCol > 6 || toCol < 0 || toCol > 6 || fromCol === toCol) return null;
  const sourceCol = prevState.tableau[fromCol];
  if (cardIdx < 0 || cardIdx >= sourceCol.length) return null;
  const movingCard = sourceCol[cardIdx];
  if (!movingCard.isFaceUp) return null;

  const targetCol = prevState.tableau[toCol];
  if (!canMoveToTableau(movingCard, targetCol)) return null;

  const state = cloneState(prevState);
  const movingCards = state.tableau[fromCol].splice(cardIdx);
  state.tableau[toCol].push(...movingCards);

  // Flip newly revealed card in sourceCol
  const remaining = state.tableau[fromCol];
  if (remaining.length > 0 && !remaining[remaining.length - 1].isFaceUp) {
    remaining[remaining.length - 1].isFaceUp = true;
    state.score += 5;
  }

  state.moveCount += 1;
  state.score += 3;
  return state;
}

// Return top foundation card to tableau
export function moveFoundationToTableau(
  prevState: SolitaireState,
  fIdx: number,
  toCol: number,
): SolitaireState | null {
  if (fIdx < 0 || fIdx > 3 || toCol < 0 || toCol > 6) return null;
  const foundation = prevState.foundations[fIdx];
  if (foundation.length === 0) return null;

  const topFoundation = foundation[foundation.length - 1];
  const targetCol = prevState.tableau[toCol];
  if (!canMoveToTableau(topFoundation, targetCol)) return null;

  const state = cloneState(prevState);
  const card = state.foundations[fIdx].pop()!;
  state.tableau[toCol].push(card);
  state.moveCount += 1;
  state.score = Math.max(0, state.score - 10);
  state.isWon = checkWin(state.foundations);
  return state;
}

// Auto-move single card to foundation if eligible
export function tryAutoMoveCardToFoundation(
  prevState: SolitaireState,
  cardId: string,
): SolitaireState | null {
  // Check waste
  if (prevState.waste.length > 0) {
    const topWaste = prevState.waste[prevState.waste.length - 1];
    if (topWaste.id === cardId) {
      for (let f = 0; f < 4; f++) {
        const next = moveWasteToFoundation(prevState, f);
        if (next) return next;
      }
    }
  }

  // Check tableau tops
  for (let c = 0; c < 7; c++) {
    const col = prevState.tableau[c];
    if (col.length > 0) {
      const top = col[col.length - 1];
      if (top.id === cardId && top.isFaceUp) {
        for (let f = 0; f < 4; f++) {
          const next = moveTableauToFoundation(prevState, c, f);
          if (next) return next;
        }
      }
    }
  }

  return null;
}

// Hint engine
export interface HintMove {
  description: string;
  sourceType: "waste" | "tableau" | "stock" | "foundation";
  sourceIndex: number;
  targetType: "foundation" | "tableau" | "stock";
  targetIndex: number;
  cardId?: string;
  cardIndex?: number;
}

export function findHint(state: SolitaireState): HintMove | null {
  // 1. Can waste go to foundation?
  if (state.waste.length > 0) {
    const topWaste = state.waste[state.waste.length - 1];
    for (let f = 0; f < 4; f++) {
      if (canMoveToFoundation(topWaste, state.foundations[f])) {
        return {
          description: `Переместить ${getRankNameRu(topWaste.rank)} (${getSuitNameRu(topWaste.suit)}) из сброса в дом`,
          sourceType: "waste",
          sourceIndex: 0,
          targetType: "foundation",
          targetIndex: f,
          cardId: topWaste.id,
          cardIndex: state.waste.length - 1,
        };
      }
    }
  }

  // 2. Can tableau top go to foundation?
  for (let c = 0; c < 7; c++) {
    const col = state.tableau[c];
    if (col.length > 0) {
      const top = col[col.length - 1];
      if (top.isFaceUp) {
        for (let f = 0; f < 4; f++) {
          if (canMoveToFoundation(top, state.foundations[f])) {
            return {
              description: `Поднять ${getRankNameRu(top.rank)} (${getSuitNameRu(top.suit)}) из колонки ${c + 1} в дом`,
              sourceType: "tableau",
              sourceIndex: c,
              targetType: "foundation",
              targetIndex: f,
              cardId: top.id,
              cardIndex: col.length - 1,
            };
          }
        }
      }
    }
  }

  // 3. Can waste go to tableau?
  if (state.waste.length > 0) {
    const topWaste = state.waste[state.waste.length - 1];
    for (let c = 0; c < 7; c++) {
      if (canMoveToTableau(topWaste, state.tableau[c])) {
        return {
          description: `Положить ${getRankNameRu(topWaste.rank)} из сброса на колонку ${c + 1}`,
          sourceType: "waste",
          sourceIndex: 0,
          targetType: "tableau",
          targetIndex: c,
          cardId: topWaste.id,
          cardIndex: state.waste.length - 1,
        };
      }
    }
  }

  // 4. Can tableau card sequence move to another tableau column?
  for (let from = 0; from < 7; from++) {
    const col = state.tableau[from];
    for (let idx = 0; idx < col.length; idx++) {
      const card = col[idx];
      if (card.isFaceUp) {
        // If moving entire column King to empty space, skip unless it reveals a face-down card
        if (card.rank === 13 && idx === 0) continue;

        for (let to = 0; to < 7; to++) {
          if (from !== to && canMoveToTableau(card, state.tableau[to])) {
            return {
              description: `Переместить ${getRankNameRu(card.rank)} в колонку ${to + 1}`,
              sourceType: "tableau",
              sourceIndex: from,
              targetType: "tableau",
              targetIndex: to,
              cardId: card.id,
              cardIndex: idx,
            };
          }
        }
      }
    }
  }

  // 5. Stock draw available?
  if (state.stock.length > 0 || state.waste.length > 0) {
    return {
      description: "Открыть карту из колоды запаса",
      sourceType: "stock",
      sourceIndex: 0,
      targetType: "stock",
      targetIndex: 0,
    };
  }

  return null;
}

// Auto-finish solver: check if all cards are revealed and simulate moves to victory
export function canAutoFinish(state: SolitaireState): boolean {
  if (state.isWon) return false;
  // Stock and waste must be empty
  if (state.stock.length > 0 || state.waste.length > 0) return false;

  // All cards in tableau must be face-up
  for (let c = 0; c < 7; c++) {
    for (const card of state.tableau[c]) {
      if (!card.isFaceUp) return false;
    }
  }

  // Simulate moves to victory on cloned state
  let sim = cloneState(state);
  let maxSteps = 150;
  while (!sim.isWon && maxSteps-- > 0) {
    let moved = false;
    // Try moving any tableau top to foundation
    for (let c = 0; c < 7; c++) {
      const col = sim.tableau[c];
      if (col.length > 0) {
        for (let f = 0; f < 4; f++) {
          const next = moveTableauToFoundation(sim, c, f);
          if (next) {
            sim = next;
            moved = true;
            break;
          }
        }
        if (moved) break;
      }
    }
    if (!moved) break;
  }

  return sim.isWon;
}

// Execute auto-finish simulation step-by-step
export function getNextAutoFinishMove(state: SolitaireState): { fromCol: number; fIdx: number } | null {
  for (let c = 0; c < 7; c++) {
    const col = state.tableau[c];
    if (col.length > 0) {
      const top = col[col.length - 1];
      for (let f = 0; f < 4; f++) {
        if (canMoveToFoundation(top, state.foundations[f])) {
          return { fromCol: c, fIdx: f };
        }
      }
    }
  }
  return null;
}

// Complete deck invariant validator: exactly 52 unique cards, valid ranks 1..13, suits
export function validateSolitaireState(state: SolitaireState): boolean {
  const cardSet = new Set<string>();
  let totalCards = 0;

  const countCard = (c: Card) => {
    totalCards++;
    cardSet.add(`${c.suit}-${c.rank}`);
  };

  state.stock.forEach(countCard);
  state.waste.forEach(countCard);
  state.foundations.forEach((f) => f.forEach(countCard));
  state.tableau.forEach((col) => col.forEach(countCard));

  return totalCards === 52 && cardSet.size === 52;
}
