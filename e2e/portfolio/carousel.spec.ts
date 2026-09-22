import { test, expect } from "@playwright/test";

test.describe("Portfolio landing", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.goto("/?view=portfolio");
  });

  test("Center emphasis, wheel, arrows, keyboard boundaries and case navigation", async ({ page }) => {
    const portfolio = page.locator("#window-portfolio");
    const slider = portfolio.getByRole("region", { name: "Лента проектов" });
    const active = portfolio.locator('[data-project-card][data-active="true"]');
    await expect(active).toContainText("Kora");
    const widths = await slider.locator("[data-project-card]").evaluateAll(cards =>
      cards.slice(0, 3).map(card => card.getBoundingClientRect().width)
    );
    expect(widths[1]).toBeGreaterThan(widths[0] * 1.15);

    await slider.hover();
    const initial = await slider.evaluate(el => el.scrollLeft);
    // Small wheel steps must not snap back and make the carousel feel stuck.
    await page.mouse.wheel(0, 80);
    await expect.poll(() => slider.evaluate(el => el.scrollLeft)).toBeGreaterThan(initial);
    await page.mouse.wheel(0, 260);
    await expect(active).toContainText("Signalatlas");
    await portfolio.getByRole("button", { name: "Следующие проекты" }).click();
    await expect(active).toContainText("Noclip");
    await portfolio.getByRole("button", { name: "Предыдущие проекты" }).click();
    await expect(active).toContainText("Signalatlas");
    await active.getByRole("button").click();
    await expect(portfolio.getByRole("heading", { name: "Signalatlas", exact: true })).toBeVisible();
    await portfolio.getByRole("button", { name: "Назад к каталогу" }).click();
    await expect(portfolio.locator("h1")).toContainText("Влад Ахметов");

    await slider.focus();
    await page.keyboard.press("End");
    await expect(portfolio.getByRole("button", { name: "Следующие проекты" })).toBeDisabled();
    await expect.poll(() => slider.evaluate(el => el.scrollWidth - el.clientWidth - el.scrollLeft)).toBeLessThanOrEqual(2);
    await slider.hover();
    const viewport = portfolio.locator('[class*="contentViewport"]');
    const top = await viewport.evaluate(el => el.scrollTop);
    await page.mouse.wheel(0, 180);
    await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBeGreaterThan(top);
    await slider.focus();
    await page.keyboard.press("Home");
    await expect(portfolio.getByRole("button", { name: "Предыдущие проекты" })).toBeDisabled();
  });

  test("Inner scroll reveals the intro; reduced motion keeps it readable", async ({ page }) => {
    const viewport = page.locator('#window-portfolio [class*="contentViewport"]');
    const word = page.locator("[data-word]").last();
    await expect.poll(() => word.evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(1);
    const before = await word.evaluate(el => Number(getComputedStyle(el).opacity));
    await viewport.evaluate(el => { el.scrollTop = 150; });
    await expect.poll(() => word.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(before);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await viewport.evaluate(el => { el.scrollTop = 0; });
    await expect(word).toHaveCSS("opacity", "1");
  });

  test("Tools open their own pages; PrintForge opens its case", async ({ page }) => {
    const portfolio = page.locator("#window-portfolio");
    await portfolio.locator("#portfolio-tools-title").scrollIntoViewIfNeeded();
    const tool = portfolio.getByRole("button", { name: /Auto-Bézier Kern/ });
    await tool.click();
    await expect(portfolio.getByRole("heading", { level: 1 })).toHaveText("Auto-Bézier Kern");
    await expect(page).toHaveURL(/tool=auto-bezier-kern/);
    await portfolio.getByRole("button", { name: "Назад к каталогу" }).click();
    await expect(tool).toBeInViewport();
    await portfolio.getByRole("button", { name: "Подробнее о PrintForge" }).click();
    await expect(page).toHaveURL(/project=printforge/);
  });

  test("Mouse dragging does not open a case; mobile fits the window", async ({ page }) => {
    const slider = page.getByRole("region", { name: "Лента проектов" });
    await slider.scrollIntoViewIfNeeded();
    const bounds = (await slider.boundingBox())!;
    const before = await slider.evaluate(el => el.scrollLeft);
    await page.mouse.move(bounds.x + bounds.width * .6, bounds.y + bounds.height * .45);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width * .25, bounds.y + bounds.height * .45, { steps: 12 });
    await page.mouse.up();
    await expect(page).not.toHaveURL(/project=/);
    await expect.poll(() => slider.evaluate(el => el.scrollLeft)).toBeGreaterThan(before);
    await page.setViewportSize({ width: 390, height: 844 });
    const viewport = page.locator('#window-portfolio [class*="contentViewport"]');
    await expect.poll(() => viewport.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
    await page.locator("#window-portfolio #portfolio-tools-title").scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "Подробнее о PrintForge" })).toBeInViewport();
    await expect.poll(() => viewport.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  });
});
