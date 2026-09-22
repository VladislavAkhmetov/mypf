const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  const htmlPath = path.resolve(__dirname, 'screencast-scene.html');
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);
  await page.waitForTimeout(500);

  // Seek to t=2.5 (Zoom 1.55x on Bleed)
  await page.evaluate(() => window.seek(2.5));
  await page.waitForTimeout(200);
  const outDir = path.resolve(__dirname, '../public/placeholders/covers/printforge');
  await page.screenshot({ path: path.join(outDir, 'test-frame-bleed.png') });
  console.log('Saved test-frame-bleed.png');

  // Seek to t=5.0 (Zoom 1.75x on ICC profiles)
  await page.evaluate(() => window.seek(5.0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, 'test-frame-icc.png') });
  console.log('Saved test-frame-icc.png');

  // Seek to t=8.0 (DPI Scan Results)
  await page.evaluate(() => window.seek(8.0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, 'test-frame-dpi.png') });
  console.log('Saved test-frame-dpi.png');

  // Seek to t=13.5 (Export success)
  await page.evaluate(() => window.seek(13.5));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, 'test-frame-export.png') });
  console.log('Saved test-frame-export.png');

  await browser.close();
})();
