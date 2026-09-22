const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  const outDir = path.resolve(__dirname, '../public/placeholders/covers/printforge');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 450, height: 800 },
    deviceScaleFactor: 2, // Retina 2x for ultra-sharp screenshots
  });

  await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Tabs list
  const tabs = [
    { name: 'Layouts', file: 'tab-layouts.png' },
    { name: 'Colors', file: 'tab-colors.png' },
    { name: 'DPI', file: 'tab-dpi.png' },
    { name: 'Health', file: 'tab-health.png' },
    { name: 'Packaging', file: 'tab-packaging.png' },
  ];

  for (const tab of tabs) {
    const tabBtn = page.locator(`text="${tab.name}"`).first();
    if (await tabBtn.isVisible()) {
      await tabBtn.click();
      await page.waitForTimeout(600);

      const targetPath = path.join(outDir, tab.file);
      await page.screenshot({ path: targetPath, type: 'png' });
      console.log(`Saved screenshot: ${tab.file} (${fs.statSync(targetPath).size} bytes)`);
    }
  }

  await browser.close();
  console.log('All tab screenshots captured successfully!');
}

captureScreenshots().catch(console.error);
