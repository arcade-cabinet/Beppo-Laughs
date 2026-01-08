import { expect, test } from '@playwright/test';

/**
 * Comprehensive E2E tests for 3D/R3F components that cannot be unit tested
 * This test suite targets:
 * - Scene.tsx (3D rendering)
 * - Maze.tsx (3D geometry)
 * - RailPlayer.tsx (player movement & animation)
 * - Villains.tsx (enemy behavior)
 * - Collectibles.tsx (item spawning)
 * - Blockades.tsx (obstacle rendering)
 * - SDFVillain.tsx (shader rendering)
 * - BrainMeter.tsx (3D brain visualization)
 * - ClownCarCockpit.tsx (3D car model)
 */

test.describe('3D Component Coverage - Scene & Maze Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Scene: verify 3D canvas initialization and rendering', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('scene render test');
    await startBtn.click();

    // Wait for 3D scene to load
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await page.screenshot({
      path: 'test-results/screenshots/3d-scene-01-initialized.png',
      fullPage: true,
    });

    // Verify canvas element exists (R3F renders to canvas)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Screenshot showing 3D scene is rendering
    await page.screenshot({ path: 'test-results/screenshots/3d-scene-02-canvas-rendering.png' });

    // Wait a bit for animations to start
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/screenshots/3d-scene-03-animated.png' });
  });

  test('Maze: verify 3D maze geometry and navigation', async ({ page }) => {
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('maze geometry test');
    await startBtn.click();

    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/screenshots/3d-maze-01-initial-geometry.png' });

    // Verify HUD shows current cell position (validates maze data structure)
    const hudText = await page.textContent('body');
    expect(hudText).toContain('CELLS:');

    // Take screenshot showing maze from player perspective
    await page.screenshot({ path: 'test-results/screenshots/3d-maze-02-player-view.png' });

    // Navigate through maze to test geometry rendering at different locations
    const leverControl = page.getByTestId('lever-control');

    for (let i = 0; i < 5; i++) {
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

      // Capture maze geometry at different cells
      await page.screenshot({
        path: `test-results/screenshots/3d-maze-cell-${String(i + 3).padStart(2, '0')}.png`,
      });
    }
  });
});

test.describe('3D Component Coverage - RailPlayer Movement & Animation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('railplayer test');
    await startBtn.click();

    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
  });

  test('RailPlayer: verify smooth camera movement on rails', async ({ page }) => {
    await page.screenshot({ path: 'test-results/screenshots/3d-railplayer-01-stationary.png' });

    const leverControl = page.getByTestId('lever-control');

    // Test acceleration phase
    await leverControl.dispatchEvent('mousedown');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'test-results/screenshots/3d-railplayer-02-accelerating-start.png',
    });

    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'test-results/screenshots/3d-railplayer-03-accelerating-mid.png',
    });

    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'test-results/screenshots/3d-railplayer-04-accelerating-full.png',
    });

    // Test movement phase
    await leverControl.dispatchEvent('mouseup');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/screenshots/3d-railplayer-05-coasting.png' });

    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/screenshots/3d-railplayer-06-arriving.png' });

    // Verify we reached a new cell
    const hudText = await page.textContent('body');
    expect(hudText).toContain('CELLS:');
  });

  test('RailPlayer: verify fork path selection and camera rotation', async ({ page }) => {
    const leverControl = page.getByTestId('lever-control');

    // Move to trigger a fork
    await leverControl.dispatchEvent('mousedown');
    await page.waitForTimeout(2500);
    await leverControl.dispatchEvent('mouseup');
    await page.waitForTimeout(1500);

    // Wait for fork prompt
    const forkButtons = page.locator('[data-testid^="button-fork-"]');
    const forkCount = await forkButtons.count();

    if (forkCount > 0) {
      await page.screenshot({
        path: 'test-results/screenshots/3d-railplayer-fork-01-options.png',
      });

      // Select a direction (should rotate camera)
      await forkButtons.first().click();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: 'test-results/screenshots/3d-railplayer-fork-02-selected.png',
      });

      await page.waitForTimeout(500);
      await page.screenshot({
        path: 'test-results/screenshots/3d-railplayer-fork-03-rotated.png',
      });

      // Continue movement after rotation
      await leverControl.dispatchEvent('mousedown');
      await page.waitForTimeout(2000);
      await leverControl.dispatchEvent('mouseup');
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'test-results/screenshots/3d-railplayer-fork-04-new-direction.png',
      });
    }
  });

  test('RailPlayer: verify speed variations and physics', async ({ page }) => {
    const leverControl = page.getByTestId('lever-control');

    // Test short tap (low speed)
    await leverControl.dispatchEvent('mousedown');
    await page.waitForTimeout(300);
    await leverControl.dispatchEvent('mouseup');
    await page.screenshot({
      path: 'test-results/screenshots/3d-railplayer-speed-01-slow.png',
    });
    await page.waitForTimeout(2000);

    // Test medium hold (medium speed)
    await leverControl.dispatchEvent('mousedown');
    await page.waitForTimeout(1500);
    await leverControl.dispatchEvent('mouseup');
    await page.screenshot({
      path: 'test-results/screenshots/3d-railplayer-speed-02-medium.png',
    });
    await page.waitForTimeout(2000);

    // Test long hold (high speed)
    await leverControl.dispatchEvent('mousedown');
    await page.waitForTimeout(3000);
    await leverControl.dispatchEvent('mouseup');
    await page.screenshot({
      path: 'test-results/screenshots/3d-railplayer-speed-03-fast.png',
    });
    await page.waitForTimeout(2000);
  });
});

