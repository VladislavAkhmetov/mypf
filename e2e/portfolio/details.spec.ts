import { test, expect } from "@playwright/test";

test.describe("Unified portfolio detail pages", () => {
  test("Tool deep links, Back/Forward, reload, related project and minimize", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.goto("/?view=portfolio");
    const win = page.locator("#window-portfolio");
    await win.locator("#portfolio-tools-title").scrollIntoViewIfNeeded();
    await win.getByRole("button", { name: "Подробнее о Auto-Bézier Kern" }).click();
    await expect(win.locator("h1")).toHaveText("Auto-Bézier Kern");
    await expect(page).toHaveURL(/tool=auto-bezier-kern/);
    await page.reload();
    await expect(win.locator("h1")).toHaveText("Auto-Bézier Kern");
    await win.getByRole("button", { name: /Инструмент в контексте проекта/ }).click();
    await expect(win.locator("h1")).toHaveText("dombro");
    await expect(page).toHaveURL(/project=dombro/);
    await page.goBack();
    await expect(win.locator("h1")).toHaveText("Auto-Bézier Kern");
    await page.goForward();
    await expect(win.locator("h1")).toHaveText("dombro");
    await page.goBack();
    await win.locator(".xp-btn-minimize").click();
    await expect(win).toHaveCount(0);
    await page.locator(".xp-task-btn").filter({ hasText: "Портфолио" }).click();
    await expect(win.locator("h1")).toHaveText("Auto-Bézier Kern");
    await win.locator(".xp-btn-close").click();
    await expect(page).not.toHaveURL(/tool=/);
    expect(errors).toEqual([]);
  });

  test("PrintForge feature gallery, image dialog, copy and video", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/?project=printforge");
    const detail = page.locator('[data-portfolio-detail="project"]');
    await expect(detail.locator("h1")).toHaveText("PrintForge");
    await detail.getByRole("button", { name: "Скопировать ссылку" }).click();
    await expect(detail.getByRole("status")).toHaveText("Ссылка скопирована");
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("project=printforge");
    await expect(detail.locator("video")).toHaveAttribute("controls", "");
    await expect(detail.locator("video")).not.toHaveAttribute("autoplay");
    await detail.getByRole("button", { name: "Цвет", exact: true }).click();
    await expect(detail.getByRole("heading", { name: "Цвет под контролем" })).toBeVisible();
    const trigger = detail.getByRole("button", { name: "Увеличить: Цвет под контролем" });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByRole("img")).toHaveAttribute("src", /tab_colors_2x/);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
    await detail.getByRole("button", { name: "Упаковка", exact: true }).click();
    await expect(detail.getByRole("heading", { name: "Не только плоский лист" })).toBeVisible();
  });

  test("Project interactions and Altyn gallery retain the shared style", async ({ page }) => {
    await page.goto("/?project=dombro");
    const input = page.getByRole("textbox", { name: "Текст типографического эскиза" });
    await input.fill("Новый текст");
    await expect(input).toHaveValue("Новый текст");
    await page.getByRole("slider", { name: "Размер текста" }).fill("64");
    await expect(input).toHaveCSS("font-size", "64px");
    await page.goto("/?project=altyn-solok");
    await expect(page.locator('[data-portfolio-detail] h1')).toHaveText("Алтын Солок");
    await page.getByText("Весь сайт целиком", { exact: false }).click();
    await expect(page.getByAltText("Полная страница Алтын Солок")).toBeVisible();
  });

  test("Every tool and special project fits a narrow window", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const routes = ["project=printforge", "project=altyn-solok", "tool=auto-bezier-kern", "tool=vector-slicer", "tool=palette-harmonizer", "tool=specimen-blueprint"];
    for (const route of routes) {
      await page.goto("/?" + route);
      await expect(page.locator("[data-portfolio-detail] h1")).toBeVisible();
      const viewport = page.locator('#window-portfolio [class*="contentViewport"]');
      await expect.poll(() => viewport.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
      await expect(page.locator('[data-portfolio-detail]')).toHaveCSS("background-color", "rgb(17, 17, 16)");
    }
    await page.goto("/?tool=missing");
    await expect(page.locator("#window-portfolio").getByRole("alert")).toBeVisible();
  });
  test("Tasker case plays two interface clips, can pause them and fits a narrow window", async ({ page }) => {
    await page.goto("/?project=tasker");
    await expect(page.locator("[data-portfolio-detail] h1")).toHaveText("Таскер");
    const clips = page.locator("[data-portfolio-detail] video");
    await expect(clips).toHaveCount(2);
    await clips.first().scrollIntoViewIfNeeded();
    await expect.poll(() => clips.first().evaluate((video: HTMLVideoElement) => !video.paused)).toBe(true);
    const stop = page.getByRole("button", { name: "Остановить ролик" }).first();
    await stop.click();
    await expect(page.getByRole("button", { name: "Запустить ролик" }).first()).toBeVisible();
    await expect.poll(() => clips.first().evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    const viewport = page.locator('#window-portfolio [class*="contentViewport"]');
    await expect.poll(() => viewport.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  });
  test("kroomi case shows the character clip, six characters, screens and opens the landing window", async ({ page }) => {
    await page.goto("/?project=kroomi");
    await expect(page.locator("[data-portfolio-detail] h1")).toHaveText("kroomi");
    await expect(page.locator("[data-portfolio-detail] video")).toHaveCount(1);
    await expect(page.getByAltText("Шесть персонажей: два вида в разных цветах")).toBeVisible();
    await expect(page.getByRole("button", { name: /Увеличить: Паспорт персонажа/ })).toBeVisible();
    await page.getByRole("button", { name: /Лендинг kroomi/ }).click();
    await expect(page.locator("#window-kroomi")).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?project=kroomi");
    const viewport = page.locator('#window-portfolio [class*="contentViewport"]');
    await expect.poll(() => viewport.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  });
});
