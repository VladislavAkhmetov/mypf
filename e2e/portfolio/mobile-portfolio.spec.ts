import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const QA_DIR = path.resolve(process.cwd(), "docs/design/qa/mobile-portfolio");

test.beforeAll(() => {
  if (!fs.existsSync(QA_DIR)) {
    fs.mkdirSync(QA_DIR, { recursive: true });
  }
});

const MOBILE_VIEWPORTS = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-13", width: 390, height: 844 },
  { name: "android-small", width: 360, height: 740 },
  { name: "android-pixel", width: 412, height: 915 },
];

const PROJECTS = ["dombro", "tasker", "kroomi", "altyn-solok", "printforge"];

// Helper to check for unwanted horizontal overflow inside the browser viewport
async function checkHorizontalOverflow(page: any, contextName: string) {
  const result = await page.evaluate(() => {
    const viewport = document.querySelector('#window-portfolio [class*="contentViewport"]') as HTMLElement | null;
    if (!viewport) return { hasViewport: false, overflow: 0, overflowingElements: [] };

    const vpRect = viewport.getBoundingClientRect();
    const overflowDiff = viewport.scrollWidth - viewport.clientWidth;

    // Allowed horizontal scroll containers
    const isAllowedScrollContainer = (el: HTMLElement) => {
      const cls = el.className || "";
      return (
        cls.includes("carousel") ||
        cls.includes("careerTrack") ||
        cls.includes("stageTrack") ||
        cls.includes("platesTrack") ||
        cls.includes("swatches")
      );
    };

    const overflowingElements: Array<{ tag: string; cls: string; right: number; vpRight: number; diff: number }> = [];
    const all = viewport.querySelectorAll<HTMLElement>("*");
    all.forEach(el => {
      if (el.closest('[class*="carousel"], [class*="careerTrack"], dialog')) return;
      if (el.offsetParent === null && el.offsetWidth === 0) return; // hidden

      const rect = el.getBoundingClientRect();
      if (rect.right > vpRect.right + 2) {
        overflowingElements.push({
          tag: el.tagName.toLowerCase(),
          cls: (typeof el.className === "string" ? el.className : "").slice(0, 50),
          right: Math.round(rect.right),
          vpRight: Math.round(vpRect.right),
          diff: Math.round(rect.right - vpRect.right),
        });
      }
    });

    return {
      hasViewport: true,
      overflow: overflowDiff,
      clientWidth: viewport.clientWidth,
      scrollWidth: viewport.scrollWidth,
      overflowingElements: overflowingElements.slice(0, 5),
    };
  });

  return result;
}

// Helper to inspect image integrity and container containment
async function checkImagesIntegrity(page: any) {
  return await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('#window-portfolio img'));
    const issues: Array<{ src: string; reason: string }> = [];

    images.forEach(img => {
      if (img.closest("details:not([open])")) return;
      if (!img.complete || img.naturalWidth === 0) {
        issues.push({ src: img.src.slice(-40), reason: "Image failed to load or broken" });
      }
      const rect = img.getBoundingClientRect();
      const parent = img.parentElement;
      if (parent && !img.closest('[class*="carousel"], [class*="careerTrack"], dialog')) {
        const parentRect = parent.getBoundingClientRect();
        if (rect.width > parentRect.width + 5 && parentRect.width > 0) {
          issues.push({
            src: img.src.slice(-40),
            reason: `Image width (${Math.round(rect.width)}px) exceeds parent (${Math.round(parentRect.width)}px)`,
          });
        }
      }
    });

    return { total: images.length, issues };
  });
}