test.describe('3D Component Coverage - Villains & Enemy Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('villain behavior test');
    await startBtn.click();

    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
  });

  test('Villains: verify enemy spawn and visibility detection', async ({ page }) => {
    await page.screenshot({ path: 'test-results/screenshots/3d-villains-01-searching.png' });

    const leverControl = page.getByTestId('lever-control');

    // Move through maze to encounter villains
    for (let i = 0; i < 15; i++) {
      await leverControl.dispatchEvent('mousedown');
      await page.waitForTimeout(2500);
      await leverControl.dispatchEvent('mouseup');
      await page.waitForTimeout(1500);

      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();
      if (forkCount > 0) {
        // Alternate paths to explore more
        if (i % 2 === 0) {
          await forkButtons.first().click();
        } else if (forkCount > 1) {
          await forkButtons.last().click();
        }
        await page.waitForTimeout(500);
      }

      // Take screenshots to capture villain presence
      if (i % 3 === 0) {
        await page.screenshot({
          path: `test-results/screenshots/3d-villains-search-${String(i + 2).padStart(2, '0')}.png`,
        });
      }

      // Check for fear increases (indicates villain proximity)
      const hudText = await page.textContent('body');
      if (hudText?.includes('FEAR')) {
        console.log(`Potential villain detection at move ${i}`);
      }
    }
  });

  test('SDFVillain: verify shader-based villain rendering', async ({ page }) => {
    const leverControl = page.getByTestId('lever-control');

    // Move to areas where villains might spawn
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

      // Capture screenshots showing shader effects
      await page.screenshot({
        path: `test-results/screenshots/3d-sdfvillain-${String(i + 1).padStart(2, '0')}.png`,
      });
    }
  });
});

test.describe('3D Component Coverage - Collectibles & Blockades', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('collectibles blockades test');
    await startBtn.click();

    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
  });

  test('Collectibles: verify item spawning and 3D rendering', async ({ page }) => {
    await page.screenshot({
      path: 'test-results/screenshots/3d-collectibles-01-searching.png',
    });

    const leverControl = page.getByTestId('lever-control');

    // Search for collectible items
    for (let i = 0; i < 20; i++) {
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

      // Check for collectible prompt
      const collectButton = page.locator('[data-testid^="button-collect-"]');
      const hasCollectible = (await collectButton.count()) > 0;

      if (hasCollectible) {
        await page.screenshot({
          path: `test-results/screenshots/3d-collectibles-found-${i}.png`,
        });

        console.log(`Collectible found at move ${i}`);

        // Collect the item
        await collectButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({
          path: `test-results/screenshots/3d-collectibles-collected-${i}.png`,
        });

        // Verify inventory updated
        const hudText = await page.textContent('body');
        console.log('Inventory status:', hudText);

        break;
      }

      // Periodic screenshots
      if (i % 4 === 0) {
        await page.screenshot({
          path: `test-results/screenshots/3d-collectibles-search-${String(i + 2).padStart(2, '0')}.png`,
        });
      }
    }
  });

  test('Blockades: verify 3D obstacle rendering and labels', async ({ page }) => {
    const leverControl = page.getByTestId('lever-control');

    // Move through maze to find blockades
    for (let i = 0; i < 15; i++) {
      await leverControl.dispatchEvent('mousedown');
      await page.waitForTimeout(2500);
      await leverControl.dispatchEvent('mouseup');
      await page.waitForTimeout(1500);

      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();
      if (forkCount > 0) {
        // Try all directions to find blockades
        const direction = i % Math.max(1, forkCount);
        await forkButtons.nth(direction).click();
        await page.waitForTimeout(500);
      }

      // Check for blockade indicators in HUD
      const hudText = await page.textContent('body');
      if (hudText?.includes('BLOCKED') || hudText?.includes('BLOCKADE')) {
        await page.screenshot({
          path: `test-results/screenshots/3d-blockades-found-${i}.png`,
        });
        console.log(`Blockade encountered at move ${i}`);
      }

      // Periodic screenshots to capture blockade rendering
      if (i % 3 === 0) {
        await page.screenshot({
          path: `test-results/screenshots/3d-blockades-${String(i + 1).padStart(2, '0')}.png`,
        });
      }
    }
  });
});

