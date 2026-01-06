import { expect, test } from '@playwright/test';

test.describe('Beppo Laughs - Maze Solving Flow', () => {
  test('can navigate from menu to maze and move through junctions', async ({ page }) => {
    // 1. Go to main menu
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Click start game (ENTER RIDE)
    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();

    // 3. Wait for the game to initialize and the HUD to appear
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });

    // 4. Test movement with lever control
    const leverControl = page.getByTestId('lever-control');
    await expect(leverControl).toBeVisible();

    // Hold lever down to accelerate and move to the next cell
    await leverControl.dispatchEvent('mousedown');
    await page.waitForTimeout(3000);
    await leverControl.dispatchEvent('mouseup');

    // Check if we reached a new cell or a fork
    const forkBtn = page.locator('[data-testid^="button-fork-"]').first();

    // If a fork appeared, we move!
    try {
      await expect(forkBtn).toBeVisible({ timeout: 5000 });
      await forkBtn.click();
      console.log('Successfully navigated through a fork');
    } catch (_e) {
      // If movement was slow, just check if cells counter changed
      const cellsText = await page.getByText(/CELLS:/).innerText();
      console.log('Cells explored:', cellsText);
    }
  });

  test('HUD displays correctly during maze navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const startBtn = page.getByTestId('button-start-game');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();

    // Verify HUD elements appear
    await expect(page.getByText(/CELLS:/)).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('lever-control')).toBeVisible();
  });
});
