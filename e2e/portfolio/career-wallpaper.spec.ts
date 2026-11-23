import { test, expect } from "@playwright/test";

test.use({ timezoneId: "Europe/Moscow", viewport: { width: 1440, height: 1050 } });

test("Bliss is static by default and does not change with clock", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-09-22T12:00:00+03:00"));
  await page.goto("/?view=portfolio");
  const background = page.locator("[data-desktop-wallpaper]");
  await expect(background).toHaveAttribute("data-desktop-wallpaper", "/images/bliss.jpg");

  // Verify that clock and focus changes do not alter the static Bliss wallpaper
  for (const hour of [18, 22, 6, 11, 23]) {
    await page.clock.setFixedTime(new Date(`2026-09-22T${String(hour).padStart(2, "0")}:00:00+03:00`));
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(background).toHaveAttribute("data-desktop-wallpaper", "/images/bliss.jpg");
  }
});

test("manual wallpaper survives loading and clock changes", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("xp-wallpaper-source", "user");
    localStorage.setItem("xp-wallpaper", "/images/wallpapers/autumn.svg");
  });
  await page.goto("/?view=portfolio");
  const background = page.locator("[data-desktop-wallpaper]");
  await expect(background).toHaveAttribute("data-desktop-wallpaper", "/images/wallpapers/autumn.svg");
  await page.clock.setFixedTime(new Date("2026-09-22T12:00:00+03:00"));
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(background).toHaveAttribute("data-desktop-wallpaper", "/images/wallpapers/autumn.svg");
});

test("display settings can select wallpaper and apply", async ({ page }) => {
  await page.goto("/?view=portfolio");
  await page.locator(".xp-desktop").click({ button: "right", position: { x: 1400, y: 500 } });
  await page.getByText("Свойства", { exact: true }).click();
  const settings = page.locator("#window-display-properties");
  await settings.getByRole("button", { name: "Фон рабочего стола" }).click();
  await settings.getByText("Autumn (Золотая осень)").click();
  await settings.getByRole("button", { name: "Применить", exact: true }).click();
  await expect(page.locator("[data-desktop-wallpaper]")).toHaveAttribute("data-desktop-wallpaper", "/images/wallpapers/autumn.svg");
  expect(await page.evaluate(() => localStorage.getItem("xp-wallpaper-source"))).toBe("user");
});

test("career timeline: no controls, page scroll drives the rail on narrow screens, reduced motion", async ({ page }, testInfo) => {
  await page.goto("/?view=portfolio");
  const section = page.locator('section[aria-labelledby="career-title"]');
  const rail = section.getByRole("list");
  await section.scrollIntoViewIfNeeded();
  await expect(rail.getByRole("listitem")).toHaveCount(4);
  await expect(section).toHaveAttribute("data-visible", "true");
  await expect(section.getByRole("button")).toHaveCount(0);
  const cube = section.locator('[class*="logoCube"]').first();
  await expect(cube).toHaveCSS("animation-play-state", "running");
  await page.screenshot({ path: testInfo.outputPath("career-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await section.evaluate(el => el.scrollIntoView({ block: "end" }));
  const before = await rail.evaluate(el => el.scrollLeft);
  await section.evaluate(el => el.scrollIntoView({ block: "start" }));
  await expect.poll(() => rail.evaluate(el => el.scrollLeft)).toBeGreaterThan(before + 100);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(cube).toHaveCSS("animation-name", "none");
  await page.screenshot({ path: testInfo.outputPath("career-mobile.png") });
});
