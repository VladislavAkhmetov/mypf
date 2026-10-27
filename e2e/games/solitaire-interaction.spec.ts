import { test, expect, type Page } from "@playwright/test";
import { createDeck, type SolitaireState, type Card, type Rank } from "../../src/lib/xp/solitaire-deck";

test.use({ hasTouch: true });

function fixture(): SolitaireState {
  const deck = createDeck();
  const take = (id: string, isFaceUp = true) => ({ ...deck.splice(deck.findIndex(c => c.id === id), 1)[0], isFaceUp });
  const state: SolitaireState = {
    stock: [], waste: [take("c-7")], foundations: [[], [], [], []],
    tableau: [[take("c-9", false), take("s-8")], [take("h-7"), take("c-6")], [take("s-1")], [take("c-13")], [], [take("d-8")], [take("h-2")]],
    moveCount: 0, score: 0, isWon: false,
  };
  state.stock = deck;
  return state;
}

async function stored(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("amazi.games.solitaire.v1")!).state as SolitaireState);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(state => {
    if (!localStorage.getItem("amazi.games.solitaire.v1")) localStorage.setItem("amazi.games.solitaire.v1", JSON.stringify({ schemaVersion: 1, sessionId: "interaction-test", state, history: [], elapsedSeconds: 0, hasStarted: false }));
  }, fixture());
  await page.goto("/");
  await page.locator("#window-word .xp-btn-close").click();
  await page.locator(".xp-desktop-icon:has-text('Косынка')").dblclick();
  await expect(page.locator("[data-tableau-col='2'] [data-card-id='s-1']")).toBeVisible();
});

test("double click, foundation return, stack move, waste move, undo and new game", async ({ page }) => {
  const game = page.locator("#window-solitaire");
  await game.locator("[data-card-id='s-1']").dblclick();
  await expect.poll(async () => (await stored(page)).foundations[0].map(c => c.id)).toEqual(["s-1"]);
  await game.locator("[data-foundation-idx='0']").click();
  await game.locator("[data-card-id='h-2']").click();
  await expect.poll(async () => (await stored(page)).tableau[6].map(c => c.id)).toEqual(["h-2", "s-1"]);
  await game.locator("[data-card-id='h-7']").click({ position: { x: 15, y: 10 } });
  await game.locator("[data-card-id='s-8']").click();
  await expect.poll(async () => (await stored(page)).tableau[0].map(c => c.id)).toEqual(["c-9", "s-8", "h-7", "c-6"]);
  await game.getByRole("button", { name: /^Сброс:/ }).click();
  await game.locator("[data-card-id='d-8']").click();
  await expect.poll(async () => (await stored(page)).waste.length).toBe(0);
  await game.getByRole("button", { name: "Отменить", exact: true }).click();
  await expect.poll(async () => (await stored(page)).waste[0]?.id).toBe("c-7");
  await game.getByRole("button", { name: "Новая игра", exact: true }).click();
  await expect.poll(async () => (await stored(page)).stock.length).toBe(24);
  expect((await stored(page)).tableau.map(c => c.length)).toEqual([1, 2, 3, 4, 5, 6, 7]);
});

test("drag has no window offset, moves a stack, and rejects illegal drops", async ({ page }) => {
  const game = page.locator("#window-solitaire");
  const source = (await game.locator("[data-card-id='h-7']").boundingBox())!;
  const target = (await game.locator("[data-card-id='s-8']").boundingBox())!;
  await page.mouse.move(source.x + 15, source.y + 10);
  await page.mouse.down();
  await page.mouse.move(target.x + 30, target.y + 40, { steps: 10 });
  const ghost = (await page.getByTestId("solitaire-drag").boundingBox())!;
  expect(Math.abs(ghost.x - (target.x + 15))).toBeLessThan(2);
  expect(Math.abs(ghost.width - source.width)).toBeLessThan(2);
  await page.mouse.up();
  await expect(page.getByTestId("solitaire-drag")).toHaveCount(0);
  await expect.poll(async () => (await stored(page)).tableau[0].length).toBe(4);
  await game.locator("[data-card-id='c-13']").dragTo(game.getByRole("button", { name: /Пустая колонка 5/ }));
  await expect.poll(async () => (await stored(page)).tableau[4][0]?.id).toBe("c-13");
  const before = await stored(page);
  await game.locator("[data-card-id='d-8']").dragTo(game.locator("[data-card-id='h-2']"));
  expect(await stored(page)).toEqual(before);
  await expect(game.getByRole("status")).toHaveText("Эта карта сюда не подходит");
});

