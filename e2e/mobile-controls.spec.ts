import { devices, expect, test } from '@playwright/test';
import { waitForGameState, waitForMovement } from './utils/test-helpers';

test.describe('Beppo Laughs - Mobile Controls', () => {
  test.use({
    ...devices['iPhone 13'],
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('mobile: start game and verify touch controls', async ({ page }) => {
    // Should show main menu
    await expect(page.getByRole('heading', { name: 'BEPPO LAUGHS' })).toBeVisible({
      timeout: 10000,
    });
    await page.screenshot({ path: 'test-results/screenshots/mobile-01-menu.png' });

    // Enter seed and start
    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('mobile test seed');

    const startBtn = page.getByTestId('button-start-game');
    await startBtn.click();

    // Should prompt to rotate if in portrait
    const rotatePrompt = page.getByText(/ROTATE YOUR DEVICE/i);
    const hasRotatePrompt = await rotatePrompt.isVisible().catch(() => false);

    if (hasRotatePrompt) {
      await page.screenshot({ path: 'test-results/screenshots/mobile-02-rotate-prompt.png' });
    }

    // Wait for HUD (game may start if landscape)
    await waitForGameState(page, 'playing', 15000);
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/screenshots/mobile-03-game-started.png' });

    // Verify mobile-specific exit button
    const mobileExitBtn = page.getByTestId('button-exit-mobile');
    await expect(mobileExitBtn).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/mobile-04-exit-button.png' });

    // Test lever control with touch
    const leverControl = page.getByTestId('lever-control');
    await expect(leverControl).toBeVisible();

    // Simulate touch on lever
    await leverControl.dispatchEvent('touchstart');
    await waitForMovement(page, true, 3000);
    await page.screenshot({ path: 'test-results/screenshots/mobile-05-lever-pulled.png' });

    await leverControl.dispatchEvent('touchend');
    await waitForMovement(page, false, 2000).catch(() => {});
    await page.screenshot({ path: 'test-results/screenshots/mobile-06-lever-released.png' });
  });

  test('mobile: test tap zones for movement', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('tap zone test');
    await startBtn.click();

    await waitForGameState(page, 'playing', 15000);
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });

    // Look for tap zones (left/right sides for steering)
    const tapZones = page.locator('[data-testid^="tap-zone-"]');
    const tapZoneCount = await tapZones.count();

    if (tapZoneCount > 0) {
      await page.screenshot({ path: 'test-results/screenshots/mobile-tap-zones.png' });

      // Test tapping a zone - wait for any state changes
      await tapZones.first().tap();
      // Wait briefly for tap to register, use short timeout as fallback
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'test-results/screenshots/mobile-tap-zone-activated.png' });
    }
  });

  test('mobile: test gesture controls if available', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('gesture test');
    await startBtn.click();

    await waitForGameState(page, 'playing', 15000);
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/screenshots/mobile-gestures-01.png' });

    // Test swipe gestures (if implemented)
    const viewport = page.viewportSize();
    if (viewport) {
      // Swipe right
      await page.mouse.move(viewport.width * 0.2, viewport.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(viewport.width * 0.8, viewport.height * 0.5);
      await page.mouse.up();
      // Wait briefly for gesture to process
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'test-results/screenshots/mobile-gestures-swipe-right.png' });

      // Swipe left
      await page.mouse.move(viewport.width * 0.8, viewport.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(viewport.width * 0.2, viewport.height * 0.5);
      await page.mouse.up();
      // Wait briefly for gesture to process
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'test-results/screenshots/mobile-gestures-swipe-left.png' });
    }
  });

  test('mobile: verify fork selection on touch devices', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('fork selection mobile');
    await startBtn.click();

    await waitForGameState(page, 'playing', 15000);
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });

    const leverControl = page.getByTestId('lever-control');

    // Move to find a fork
    for (let attempt = 0; attempt < 5; attempt++) {
      await leverControl.dispatchEvent('touchstart');
      await waitForMovement(page, true, 3000);
      await leverControl.dispatchEvent('touchend');
      await waitForMovement(page, false, 2000).catch(() => {});

      // Check for fork
      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();

      if (forkCount > 0) {
        await page.screenshot({
          path: 'test-results/screenshots/mobile-fork-appeared.png',
        });

        // Test tapping a fork button
        await forkButtons.first().tap();
        await page
          .locator('[data-has-fork="true"]')
          .waitFor({ state: 'detached', timeout: 2000 })
          .catch(() => {});
        await page.screenshot({
          path: 'test-results/screenshots/mobile-fork-selected.png',
        });
        break;
      }
    }
  });

  test('mobile: test exit functionality', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('mobile exit test');
    await startBtn.click();

    await waitForGameState(page, 'playing', 15000);
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });

    // Tap mobile exit button
    const mobileExitBtn = page.getByTestId('button-exit-mobile');
    await expect(mobileExitBtn).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/mobile-before-exit.png' });

    await mobileExitBtn.tap();
    await waitForGameState(page, 'menu', 5000);

    // Should return to main menu
    await expect(page.getByRole('heading', { name: 'BEPPO LAUGHS' })).toBeVisible({
      timeout: 5000,
    });
    await page.screenshot({ path: 'test-results/screenshots/mobile-after-exit.png' });
  });
});

test.describe('Beppo Laughs - Tablet Controls', () => {
  test.use({
    ...devices['iPad (gen 7)'],
  });

  test('tablet: verify landscape orientation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'BEPPO LAUGHS' })).toBeVisible({
      timeout: 10000,
    });
    await page.screenshot({ path: 'test-results/screenshots/tablet-menu.png' });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('tablet test');

    const startBtn = page.getByTestId('button-start-game');
    await startBtn.click();

    await waitForGameState(page, 'playing', 15000);
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/screenshots/tablet-game.png', fullPage: true });

    // Verify controls are accessible on tablet
    const leverControl = page.getByTestId('lever-control');
    await expect(leverControl).toBeVisible();
  });
});