// Helper to inspect style adherence
async function checkStylesAdherence(page: any) {
  return await page.evaluate(() => {
    const portfolio = document.querySelector('#window-portfolio') as HTMLElement | null;
    if (!portfolio) return { ok: false, error: "Portfolio window not found" };

    const winFrame = portfolio;
    const titlebar = portfolio.querySelector('.xp-titlebar') as HTMLElement | null;
    const addressBar = portfolio.querySelector('[class*="addressBar"]') as HTMLElement | null;
    const backBtn = portfolio.querySelector('[class*="backBtn"]') as HTMLElement | null;
    const content = portfolio.querySelector('[class*="contentViewport"]') as HTMLElement | null;

    const computedContent = content ? window.getComputedStyle(content) : null;
    const computedTitle = titlebar ? window.getComputedStyle(titlebar) : null;

    return {
      ok: true,
      hasTitlebar: !!titlebar,
      hasAddressBar: !!addressBar,
      hasBackBtn: !!backBtn,
      titlebarHeight: titlebar ? titlebar.offsetHeight : 0,
      fontFamily: computedContent ? computedContent.fontFamily : "",
      backgroundColor: computedContent ? computedContent.backgroundColor : "",
    };
  });
}

test.describe("Mobile Portfolio - Landing / Catalog Page", () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test(`Landing Page on ${vp.name} (${vp.width}x${vp.height}): overflow, images, typography, interactive elements`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/?view=portfolio&lang=ru");
      await page.waitForLoadState("networkidle");

      const win = page.locator("#window-portfolio");
      await expect(win).toBeVisible({ timeout: 10000 });

      // 1. Check window fills mobile viewport
      const winBox = await win.boundingBox();
      expect(winBox).not.toBeNull();
      expect(winBox!.width).toBe(vp.width);
      expect(winBox!.x).toBe(0);

      // 2. Check horizontal overflow on catalog
      const overflowInfo = await checkHorizontalOverflow(page, `landing-${vp.name}`);
      expect(overflowInfo.overflow, `Viewport has horizontal overflow on ${vp.name}: ${JSON.stringify(overflowInfo)}`).toBeLessThanOrEqual(0);

      // 3. Check hero section & intro text
      const intro = win.locator('[class*="introText"]');
      await expect(intro).toBeVisible();
      const introBox = await intro.boundingBox();
      expect(introBox!.width).toBeLessThanOrEqual(vp.width);

      // 4. Check Hero Dancer 3D canvas container does not overflow viewport
      const dancer = win.locator('[class*="dancerWrapper"]');
      if (await dancer.count() > 0) {
        const dancerBox = await dancer.boundingBox();
        if (dancerBox) {
          expect(dancerBox.x + dancerBox.width).toBeLessThanOrEqual(vp.width + 5);
        }
      }

      // 5. Check Project Carousel
      const carousel = win.locator('[class*="carousel"]').first();
      await expect(carousel).toBeVisible();
      const cards = carousel.locator('[data-project-card]');
      await expect(cards).toHaveCount(4);

      // Verify card titles and kickers are visible
      const firstCardTitle = cards.first().locator('[class*="projectTitle"]');
      await expect(firstCardTitle).toBeVisible();

      // Check carousel controls
      const nextBtn = win.locator('[aria-label="Следующие проекты"], [aria-label="Next projects"]');
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();
      await page.waitForTimeout(300);

      // 6. Check Career Timeline
      const career = win.locator('section[class*="career"]');
      await expect(career).toBeVisible();
      const careerTrack = win.locator('[class*="careerTrack"]');
      await expect(careerTrack).toBeVisible();

      // 7. Check Figma Plugins Accordion
      const pluginsSection = win.locator('[class*="tools"]');
      await pluginsSection.scrollIntoViewIfNeeded();
      await expect(pluginsSection).toBeVisible();

      const pluginButtons = pluginsSection.locator('[class*="pluginRow"]');
      const pluginCount = await pluginButtons.count();
      expect(pluginCount).toBeGreaterThan(0);

      // Open first plugin accordion
      await pluginButtons.first().click();
      await page.waitForTimeout(200);
      const openPanel = pluginsSection.locator('[class*="pluginPanel"][inert="false"], [class*="pluginItem"][data-open="true"]');
      await expect(openPanel).toBeVisible();

      // 8. Check Images
      const imgInfo = await checkImagesIntegrity(page);
      expect(imgInfo.issues, `Image issues on ${vp.name}: ${JSON.stringify(imgInfo.issues)}`).toHaveLength(0);

      // 9. Check Styles Adherence
      const stylesInfo = await checkStylesAdherence(page);
      expect(stylesInfo.hasTitlebar).toBe(true);
      expect(stylesInfo.hasAddressBar).toBe(true);
      expect(stylesInfo.hasBackBtn).toBe(true);

      // 10. Capture full screenshot of catalog on this viewport
      await page.screenshot({
        path: path.join(QA_DIR, `catalog-${vp.name}.png`),
        fullPage: false,
      });
    });
  }
});

