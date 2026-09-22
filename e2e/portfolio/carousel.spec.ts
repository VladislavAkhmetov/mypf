import { test, expect } from "@playwright/test";

test.describe("Portfolio Landing - Horizontal Carousel", () => {
  test("Scrolls horizontally with mouse wheel and arrow buttons", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/?view=portfolio");
    await page.waitForLoadState("networkidle");

    const slider = page.locator("#window-portfolio").locator('[class*="carouselSlider"]');
    await expect(slider).toBeVisible();

    // Initial scrollLeft is 0
    const initialScroll = await slider.evaluate((el) => el.scrollLeft);
    expect(initialScroll).toBe(0);

    // Prev button should be disabled initially
    const prevBtn = page.locator("#window-portfolio").getByRole("button", { name: "Предыдущие проекты" });
    await expect(prevBtn).toBeDisabled();

    // Next button should be enabled
    const nextBtn = page.locator("#window-portfolio").getByRole("button", { name: "Следующие проекты" });
    await expect(nextBtn).toBeEnabled();

    // Dispatch mouse wheel on slider
    await slider.hover();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);

    const scrolledWheel = await slider.evaluate((el) => el.scrollLeft);
    expect(scrolledWheel).toBeGreaterThan(0);

    // Now prev button should be enabled
    await expect(prevBtn).toBeEnabled();

    // Click Next button
    const prevScroll = scrolledWheel;
    await nextBtn.click();
    await page.waitForTimeout(500);
    const afterNextClick = await slider.evaluate((el) => el.scrollLeft);
    expect(afterNextClick).toBeGreaterThan(prevScroll);

    // Click Prev button
    await prevBtn.click();
    await page.waitForTimeout(500);
    const afterPrevClick = await slider.evaluate((el) => el.scrollLeft);
    expect(afterPrevClick).toBeLessThan(afterNextClick);

    // Switching filter resets scroll to 0
    const commFilter = page.locator("#window-portfolio").getByRole("button", { name: /Интерфейсы/ });
    await commFilter.click();
    await page.waitForTimeout(400);
    const scrollAfterFilter = await slider.evaluate((el) => el.scrollLeft);
    expect(scrollAfterFilter).toBe(0);

    // Switch back to all projects and capture screenshot of carousel
    const allFilter = page.locator("#window-portfolio").getByRole("button", { name: "Все проекты" });
    await allFilter.click();
    await page.waitForTimeout(400);

    const carouselSlider = page.locator("#window-portfolio").locator('[class*="carouselSlider"]');
    await carouselSlider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    await page.screenshot({
      path: "docs/design/qa/portfolio-carousel.png",
    });
  });
});