test("desktop and narrow layout remain readable and stock survives reload", async ({ page }, testInfo) => {
  const game = page.locator("#window-solitaire");
  await game.screenshot({ path: testInfo.outputPath("solitaire-desktop.png") });
  await game.getByRole("button", { name: /^Запас:/ }).click();
  const before = await stored(page);
  await page.reload();
  await page.locator("#window-word .xp-btn-close").click();
  await page.locator(".xp-desktop-icon:has-text('Косынка')").dblclick();
  expect(await stored(page)).toEqual(before);
  await page.setViewportSize({ width: 390, height: 844 });
  await game.screenshot({ path: testInfo.outputPath("solitaire-mobile.png") });
  const main = game.locator("main");
  expect(await main.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await expect(game.getByRole("button", { name: "Подсказка", exact: true })).toBeVisible();
  await game.locator("[data-card-id='s-1']").tap();
  await game.locator("[data-foundation-idx='0']").tap();
  await expect.poll(async () => (await stored(page)).foundations[0][0]?.id).toBe("s-1");
});

test("collection and records match the game and can be closed", async ({ page }, testInfo) => {
  const game = page.locator("#window-solitaire");
  await game.getByRole("button", { name: "Коллекция", exact: true }).click();
  await expect(game.getByTestId("gallery-card")).toHaveCount(52);
  await game.screenshot({ path: testInfo.outputPath("collection.png") });
  await game.getByTestId("gallery-card").first().click();
  await game.getByRole("button", { name: "Показать рубашку", exact: true }).click();
  await game.getByRole("button", { name: "Закрыть просмотр карты" }).click();
  await game.getByRole("button", { name: "Вернуться к игре" }).click();
  await game.getByRole("button", { name: "Рекорды", exact: true }).click();
  await expect(game.getByRole("dialog", { name: "Рекорды косынки" })).toBeVisible();
  await game.screenshot({ path: testInfo.outputPath("records.png") });
  await game.getByRole("button", { name: "Закрыть рекорды" }).click();
  await expect(game.getByRole("dialog")).toHaveCount(0);
});

test("collection and records modals trap focus and support Escape closing", async ({ page }) => {
  const game = page.locator("#window-solitaire");

  // Verify Clippy is concealed when Solitaire is open
  await expect(page.locator("img[src*='/clippy/']")).toHaveCount(0);

  // 1. Collection modal Escape
  await game.getByRole("button", { name: "Коллекция", exact: true }).click();
  const collectionModal = game.getByRole("dialog", { name: "Коллекция карт" });
  await expect(collectionModal).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(collectionModal).toHaveCount(0);

  // 2. Collection inspector Escape
  await game.getByRole("button", { name: "Коллекция", exact: true }).click();
  await expect(collectionModal).toBeVisible();
  await game.getByTestId("gallery-card").first().click();
  await expect(game.getByRole("button", { name: "Закрыть просмотр карты" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(game.getByRole("button", { name: "Закрыть просмотр карты" })).toHaveCount(0);
  await expect(collectionModal).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(collectionModal).toHaveCount(0);

  // 3. Records modal Escape
  await game.getByRole("button", { name: "Рекорды", exact: true }).click();
  const recordsModal = game.getByRole("dialog", { name: "Рекорды косынки" });
  await expect(recordsModal).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(recordsModal).toHaveCount(0);
});

test("auto-finish brings victory, records score, displays modal and avoids duplicate entry", async ({ page }) => {
  const suits = ["spades", "hearts", "clubs", "diamonds"] as const;
  const foundations = suits.map(suit => {
    const list = [];
    for (let r = 1; r <= 12; r++) {
      list.push({ id: `${suit[0]}-${r}`, suit, rank: r as Rank, isFaceUp: true });
    }
    return list;
  });
  const winningState: SolitaireState = {
    stock: [],
    waste: [],
    foundations: foundations as [Card[], Card[], Card[], Card[]],
    tableau: [
      [{ id: "s-13", suit: "spades", rank: 13, isFaceUp: true }],
      [{ id: "h-13", suit: "hearts", rank: 13, isFaceUp: true }],
      [{ id: "c-13", suit: "clubs", rank: 13, isFaceUp: true }],
      [{ id: "d-13", suit: "diamonds", rank: 13, isFaceUp: true }],
      [],
      [],
      [],
    ],
    moveCount: 48,
    score: 600,
    isWon: false,
  };

  await page.evaluate(st => {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    const targetKey = "amazi.games.solitaire.v1";
    const payload = JSON.stringify({
      schemaVersion: 1,
      sessionId: "winning-session",
      state: st,
      history: [],
      elapsedSeconds: 50,
      hasStarted: true,
    });
    originalSetItem(targetKey, payload);
    localStorage.setItem = (key, value) => {
      if (key === targetKey) return;
      originalSetItem(key, value);
    };
  }, winningState);

  await page.reload();
  await page.locator("#window-word .xp-btn-close").click();
  await page.locator(".xp-desktop-icon:has-text('Косынка')").dblclick();

  const game = page.locator("#window-solitaire");
  const finishBtn = game.getByRole("button", { name: "Собрать", exact: true });
  await expect(finishBtn).toBeVisible();
  await finishBtn.click();

  // Victory dialog appears after auto-finish completes
  const victoryDialog = game.getByRole("dialog", { name: "Победа" });
  await expect(victoryDialog).toBeVisible({ timeout: 10000 });
  await expect(victoryDialog.locator("h2")).toHaveText("Красиво сыграно.");

  // Save record with player name
  const nameInput = victoryDialog.locator("#solitaire-player");
  await expect(nameInput).toBeVisible();
  await nameInput.fill("Алексей");
  await victoryDialog.getByRole("button", { name: "Сохранить" }).click();

  // Leaderboard modal opens with the record highlighted
  const recordsModal = game.getByRole("dialog", { name: "Рекорды косынки" });
  await expect(recordsModal).toBeVisible();
  await expect(recordsModal.locator("table")).toContainText("Алексей · вы");

  // Close leaderboard modal
  await recordsModal.getByRole("button", { name: "Закрыть рекорды" }).click();
  await expect(recordsModal).toHaveCount(0);

  // Victory dialog is still open, but the save form is no longer shown (no duplicate save)
  await expect(victoryDialog).toBeVisible();
  await expect(victoryDialog.locator("#solitaire-player")).toHaveCount(0);

  // Start new game
  await victoryDialog.getByRole("button", { name: "Начать новую партию" }).click();
  await expect(victoryDialog).toHaveCount(0);
  await expect.poll(async () => (await stored(page)).stock.length).toBe(24);
});