test.describe("Mobile Portfolio - Project Detail Pages", () => {
  for (const slug of PROJECTS) {
    test(`Case ${slug} on iPhone 13 (390x844): overflow, mockups, text, media`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/?project=${slug}&lang=ru`);
      await page.waitForLoadState("networkidle");

      const win = page.locator("#window-portfolio");
      await expect(win).toBeVisible({ timeout: 10000 });

      // Check title exists
      const title = win.locator("h1");
      await expect(title).toBeVisible();
      const titleBox = await title.boundingBox();
      expect(titleBox!.width).toBeLessThanOrEqual(390);

      // Check horizontal overflow
      const overflowInfo = await checkHorizontalOverflow(page, `project-${slug}`);
      expect(overflowInfo.overflow, `Project ${slug} has horizontal overflow: ${JSON.stringify(overflowInfo)}`).toBeLessThanOrEqual(0);

      // Check images
      const imgInfo = await checkImagesIntegrity(page);
      expect(imgInfo.issues, `Image issues in ${slug}: ${JSON.stringify(imgInfo.issues)}`).toHaveLength(0);

      // Project-specific validations
      if (slug === "tasker") {
        // Floating mockup check: desktop + phone
        const desktopImg = win.locator('[class*="taskerDesktopImg"]');
        const phoneImg = win.locator('[class*="taskerPhoneImg"]');
        await expect(desktopImg).toBeVisible();
        await expect(phoneImg).toBeVisible();

        const phoneBox = await phoneImg.boundingBox();
        expect(phoneBox!.x + phoneBox!.width).toBeLessThanOrEqual(390 + 2);
      }

      if (slug === "dombro") {
        // Specimen input check
        const textInput = win.locator('textarea, input[type="text"]').first();
        if (await textInput.count() > 0) {
          await expect(textInput).toBeVisible();
        }
      }

      if (slug === "altyn-solok") {
        // Open the full-page details accordion and verify the image loads without overflow
        const fullPageDetails = win.locator('details[class*="fullPage"]');
        if (await fullPageDetails.count() > 0) {
          const summary = fullPageDetails.locator("summary");
          await summary.scrollIntoViewIfNeeded();
          await summary.click();
          await page.waitForTimeout(300);
          const fullImg = fullPageDetails.locator("img");
          await expect(fullImg).toBeVisible();
          const fullImgInfo = await fullImg.evaluate((img: HTMLImageElement) => ({
            complete: img.complete,
            naturalWidth: img.naturalWidth,
          }));
          expect(fullImgInfo.complete).toBe(true);
          expect(fullImgInfo.naturalWidth).toBeGreaterThan(0);

          // Verify no horizontal overflow after opening full page
          const afterOpenOverflow = await checkHorizontalOverflow(page, "altyn-solok-fullpage-open");
          expect(afterOpenOverflow.overflow).toBeLessThanOrEqual(0);
        }
      }

      // Capture screenshot
      await page.screenshot({
        path: path.join(QA_DIR, `project-${slug}-390x844.png`),
      });

      // Scroll down and capture lower part
      const viewport = page.locator('#window-portfolio [class*="contentViewport"]');
      await viewport.evaluate((el) => el.scrollTo({ top: 600, behavior: "instant" }));
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(QA_DIR, `project-${slug}-390x844-scrolled.png`),
      });
    });
  }

  // Also test small Android screen (360x740) on Tasker & Dombro to catch narrowest screen clipping
  test("Tasker & Dombro on narrowest Android (360x740)", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const slug of ["tasker", "dombro"]) {
      await page.goto(`/?project=${slug}&lang=ru`);
      await page.waitForLoadState("networkidle");

      const overflowInfo = await checkHorizontalOverflow(page, `narrow-${slug}`);
      expect(overflowInfo.overflow, `Narrow ${slug} has horizontal overflow: ${JSON.stringify(overflowInfo)}`).toBeLessThanOrEqual(0);

      await page.screenshot({
        path: path.join(QA_DIR, `narrow-${slug}-360x740.png`),
      });
    }
  });

  // Test Image Lightbox / Zoom Dialog on mobile
  test("Lightbox image zoom modal fits mobile screen and can be closed", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?project=printforge&lang=ru");
    await page.waitForLoadState("networkidle");

    const zoomBtn = page.locator('[class*="screenshotButton"]').first();
    await zoomBtn.scrollIntoViewIfNeeded();
    await zoomBtn.click();

    const dialog = page.locator("dialog");
    await expect(dialog).toBeVisible();

    const dialogBox = await dialog.boundingBox();
    expect(dialogBox!.width).toBeLessThanOrEqual(390);

    const closeBtn = dialog.locator('button:has-text("Закрыть"), button:has-text("Close"), [class*="closeLightbox"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(dialog).toBeHidden();
  });
});

test.describe("Deep Text Clipping and Style Consistency Analysis", () => {
  const routes = [
    { name: "Catalog (Landing)", path: "/?view=portfolio&lang=ru" },
    { name: "Project Dombro", path: "/?project=dombro&lang=ru" },
    { name: "Project Tasker", path: "/?project=tasker&lang=ru" },
    { name: "Project Kroomi", path: "/?project=kroomi&lang=ru" },
    { name: "Project Altyn-Solok", path: "/?project=altyn-solok&lang=ru" },
    { name: "Project PrintForge", path: "/?project=printforge&lang=ru" },
  ];

  for (const route of routes) {
    test(`No clipped text or style violations on ${route.name} (390x844)`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      const clippedElements = await page.evaluate(() => {
        const viewport = document.querySelector('#window-portfolio [class*="contentViewport"]') as HTMLElement | null;
        if (!viewport) return [{ error: "contentViewport not found" }];

        const vpRect = viewport.getBoundingClientRect();
        const results: Array<{ tag: string; text: string; issue: string; box: any }> = [];

        const textEls = viewport.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, span, button, a, figcaption, dt, dd");

        textEls.forEach(el => {
          // Skip elements inside carousel track or career track that scroll horizontally by design
          if (el.closest('[class*="carousel"], [class*="careerTrack"], dialog')) return;
          // Skip visually hidden or zero-size elements
          if (el.classList.contains("visuallyHidden") || el.className.includes("visuallyHidden")) return;
          if (el.offsetParent === null || (el.offsetWidth === 0 && el.offsetHeight === 0)) return;

          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);

          // Check if right edge exceeds viewport
          if (rect.right > vpRect.right + 2 && rect.width > 0) {
            results.push({
              tag: el.tagName.toLowerCase(),
              text: (el.textContent || "").trim().slice(0, 40),
              issue: `Right edge (${Math.round(rect.right)}px) exceeds viewport (${Math.round(vpRect.right)}px)`,
              box: { right: rect.right, vpRight: vpRect.right },
            });
          }

          // Check if left edge is clipped
          if (rect.left < vpRect.left - 2 && rect.width > 0) {
            results.push({
              tag: el.tagName.toLowerCase(),
              text: (el.textContent || "").trim().slice(0, 40),
              issue: `Left edge (${Math.round(rect.left)}px) precedes viewport (${Math.round(vpRect.left)}px)`,
              box: { left: rect.left, vpLeft: vpRect.left },
            });
          }

          // Check if text is clipped inside an overflow: hidden container without text-overflow ellipsis
          if (style.overflow === "hidden" && style.textOverflow !== "ellipsis") {
            if (el.scrollWidth > el.clientWidth + 2) {
              results.push({
                tag: el.tagName.toLowerCase(),
                text: (el.textContent || "").trim().slice(0, 40),
                issue: `Text horizontally truncated by overflow:hidden (scrollWidth ${el.scrollWidth} > clientWidth ${el.clientWidth})`,
                box: { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth },
              });
            }
          }
        });

        return results;
      });

      expect(clippedElements, `Found clipped text elements on ${route.name}: ${JSON.stringify(clippedElements)}`).toHaveLength(0);
    });
  }
});
