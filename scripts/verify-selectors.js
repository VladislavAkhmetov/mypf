const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 720, height: 750 } });
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const testSelectors = [
    // Tabs
    'button[role="tab"]:has-text("Layouts")',
    'button[role="tab"]:has-text("Colors")',
    'button[role="tab"]:has-text("DPI")',
    'button[role="tab"]:has-text("Health")',
    'button[role="tab"]:has-text("Packaging")',
    // Controls in Layouts
    'button:has-text("Portrait")',
    'button:has-text("Landscape")',
    'input[type="checkbox"]',
    'button:has-text("Business Card (EU)")',
    'button:has-text("A6")',
    // Bottom bar
    'button:has-text("TIFF")',
    'button:has-text("PDF")',
    'button:has-text("Export Selected Frames")',
  ];

  for (const sel of testSelectors) {
    const el = page.locator(sel).first();
    const count = await page.locator(sel).count();
    const isVis = count > 0 ? await el.isVisible() : false;
    const box = isVis ? await el.boundingBox() : null;
    console.log(sel, '-> count:', count, 'visible:', isVis, 'box:', box ? `w:${box.width} h:${box.height}` : 'null');
  }

  await browser.close();
})();
