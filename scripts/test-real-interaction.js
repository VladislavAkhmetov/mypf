const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 720, height: 750 } });
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Test clicking Colors
  await page.locator('button:has-text("Colors"), div:has-text("Colors")').first().click();
  await page.waitForTimeout(400);
  const hasColors = await page.locator('text=Document Colors Scan').first().isVisible();
  console.log('Colors visible:', hasColors);

  // Test clicking DPI
  await page.locator('button:has-text("DPI"), div:has-text("DPI")').first().click();
  await page.waitForTimeout(400);
  const hasDpi = await page.locator('text=Target Print Resolution').first().isVisible();
  console.log('DPI visible:', hasDpi);

  // Test clicking Health
  await page.locator('button:has-text("Health"), div:has-text("Health")').first().click();
  await page.waitForTimeout(400);
  const hasHealth = await page.locator('text=Pre-flight Health Check').first().isVisible();
  console.log('Health visible:', hasHealth);

  // Test clicking Packaging
  await page.locator('button:has-text("Packaging"), div:has-text("Packaging")').first().click();
  await page.waitForTimeout(400);
  const hasPkg = await page.locator('text=Mark as CUT Contour').first().isVisible();
  console.log('Packaging visible:', hasPkg);

  await browser.close();
})();