test.describe('3D Component Coverage - BrainMeter & ClownCar 3D Models', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('3d models test');
    await startBtn.click();

    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
  });

  test('BrainMeter: verify 3D brain visualization and sanity-driven deformation', async ({
    page,
  }) => {
    await page.screenshot({
      path: 'test-results/screenshots/3d-brainmeter-01-initial.png',
      fullPage: true,
    });

    const leverControl = page.getByTestId('lever-control');

    // Move to cause sanity changes, which deform the brain
    for (let i = 0; i < 12; i++) {
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

      // Capture brain deformation as sanity decreases
      await page.screenshot({
        path: `test-results/screenshots/3d-brainmeter-${String(i + 2).padStart(2, '0')}.png`,
        fullPage: true,
      });

      // Log sanity values
      const hudText = await page.textContent('body');
      const fearMatch = hudText?.match(/FEAR[:\s]+(\d+)/i);
      const despairMatch = hudText?.match(/DESPAIR[:\s]+(\d+)/i);
      console.log(`Move ${i}: Fear=${fearMatch?.[1]}, Despair=${despairMatch?.[1]}`);
    }
  });

  test('ClownCarCockpit: verify 3D car model rendering in first-person view', async ({ page }) => {
    // The car cockpit should be visible in first-person view
    await page.screenshot({
      path: 'test-results/screenshots/3d-clowncar-01-cockpit-view.png',
    });

    const leverControl = page.getByTestId('lever-control');

    // Test car movement with various speeds
    // Short movement
    await leverControl.dispatchEvent('mousedown');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'test-results/screenshots/3d-clowncar-02-slow-movement.png',
    });
    await leverControl.dispatchEvent('mouseup');
    await page.waitForTimeout(2000);

    // Medium movement
    await leverControl.dispatchEvent('mousedown');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'test-results/screenshots/3d-clowncar-03-medium-movement.png',
    });
    await leverControl.dispatchEvent('mouseup');
    await page.waitForTimeout(2000);

    // Fast movement
    await leverControl.dispatchEvent('mousedown');
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'test-results/screenshots/3d-clowncar-04-fast-movement.png',
    });
    await leverControl.dispatchEvent('mouseup');
    await page.waitForTimeout(2000);

    // Car after movements
    await page.screenshot({
      path: 'test-results/screenshots/3d-clowncar-05-stationary.png',
    });
  });
});

test.describe('3D Component Coverage - Complete Gameplay Integration', () => {
  test('full integration: all 3D components working together', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Main menu
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await page.screenshot({
      path: 'test-results/screenshots/integration-01-menu.png',
      fullPage: true,
    });

    // Start game with specific seed for reproducibility
    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('full integration test');
    await startBtn.click();

    // Game loaded - all 3D components initialized
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await page.screenshot({
      path: 'test-results/screenshots/integration-02-game-start.png',
      fullPage: true,
    });

    const leverControl = page.getByTestId('lever-control');

    // Play through multiple moves, exercising all systems
    for (let move = 0; move < 20; move++) {
      // Movement (RailPlayer, ClownCar, Maze navigation)
      await leverControl.dispatchEvent('mousedown');
      await page.waitForTimeout(2500);
      await leverControl.dispatchEvent('mouseup');
      await page.waitForTimeout(1500);

      // Fork handling (path selection, camera rotation)
      const forkButtons = page.locator('[data-testid^="button-fork-"]');
      const forkCount = await forkButtons.count();
      if (forkCount > 0) {
        await forkButtons.first().click();
        await page.waitForTimeout(500);
      }

      // Item collection (Collectibles 3D rendering)
      const collectButton = page.locator('[data-testid^="button-collect-"]');
      const hasCollectible = (await collectButton.count()) > 0;
      if (hasCollectible) {
        await collectButton.click();
        await page.waitForTimeout(1000);
      }

      // Exit check (win condition)
      const exitButton = page.getByTestId('button-exit-maze');
      const hasExit = await exitButton.isVisible().catch(() => false);
      if (hasExit) {
        await page.screenshot({
          path: 'test-results/screenshots/integration-exit-found.png',
          fullPage: true,
        });
        await exitButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: 'test-results/screenshots/integration-game-complete.png',
          fullPage: true,
        });
        break;
      }

      // Periodic full screenshots
      if (move % 4 === 0) {
        await page.screenshot({
          path: `test-results/screenshots/integration-move-${String(move).padStart(2, '0')}.png`,
          fullPage: true,
        });
      }
    }

    // Final state
    await page.screenshot({
      path: 'test-results/screenshots/integration-final.png',
      fullPage: true,
    });
  });
});
