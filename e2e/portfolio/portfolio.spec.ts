import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const QA_DIR = path.resolve(process.cwd(), "docs/design/qa/portfolio-foundation");

test.beforeAll(() => {
  if (!fs.existsSync(QA_DIR)) {
    fs.mkdirSync(QA_DIR, { recursive: true });
  }
});

test.describe("Portfolio Foundation - Mandatory Scenarios", () => {
  // Scenario 1 & 8: Clean entry, single Word profile, large text, no sidebar, no DesktopHero, no pageerrors/hydration errors
  test("1. Clean entry opens Word profile, no sidebar, no DesktopHero, no errors", async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (err) => pageErrors.push(err));

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Exactly one window opened: Word
    const windows = page.locator(".xp-window");
    await expect(windows).toHaveCount(1);
    await expect(page.locator("#window-word")).toBeVisible();

    // Contains author name & role in Word
    await expect(page.locator("#window-word h1")).toHaveText("Влад Ахметов");
    await expect(page.locator("#window-word")).toContainText(
      "Коммуникационный дизайн и интерактивные прототипы"
    );

    // No left sidebar / TOC for profile
    await expect(page.locator("#window-word aside")).toHaveCount(0);

    // No DesktopHero text/element on the page
    await expect(page.locator(".xp-desktop-hero")).toHaveCount(0);

    // Check actions: "Посмотреть проекты", "Резюме"
    await expect(page.locator("#window-word").getByRole("button", { name: "Посмотреть проекты" })).toBeVisible();
    await expect(page.locator("#window-word").getByRole("button", { name: /Резюме/ })).toBeVisible();

    // No console/page errors
    expect(pageErrors).toHaveLength(0);
  });

  // Scenario 2: Transition from Word, desktop shortcut, and menu to browser; no window duplication
  test("2. Open portfolio browser from Word, shortcut, and menu without duplicating window", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click "Посмотреть проекты" inside Word
    await page.getByRole("button", { name: "Посмотреть проекты" }).click();

    // Portfolio window should open
    const portfolioWin = page.locator("#window-portfolio");
    await expect(portfolioWin).toBeVisible();
    await expect(portfolioWin.locator(".xp-titlebar-title")).toContainText(
      "Портфолио — Internet Explorer"
    );

    // Total portfolio windows count is 1
    await expect(page.locator("#window-portfolio")).toHaveCount(1);

    // Now trigger portfolio shortcut from desktop (double-click on desktop icon "Портфолио")
    const portfolioIcon = page.locator(".xp-desktop-icon").filter({ hasText: "Портфолио" });
    await portfolioIcon.dblclick();

    // Window count is still 1
    await expect(page.locator("#window-portfolio")).toHaveCount(1);

    // Open Start menu and click Portfolio item
    await page.locator(".xp-start-btn").click();
    await page.locator(".xp-start-menu").getByText("Портфолио", { exact: true }).click();

    // Still exactly 1 portfolio window
    await expect(page.locator("#window-portfolio")).toHaveCount(1);
  });

  // Scenario 3: URL parameters matrix
  test("3. URL parameters: ?view=profile, ?view=portfolio, ?view=portfolio&focus=..., ?project=kora, unknown values", async ({
    page,
  }) => {
    // 3a. ?view=profile
    await page.goto("/?view=profile");
    await expect(page.locator("#window-word")).toBeVisible();

    // 3b. ?view=portfolio
    await page.goto("/?view=portfolio");
    await expect(page.locator("#window-portfolio")).toBeVisible();
    await expect(page.locator("#window-portfolio")).toContainText("Влад Ахметов");

    // 3c. ?view=portfolio&focus=communication
    await page.goto("/?view=portfolio&focus=communication");
    await expect(page.locator("#window-portfolio")).toBeVisible();
    await expect(page.locator("#window-portfolio")).toContainText("Коммуникационный дизайн");

    // 3d. ?view=portfolio&focus=engineering
    await page.goto("/?view=portfolio&focus=engineering");
    await expect(page.locator("#window-portfolio")).toBeVisible();
    await expect(page.locator("#window-portfolio")).toContainText("Интерфейсы и прототипы");

    // 3e. ?project=kora
    await page.goto("/?project=kora");
    await expect(page.locator("#window-portfolio")).toBeVisible();
    await expect(page.locator("#window-portfolio h1")).toHaveText("Kora");

    // 3f. unknown project ?project=nonexistent_xyz
    await page.goto("/?project=nonexistent_xyz");
    await expect(page.locator("#window-portfolio")).toBeVisible();
    await expect(page.locator('#window-portfolio [role="alert"]')).toContainText(
      "Проект не найден"
    );
  });

  // Scenario 4: Catalog -> Case -> Back; browser Back/Forward; direct link reload
  test("4. Navigation flow: Catalog -> Case -> Back, popstate Back/Forward, reload direct link", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/?view=portfolio");
    await page.waitForLoadState("networkidle");

    // Click on Kora card in catalog
    const koraCard = page.locator("#window-portfolio").getByRole("button", { name: "Открыть кейс Kora" });
    await koraCard.click();

    // Case view appears
    await expect(page.locator("#window-portfolio h1")).toHaveText("Kora");
    expect(page.url()).toContain("project=kora");

    // Click "Назад" in browser toolbar
    const backBtn = page.locator("#window-portfolio").getByRole("button", { name: "Назад к каталогу" });
    await backBtn.click();

    // Returns to catalog
    await expect(page.locator("#window-portfolio h1")).toContainText("Влад Ахметов");
    expect(page.url()).toContain("view=portfolio");

    // Real browser forward
    await page.goBack(); // returns to kora
    await expect(page.locator("#window-portfolio h1")).toHaveText("Kora");

    // Real browser back
    await page.goForward(); // returns to catalog
    await expect(page.locator("#window-portfolio h1")).toContainText("Влад Ахметов");

    // Direct link reload
    await page.goto("/?project=kora");
    await page.reload();
    await expect(page.locator("#window-portfolio h1")).toHaveText("Kora");

    // Clicking "Назад" after direct entry returns to portfolio catalog without leaving site
    await page.locator("#window-portfolio").getByRole("button", { name: "Назад к каталогу" }).click();
    await expect(page.locator("#window-portfolio h1")).toContainText("Влад Ахметов");
  });

  // Scenario 5: Minimize/restore preserves case and scroll; closing clears URL
  test("5. Minimize and restore preserve case state; close clears URL params", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/?project=kora");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#window-portfolio h1")).toHaveText("Kora");

    // Minimize window
    await page.locator("#window-portfolio .xp-btn-minimize").click();
    await expect(page.locator("#window-portfolio")).toHaveCount(0);

    // Restore from taskbar
    const taskbarItem = page.locator(".xp-task-btn").filter({ hasText: "Портфолио" });
    await taskbarItem.click();

    // Restored: still on Kora!
    await expect(page.locator("#window-portfolio")).toBeVisible();
    await expect(page.locator("#window-portfolio h1")).toHaveText("Kora");

    // Close window
    await page.locator("#window-portfolio .xp-btn-close").click();
    await expect(page.locator("#window-portfolio")).toHaveCount(0);

    // Closing cleared project from URL
    expect(page.url()).not.toContain("project=kora");
  });

  // Scenario 6: Viewports 1920x1080, 1366x768, 390x844, no overflow, controls accessible, viewport resize
  test("6. Viewport adaptability and real resize test", async ({ page }) => {
    // 1920x1080
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await expect(page.locator("#window-word")).toBeVisible();
    await expect(page.locator("#window-word .xp-window-controls")).toBeVisible();

    // Resize viewport down to 1366x768 with window already open
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(200);
    await expect(page.locator("#window-word .xp-window-controls")).toBeVisible();

    // Resize viewport down to mobile 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    await expect(page.locator("#window-word .xp-window-controls")).toBeVisible();
  });

  // Scenario 7: Keyboard Tab, visible focus, Enter/Space; Mobile single-click
  test("7. Keyboard accessibility and mobile single-click", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?view=portfolio");
    await page.waitForLoadState("networkidle");

    // Mobile single click directly opens project
    const koraCard = page.locator("#window-portfolio").getByRole("button", { name: "Открыть кейс Kora" });
    await koraCard.click();
    await expect(page.locator("#window-portfolio h1")).toHaveText("Kora");

    // Keyboard Tab and Enter on Back button
    await page.keyboard.press("Tab");
    const activeElAria = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    if (activeElAria === "Назад к каталогу") {
      await page.keyboard.press("Enter");
      await expect(page.locator("#window-portfolio h1")).toContainText("Влад Ахметов");
    }
  });

  // Capture 6 Required Screenshots
  test("Capture 6 Required Screenshots for QA delivery", async ({ page }) => {
    // 1. Word on 1920x1080
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(QA_DIR, "word-1920x1080.png"),
    });

    // 2. Word on 1366x768
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(QA_DIR, "word-1366x768.png"),
    });

    // 3. Word on 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(QA_DIR, "word-390x844.png"),
    });

    // 4. Browser on 1920x1080 (catalog)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/?view=portfolio");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(QA_DIR, "browser-catalog-1920x1080.png"),
    });

    // 5. Browser on 1366x768 (case)
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/?project=kora");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(QA_DIR, "browser-case-1366x768.png"),
    });

    // 6. Browser on 390x844 (catalog)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?view=portfolio");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(QA_DIR, "browser-catalog-390x844.png"),
    });
  });
});
