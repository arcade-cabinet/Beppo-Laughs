import type { Page } from '@playwright/test';

/**
 * Wait for the game to reach a specific state.
 * @param page - Playwright page object
 * @param state - Expected game state: 'menu', 'playing', 'game-over-win', 'game-over-lose'
 * @param timeout - Maximum time to wait in milliseconds (default: 5000ms)
 */
export async function waitForGameState(
  page: Page,
  state: 'menu' | 'playing' | 'game-over-win' | 'game-over-lose',
  timeout = 5000,
): Promise<void> {
  await page.locator(`[data-game-state="${state}"]`).waitFor({ timeout });
}

/**
 * Wait for the car to be in a specific movement state.
 * @param page - Playwright page object
 * @param moving - Expected movement state: true if moving, false if stopped
 * @param timeout - Maximum time to wait in milliseconds (default: 5000ms)
 */
export async function waitForMovement(page: Page, moving: boolean, timeout = 5000): Promise<void> {
  await page.locator(`[data-moving="${moving}"]`).waitFor({ timeout });
}

/**
 * Wait for a fork prompt to appear.
 * @param page - Playwright page object
 * @param timeout - Maximum time to wait in milliseconds (default: 5000ms)
 */
export async function waitForFork(page: Page, timeout = 5000): Promise<void> {
  await page.locator('[data-has-fork="true"]').waitFor({ timeout });
}

/**
 * Poll the sanity values until either fear or despair changes from the provided previous values.
 * @param page - Playwright page object
 * @param previousFear - Previous fear value to compare against
 * @param previousDespair - Previous despair value to compare against
 * @param timeout - Maximum time to wait in milliseconds (default: 10000ms)
 */
export async function waitForSanityChange(
  page: Page,
  previousFear: number,
  previousDespair: number,
  timeout = 10000,
): Promise<{ fear: number; despair: number }> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const hudElement = await page.locator('[data-fear][data-despair]').first();
    const fearStr = await hudElement.getAttribute('data-fear');
    const despairStr = await hudElement.getAttribute('data-despair');

    const currentFear = parseFloat(fearStr || '0');
    const currentDespair = parseFloat(despairStr || '0');

    if (currentFear !== previousFear || currentDespair !== previousDespair) {
      return { fear: currentFear, despair: currentDespair };
    }

    // Wait a bit before checking again
    await page.waitForTimeout(100);
  }

  throw new Error(
    `Sanity values did not change within ${timeout}ms. Previous: fear=${previousFear}, despair=${previousDespair}`,
  );
}

/**
 * Perform a lever pull action with proper state checking.
 * @param page - Playwright page object
 * @param duration - Duration to hold the lever in milliseconds
 * @param screenshot - Optional screenshot path to capture after lever pull
 */
export async function performLeverPull(
  page: Page,
  duration: number,
  screenshot?: string,
): Promise<void> {
  const leverControl = page.getByTestId('lever-control');

  // Start pulling lever
  await leverControl.dispatchEvent('mousedown');

  // Wait for acceleration to start
  await page.locator('[data-accelerating="true"]').waitFor({ timeout: 1000 });

  // Hold for the specified duration or until we reach a reasonable speed
  const startTime = Date.now();
  while (Date.now() - startTime < duration) {
    const speedStr = await leverControl.getAttribute('data-car-speed');
    const speed = parseFloat(speedStr || '0');

    // If we've reached a decent speed, we can continue
    if (speed > 1.0) {
      break;
    }

    await page.waitForTimeout(100);
  }

  // Release lever
  await leverControl.dispatchEvent('mouseup');

  // Wait for acceleration to stop
  await page.locator('[data-accelerating="false"]').waitFor({ timeout: 1000 });

  // Optional screenshot
  if (screenshot) {
    await page.screenshot({ path: screenshot });
  }
}
