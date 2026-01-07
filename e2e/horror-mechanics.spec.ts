import { expect, test } from '@playwright/test';

test.describe('Beppo Laughs - Horror Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('verify dual sanity system (fear and despair)', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    
    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('sanity system test');
    await startBtn.click();

    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/screenshots/horror-01-sanity-start.png' });

    // Both meters should be visible in the HUD
    const fearMeter = page.locator('text=/FEAR/i');
    const despairMeter = page.locator('text=/DESPAIR/i');
    
    await expect(fearMeter).toBeVisible();
    await expect(despairMeter).toBeVisible();

    const leverControl = page.getByTestId('lever-control');

    // Explore new areas (should increase fear)
    for (let i = 0; i < 3; i++) {
      await leverControl.dispatchEvent('mousedown');
      await page.waitForTimeout(2500);
      await leverControl.dispatchEvent('mouseup');
      await page.waitForTimeout(1000);

      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();
      if (forkCount > 0) {
        await forkButtons.first().click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({ 
        path: `test-results/screenshots/horror-sanity-move-${i + 1}.png` 
      });
    }

    // Backtrack to increase despair
    await page.screenshot({ path: 'test-results/screenshots/horror-before-backtrack.png' });
  });

  test('verify horror visual effects', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    
    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('visual effects test');
    await startBtn.click();

    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    
    // Take screenshot to capture initial state
    await page.screenshot({ path: 'test-results/screenshots/horror-effects-01.png' });

    const leverControl = page.getByTestId('lever-control');

    // Move through maze to trigger effects
    for (let i = 0; i < 5; i++) {
      await leverControl.dispatchEvent('mousedown');
      await page.waitForTimeout(2500);
      await leverControl.dispatchEvent('mouseup');
      await page.waitForTimeout(1500);

      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();
      if (forkCount > 0) {
        await forkButtons.first().click();
        await page.waitForTimeout(500);
      }

      // Capture screenshots to show progressive horror effects
      await page.screenshot({ 
        path: `test-results/screenshots/horror-effects-${String(i + 2).padStart(2, '0')}.png` 
      });
    }
  });

  test('verify villain encounters', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    
    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('villain encounter test');
    await startBtn.click();

    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });

    const leverControl = page.getByTestId('lever-control');

    // Explore to potentially encounter villains
    for (let i = 0; i < 10; i++) {
      await leverControl.dispatchEvent('mousedown');
      await page.waitForTimeout(2500);
      await leverControl.dispatchEvent('mouseup');
      await page.waitForTimeout(1500);

      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();
      if (forkCount > 0) {
        await forkButtons.first().click();
        await page.waitForTimeout(500);
      }

      // Check for blockades (villain-created obstacles)
      const hudText = await page.textContent('body');
      if (hudText?.includes('BLOCKED') || hudText?.includes('BLOCKADE')) {
        await page.screenshot({ 
          path: `test-results/screenshots/horror-blockade-${i}.png` 
        });
        console.log(`Blockade encountered at move ${i}`);
      }

      // Take periodic screenshots
      if (i % 2 === 0) {
        await page.screenshot({ 
          path: `test-results/screenshots/horror-villain-search-${i}.png` 
        });
      }
    }
  });

  test('verify game over conditions', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    
    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('game over test');
    await startBtn.click();

    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });

    const leverControl = page.getByTestId('lever-control');

    // Move extensively to try to trigger game over
    for (let i = 0; i < 30; i++) {
      // Check if game over occurred
      const restartBtn = page.getByTestId('button-restart');
      const hasGameOver = await restartBtn.isVisible().catch(() => false);
      
      if (hasGameOver) {
        await page.screenshot({ path: 'test-results/screenshots/horror-game-over.png' });
        
        // Verify restart button works
        await restartBtn.click();
        await page.waitForTimeout(1000);
        
        // Should return to main menu
        await expect(page.getByRole('heading', { name: 'BEPPO LAUGHS' })).toBeVisible({ 
          timeout: 5000 
        });
        await page.screenshot({ path: 'test-results/screenshots/horror-after-restart.png' });
        break;
      }

      // Continue moving
      await leverControl.dispatchEvent('mousedown');
      await page.waitForTimeout(2000);
      await leverControl.dispatchEvent('mouseup');
      await page.waitForTimeout(1000);

      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();
      if (forkCount > 0) {
        // Alternate directions to explore more
        if (i % 2 === 0) {
          await forkButtons.first().click();
        } else if (forkCount > 1) {
          await forkButtons.last().click();
        } else {
          await forkButtons.first().click();
        }
        await page.waitForTimeout(500);
      }

      // Periodic screenshots
      if (i % 5 === 0) {
        await page.screenshot({ 
          path: `test-results/screenshots/horror-gameover-attempt-${i}.png` 
        });
      }
    }
  });

  test('verify brain meter visualization', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    
    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('brain meter test');
    await startBtn.click();

    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/screenshots/horror-brain-meter-start.png' });

    const leverControl = page.getByTestId('lever-control');

    // Move to cause sanity changes
    for (let i = 0; i < 8; i++) {
      await leverControl.dispatchEvent('mousedown');
      await page.waitForTimeout(2500);
      await leverControl.dispatchEvent('mouseup');
      await page.waitForTimeout(1500);

      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();
      if (forkCount > 0) {
        await forkButtons.first().click();
        await page.waitForTimeout(500);
      }

      // Capture brain meter state
      await page.screenshot({ 
        path: `test-results/screenshots/horror-brain-meter-${String(i + 1).padStart(2, '0')}.png` 
      });
    }
  });

  test('verify audio triggers (visual confirmation)', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    
    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('audio test');
    await startBtn.click();

    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });

    // Note: We can't directly test audio in Playwright, but we can verify
    // that the game elements that trigger audio are present

    const leverControl = page.getByTestId('lever-control');

    // Interactions that should trigger audio:
    // 1. Starting game
    await page.screenshot({ path: 'test-results/screenshots/horror-audio-game-start.png' });

    // 2. Pulling lever
    await leverControl.dispatchEvent('mousedown');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/screenshots/horror-audio-lever-pull.png' });
    await leverControl.dispatchEvent('mouseup');

    // 3. Moving through maze
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/screenshots/horror-audio-movement.png' });

    // 4. Fork selection
    const forkButtons = page.locator('[data-testid^="button-fork-"]');
    const forkCount = await forkButtons.count();
    if (forkCount > 0) {
      await page.screenshot({ path: 'test-results/screenshots/horror-audio-fork-before.png' });
      await forkButtons.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/horror-audio-fork-after.png' });
    }
  });
});
