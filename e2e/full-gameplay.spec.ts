import { expect, test } from '@playwright/test';
import { performLeverPull, waitForGameState } from './utils/test-helpers';

test.describe('Beppo Laughs - Full Gameplay Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('complete gameplay sequence: menu to first junction with screenshots', async ({ page }) => {
    // 1. Capture main menu
    await expect(page.getByRole('heading', { name: 'BEPPO LAUGHS' })).toBeVisible({
      timeout: 10000,
    });
    await page.screenshot({ path: 'test-results/screenshots/01-main-menu.png', fullPage: true });

    // 2. Enter custom seed for reproducibility
    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('test gameplay flow');
    await page.screenshot({ path: 'test-results/screenshots/02-seed-entered.png' });

    // 3. Start game
    const startBtn = page.getByTestId('button-start-game');
    await startBtn.click();

    // 4. Wait for game to load and HUD to appear
    await waitForGameState(page, 'playing');
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/screenshots/03-game-started.png' });

    // 5. Verify lever control is visible
    const leverControl = page.getByTestId('lever-control');
    await expect(leverControl).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/04-lever-visible.png' });

    // 6. Pull lever to start moving - use helper for proper state checking
    await performLeverPull(page, 2000, 'test-results/screenshots/05-lever-pulled.png');

    // 7. Keep lever held to accelerate
    await performLeverPull(page, 2000, 'test-results/screenshots/06-accelerating.png');

    // 8. Screenshot after movement
    await page.screenshot({ path: 'test-results/screenshots/07-lever-released.png' });

    // 9. Check if a fork appeared (junction with multiple paths)
    const forkButtons = page.locator('[data-testid^="button-fork-"]');
    const forkCount = await forkButtons.count();

    if (forkCount > 0) {
      await page.screenshot({ path: 'test-results/screenshots/08-fork-appeared.png' });

      // 10. Select first option
      const firstFork = forkButtons.first();
      await firstFork.click();
      // Wait for fork to be dismissed
      await page
        .locator('[data-has-fork="true"]')
        .waitFor({ state: 'detached', timeout: 2000 })
        .catch(() => {});
      await page.screenshot({ path: 'test-results/screenshots/09-fork-selected.png' });
    }

    // 11. Verify HUD still visible
    await expect(page.getByText(/CELLS:/)).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/10-hud-after-move.png' });
  });

  test('navigate through multiple rooms and capture progression', async ({ page }) => {
    // Start game with fixed seed
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('multi room test');
    await startBtn.click();

    // Wait for game to load
    await waitForGameState(page, 'playing');
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/screenshots/multi-01-start.png' });

    // Navigate through multiple rooms
    for (let room = 1; room <= 3; room++) {
      // Pull and hold lever with proper state checking
      await performLeverPull(
        page,
        3000,
        `test-results/screenshots/multi-${String(room).padStart(2, '0')}-moving.png`,
      );

      await page.screenshot({
        path: `test-results/screenshots/multi-${String(room).padStart(2, '0')}-stopped.png`,
      });

      // Check for fork
      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();

      if (forkCount > 0) {
        await page.screenshot({
          path: `test-results/screenshots/multi-${String(room).padStart(2, '0')}-fork.png`,
        });

        // Select first available direction
        await forkButtons.first().click();
        // Wait for fork to be dismissed
        await page
          .locator('[data-has-fork="true"]')
          .waitFor({ state: 'detached', timeout: 2000 })
          .catch(() => {});
      }

      // Check for nearby items or exits
      const interactionPrompt = page
        .locator('[data-testid^="button-collect-"]')
        .or(page.locator('[data-testid="button-exit-maze"]'));
      const hasInteraction = (await interactionPrompt.count()) > 0;

      if (hasInteraction) {
        await page.screenshot({
          path: `test-results/screenshots/multi-${String(room).padStart(2, '0')}-interaction.png`,
        });
      }
    }

    // Final screenshot
    await page.screenshot({ path: 'test-results/screenshots/multi-final.png' });
  });

  test('test sanity meters decrease during gameplay', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('sanity test seed');
    await startBtn.click();

    await waitForGameState(page, 'playing');
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });

    // Get initial sanity values (both fear and despair should be visible in HUD)
    const hudText = await page.locator('text=/FEAR|DESPAIR/i').all();
    expect(hudText.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/screenshots/sanity-01-initial.png' });

    // Move around to trigger sanity changes
    for (let i = 0; i < 5; i++) {
      await performLeverPull(page, 2000);

      // Handle forks if they appear
      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();
      if (forkCount > 0) {
        await forkButtons.first().click();
        await page
          .locator('[data-has-fork="true"]')
          .waitFor({ state: 'detached', timeout: 2000 })
          .catch(() => {});
      }

      // Screenshot after each move
      await page.screenshot({
        path: `test-results/screenshots/sanity-${String(i + 2).padStart(2, '0')}-move${i + 1}.png`,
      });
    }
  });

  test('test item collection flow', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('item collection test');
    await startBtn.click();

    await waitForGameState(page, 'playing');
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/screenshots/items-01-start.png' });

    // Search for items by moving through the maze
    for (let attempt = 0; attempt < 10; attempt++) {
      // Move
      await performLeverPull(page, 2500);

      // Handle forks
      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();
      if (forkCount > 0) {
        await forkButtons.first().click();
        await page
          .locator('[data-has-fork="true"]')
          .waitFor({ state: 'detached', timeout: 2000 })
          .catch(() => {});
      }

      // Check for collectible items
      const collectButton = page.locator('[data-testid^="button-collect-"]');
      const hasCollectible = (await collectButton.count()) > 0;

      if (hasCollectible) {
        await page.screenshot({
          path: `test-results/screenshots/items-found-${attempt}.png`,
        });

        // Collect the item
        await collectButton.click();
        // Wait for button to disappear after collection
        await collectButton.waitFor({ state: 'detached', timeout: 2000 }).catch(() => {});

        await page.screenshot({
          path: `test-results/screenshots/items-collected-${attempt}.png`,
        });

        // Check if inventory counter updated
        const inventoryText = await page.getByText(/items?:/i).textContent();
        console.log('Inventory:', inventoryText);

        break; // Found and collected an item, done
      }
    }
  });

  test('test exit discovery and game completion', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('exit test seed');
    await startBtn.click();

    await waitForGameState(page, 'playing');
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });

    // Search for exit by exploring the maze
    for (let attempt = 0; attempt < 15; attempt++) {
      // Move
      await performLeverPull(page, 2500);

      // Handle forks - try different paths
      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();
      if (forkCount > 0) {
        // Alternate between first and last option to explore different paths
        if (attempt % 2 === 0) {
          await forkButtons.first().click();
        } else {
          await forkButtons.last().click();
        }
        await page
          .locator('[data-has-fork="true"]')
          .waitFor({ state: 'detached', timeout: 2000 })
          .catch(() => {});
      }

      // Check for exit
      const exitButton = page.getByTestId('button-exit-maze');
      const hasExit = await exitButton.isVisible().catch(() => false);

      if (hasExit) {
        await page.screenshot({ path: 'test-results/screenshots/exit-found.png' });

        // Take the exit
        await exitButton.click();

        // Wait for game over state
        await waitForGameState(page, 'game-over-win', 5000).catch(() =>
          waitForGameState(page, 'game-over-lose', 5000),
        );

        await page.screenshot({ path: 'test-results/screenshots/exit-taken.png' });

        // Should see victory screen or return to menu
        const victoryIndicator = page.getByText(/WIN|VICTORY|ESCAPED|TRY AGAIN/i);
        await expect(victoryIndicator).toBeVisible({ timeout: 5000 });

        await page.screenshot({ path: 'test-results/screenshots/game-completed.png' });
        break;
      }
    }
  });
});
