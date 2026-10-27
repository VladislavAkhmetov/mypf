import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const SCREENSHOTS_DIR = path.resolve("./e2e/screenshots");

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
});

async function saveScreenshot(page: Page, filename: string, selector: string) {
  await page.locator(selector).screenshot({ path: path.join(SCREENSHOTS_DIR, filename) });
}

test.describe("Atelier Solitaire and Minesweeper Meadow", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => window.localStorage.clear());
    await page.goto("/");
    await page.locator(".xp-taskbar").waitFor({ state: "visible", timeout: 20_000 });
    const wordClose = page.locator("#window-word .xp-btn-close");
    if (await wordClose.isVisible()) {
      await wordClose.click();
    }
  });

  test("Solitaire supports its core controls, collection and window lifecycle", async ({ page }) => {
    await page.locator(".xp-desktop-icon:has-text('Косынка')").dblclick();

    const gameWindow = page.locator("#window-solitaire");
    await expect(gameWindow).toBeVisible({ timeout: 15_000 });
    await expect(gameWindow.getByText("Косынка", { exact: true }).last()).toBeVisible();
    await saveScreenshot(page, "solitaire-atelier-table.png", "#window-solitaire");

    await gameWindow.getByRole("button", { name: "Запас: 24 карт" }).click();
    await expect(gameWindow.getByRole("button", { name: "Запас: 23 карт" })).toBeVisible();
    await expect(gameWindow.getByRole("button", { name: "Отменить" })).toBeEnabled();

    await gameWindow.getByRole("button", { name: "Подсказка" }).click();
    await expect(gameWindow.getByText(/Открыть карту|Переместить|Поднять|Положить/)).toBeVisible();
    await gameWindow.getByRole("button", { name: "Отменить" }).click();
    await expect(gameWindow.getByRole("button", { name: "Запас: 24 карт" })).toBeVisible();

    await gameWindow.getByRole("button", { name: "Коллекция" }).click();
    await expect(gameWindow.getByText("Одна колода. 52 карты.", { exact: true })).toBeVisible();
    await expect(gameWindow.getByTestId("gallery-card")).toHaveCount(52);
    await saveScreenshot(page, "solitaire-atelier-collection.png", "#window-solitaire");

    await gameWindow.getByTestId("gallery-card").first().click();
    await gameWindow.getByRole("button", { name: "Показать рубашку", exact: true }).click();
    await saveScreenshot(page, "solitaire-atelier-card-back.png", "#window-solitaire");
    await gameWindow.getByRole("button", { name: "Закрыть просмотр карты" }).click();
    await gameWindow.getByRole("button", { name: "Вернуться к игре" }).click();

    await gameWindow.locator(".xp-btn-minimize").click();
    await expect(gameWindow).toBeHidden();
    await page.locator(".xp-task-btn:has-text('Косынка')").first().click();
    await expect(gameWindow).toBeVisible();
  });

  test("Minesweeper supports safe opening, flags, scaling and result feedback", async ({ page }) => {
    await page.locator(".xp-desktop-icon:has-text('Сапёр')").dblclick();

    const gameWindow = page.locator("#window-minesweeper");
    await expect(gameWindow).toBeVisible({ timeout: 15_000 });
    await expect(gameWindow.getByRole("grid", { name: "Поле сапёра 9 на 9" })).toBeVisible();
    await saveScreenshot(page, "minesweeper-meadow-board.png", "#window-minesweeper");

    await gameWindow.locator("[data-cell='4,4']").click();
    await expect(gameWindow.getByRole("button", { name: /Открыто:/ }).first()).toBeVisible();
    await saveScreenshot(page, "minesweeper-meadow-cascade.png", "#window-minesweeper");

    const closedCell = gameWindow.getByRole("button", { name: "Закрытая клетка" }).first();
    await closedCell.click({ button: "right" });
    await expect(gameWindow.getByRole("button", { name: "Установлен флаг" })).toBeVisible();

    await gameWindow.getByRole("button", { name: /Эксперт/ }).click();
    await expect(gameWindow.getByRole("grid", { name: "Поле сапёра 30 на 16" })).toBeVisible();
    await gameWindow.getByRole("button", { name: "82%" }).click();
    await saveScreenshot(page, "minesweeper-meadow-expert.png", "#window-minesweeper");

    await gameWindow.getByRole("button", { name: "Начать новую партию" }).click();
    await gameWindow.getByRole("button", { name: /Спринт/ }).click();
    await gameWindow.locator("[data-cell='3,3']").click();

    const resultHeading = gameWindow.getByRole("heading", { name: /Бабах!|Поле очищено/ });
    for (let attempt = 0; attempt < 64 && await resultHeading.count() === 0; attempt += 1) {
      const remaining = gameWindow.getByRole("button", { name: "Закрытая клетка" });
      if (await remaining.count() === 0) break;
      await remaining.first().click();
    }

    await expect(resultHeading).toBeVisible();
    await expect(gameWindow.getByRole("button", { name: "Сыграть ещё раз" })).toBeVisible();
    await saveScreenshot(page, "minesweeper-meadow-result.png", "#window-minesweeper");
  });
});
