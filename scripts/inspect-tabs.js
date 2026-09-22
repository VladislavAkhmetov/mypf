const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 440, height: 750 } });
  await page.goto('http://localhost:3005');
  await page.waitForTimeout(1000);

  const tabs = ['Layouts', 'Colors', 'DPI', 'Health', 'Packaging'];
  for (const tab of tabs) {
    const tabEl = page.locator(`text="${tab}"`).first();
    if (await tabEl.isVisible()) {
      await tabEl.click();
      await page.waitForTimeout(400);
      const text = await page.evaluate(() => document.body.innerText.slice(0, 180));
      console.log(`=== Tab: ${tab} ===`, text.replace(/\n+/g, ' '));
    }
  }

  await browser.close();
})();
