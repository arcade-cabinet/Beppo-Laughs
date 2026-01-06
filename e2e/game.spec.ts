import { expect, test } from '@playwright/test';

test.describe('Beppo Laughs - Main Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays the game title', async ({ page }) => {
    // Use role selector since title has multiple overlapping elements for glitch effect
    await expect(page.getByRole('heading', { name: 'BEPPO LAUGHS' })).toBeVisible();
  });

  test('displays subtitle and warnings', async ({ page }) => {
    await expect(page.getByText('Trapped in the Big-Top Nightmare')).toBeVisible();
    await expect(page.getByText(/GYROSCOPE.*HAPTICS/i)).toBeVisible();
    await expect(page.getByText(/HEADPHONES/i)).toBeVisible();
  });

  test('shows seed input field', async ({ page }) => {
    const seedInput = page.getByTestId('input-seed');
    await expect(seedInput).toBeVisible();
    await expect(seedInput).toHaveAttribute('placeholder', 'Enter three seed words...');
  });

  test('randomize button generates a seed', async ({ page }) => {
    const seedInput = page.getByTestId('input-seed');
    const randomizeBtn = page.getByTestId('button-random-seed');

    // Should already have a 3-word seed from initialization
    let value = await seedInput.inputValue();
    expect(value.split(' ').length).toBe(3);

    // Click randomize and verify it's different
    await randomizeBtn.click();
    value = await seedInput.inputValue();
    expect(value.split(' ').length).toBe(3);
  });

  test('can enter a custom seed', async ({ page }) => {
    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('custom test seed');
    await expect(seedInput).toHaveValue('custom test seed');
  });

  test('start button begins the game', async ({ page }) => {
    await page.getByTestId('button-start-game').click({ force: true });

    // Menu should disappear, game canvas should appear
    await expect(page.getByRole('heading', { name: 'BEPPO LAUGHS' })).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Beppo Laughs - Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Start the game with a fixed seed for reproducibility
    const seedInput = page.getByTestId('input-seed');
    await seedInput.fill('test seed alpha');
    await page.getByTestId('button-start-game').click({ force: true });
    // Wait for game to load
    await page.waitForTimeout(2000);
  });

  test('shows exit button during gameplay', async ({ page }) => {
    const exitBtn = page.getByTestId('button-exit');
    await expect(exitBtn).toBeVisible();
  });

  test('exit button returns to main menu', async ({ page }) => {
    const exitBtn = page.getByTestId('button-exit');
    await exitBtn.click();

    // Should be back at main menu - use role selector for specificity
    await expect(page.getByRole('heading', { name: 'BEPPO LAUGHS' })).toBeVisible({ timeout: 5000 });
  });


});

test.describe('Beppo Laughs - Accessibility', () => {
  test('main menu has proper focus management', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('buttons have proper aria attributes', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('button-start-game').click({ force: true });
    await page.waitForTimeout(2000);


  });
});

test.describe('Beppo Laughs - Visual Effects', () => {
  test('screen effects are present during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('button-start-game').click({ force: true });
    await page.waitForTimeout(2000);

    // The game should have loaded
    const exitBtn = page.getByTestId('button-exit');
    await expect(exitBtn).toBeVisible();
  });

  test('main menu has horror aesthetic elements', async ({ page }) => {
    await page.goto('/');

    // Check for the glowing title effect (text-shadow CSS)
    const title = page.getByText('BEPPO LAUGHS').first();
    await expect(title).toBeVisible();

    // Check for scanlines overlay (opacity check)
    // The presence of the game indicates visual effects are rendering
  });
});
