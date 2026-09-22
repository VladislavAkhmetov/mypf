const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const tabs = ['Layouts', 'Colors', 'DPI', 'Health', 'Packaging'];
  for (const tab of tabs) {
    const btn = page.locator(`button[role="tab"]:has-text("${tab}")`).first();
    await btn.click();
    await page.waitForTimeout(400);
    const text = await page.evaluate(() => document.body.innerText.slice(0, 180).replace(/\n+/g, ' '));
    console.log(`Tab: ${tab} ->`, text);
  }

  await browser.close();
})();
