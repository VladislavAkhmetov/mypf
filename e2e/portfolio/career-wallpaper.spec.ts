import { test, expect } from "@playwright/test";

test.use({ timezoneId: "Europe/Moscow", viewport: { width: 1440, height: 1050 } });

test("Bliss follows the local clock, migrates geo and falls back for missing images", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-09-22T12:00:00+03:00"));
  await page.addInitScript(() => {
    localStorage.setItem("amazi-xp-wallpaper-source", "geo");
    localStorage.setItem("amazi-xp-wallpaper", "/images/wallpapers/autumn.svg");
  });
  let geoCalls = 0;
  page.on("request", request => { if (request.url().includes("/api/geo")) geoCalls++; });
  await page.route("**/images/wallpapers/bliss-*.jpg", route => route.fulfill({ path: "public/images/bliss.jpg", contentType: "image/jpeg" }));
  await page.goto("/?view=portfolio");
  const background = page.locator("[data-desktop-wallpaper]");
  await expect(background).toHaveAttribute("data-desktop-wallpaper", "/images/bliss.jpg");
  for (const [hour, period] of [[18, "evening"], [22, "night"], [6, "morning"], [11, "day"]] as const) {
    await page.clock.setFixedTime(new Date(`2026-09-22T${String(hour).padStart(2, "0")}:00:00+03:00`));
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(background).toHaveAttribute("data-desktop-wallpaper", period === "day" ? "/images/bliss.jpg" : `/images/wallpapers/bliss-${period}.jpg`);
  }
  await page.route("**/images/wallpapers/bliss-night.jpg", route => route.fulfill({ status: 404, body: "" }));
  await page.clock.setFixedTime(new Date("2026-09-22T23:00:00+03:00"));
  await page.reload();
  await expect(background).toHaveAttribute("data-desktop-wallpaper", "/images/bliss.jpg");
  expect(geoCalls).toBe(0);
});

test("manual wallpaper survives loading and clock changes", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("amazi-xp-wallpaper-source", "user");
    localStorage.setItem("amazi-xp-wallpaper", "/images/wallpapers/autumn.svg");
  });
  await page.goto("/?view=portfolio");
  const background = page.locator("[data-desktop-wallpaper]");
  await expect(background).toHaveAttribute("data-desktop-wallpaper", "/images/wallpapers/autumn.svg");
  await page.clock.setFixedTime(new Date("2026-09-22T12:00:00+03:00"));
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(background).toHaveAttribute("data-desktop-wallpaper", "/images/wallpapers/autumn.svg");
});

test("display settings can restore time mode without theme Apply making it manual", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-09-22T12:00:00+03:00"));
  await page.addInitScript(() => {
    localStorage.setItem("amazi-xp-wallpaper-source", "user");
    localStorage.setItem("amazi-xp-wallpaper", "/images/wallpapers/autumn.svg");
  });
  await page.goto("/?view=portfolio");
  await page.locator(".xp-desktop").click({ button: "right", position: { x: 1400, y: 500 } });
  await page.getByText("Свойства", { exact: true }).click();
  const settings = page.locator("#window-display-properties");
  await settings.getByRole("button", { name: "Фоновый рисунок (Wallpapers)" }).click();
  await settings.getByRole("button", { name: "По времени суток" }).click();
  await settings.getByRole("button", { name: "Применить", exact: true }).click();
  await expect(page.locator("[data-desktop-wallpaper]")).toHaveAttribute("data-desktop-wallpaper", "/images/bliss.jpg");
  await settings.getByRole("button", { name: "Темы оформления (Themes)" }).click();
  await settings.getByRole("button", { name: "Применить", exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem("amazi-xp-wallpaper-source"))).toBe("time");
});

test("career timeline: arrows, keyboard, pause, narrow screen and reduced motion", async ({ page }, testInfo) => {
  await page.goto("/?view=portfolio");
  const section = page.locator('section[aria-labelledby="career-title"]');
  const rail = section.getByRole("list");
  await section.scrollIntoViewIfNeeded();
  await expect(rail.getByRole("listitem")).toHaveCount(5);
  await expect(section).toHaveAttribute("data-visible", "true");
  await expect(section.getByRole("button", { name: "Предыдущий этап карьеры" })).toBeDisabled();
  await section.getByRole("button", { name: "Следующий этап карьеры" }).click();
  await expect.poll(() => rail.evaluate(el => el.scrollLeft)).toBeGreaterThan(100);
  await rail.focus();
  await page.keyboard.press("End");
  await expect(section.getByRole("button", { name: "Следующий этап карьеры" })).toBeDisabled();
  await page.keyboard.press("Home");
  await expect(section.getByRole("button", { name: "Предыдущий этап карьеры" })).toBeDisabled();
  const cube = section.locator('[class*="logoCube"]').first();
  await expect(cube).toHaveCSS("animation-play-state", "running");
  await section.getByRole("button", { name: "Пауза лого" }).click();
  await expect(cube).toHaveCSS("animation-play-state", "paused");
  await page.screenshot({ path: testInfo.outputPath("career-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await section.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(cube).toHaveCSS("animation-name", "none");
  await page.screenshot({ path: testInfo.outputPath("career-mobile.png") });
});
