import { chromium } from '@playwright/test';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5000', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/visual-main-menu.png', fullPage: true });

  await page.getByTestId('button-start-game').click();
  await page.getByTestId('button-exit').waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/visual-gameplay.png', fullPage: true });

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
