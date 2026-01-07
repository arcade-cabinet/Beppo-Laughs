# Test Runner Agent

## Description
Runs and manages tests for an **Astro 5 + React** project with Vitest and Playwright.

## Project-Specific Commands

```bash
# Unit Tests (Vitest)
pnpm run test           # Run all unit tests
pnpm run test:watch     # Watch mode
pnpm run test:coverage  # With coverage report

# E2E Tests (Playwright)
pnpm run test:e2e       # Run all E2E tests
pnpm run test:e2e:ui    # Run with UI mode

# Build Verification
pnpm run build          # Astro check + build (must pass)
pnpm run preview        # Test production build
```

## Capabilities
- Run Vitest unit tests
- Run Playwright E2E tests
- Generate coverage reports
- Identify flaky tests
- Verify Astro build

## Instructions

### Running Tests

#### Unit Tests
Located in:
- `client/src/**/*.test.ts`
- `client/src/**/*.test.tsx`
- `shared/**/*.test.ts`

```bash
pnpm run test                # Run all
pnpm run test:watch          # Watch mode
pnpm run test:coverage       # Coverage report
```

#### E2E Tests  
Located in `e2e/` directory:
- `full-gameplay.spec.ts` - Complete gameplay flows
- `mobile-controls.spec.ts` - Mobile device testing
- `horror-mechanics.spec.ts` - Sanity system testing

```bash
pnpm run test:e2e            # Headless mode
pnpm run test:e2e:ui         # UI mode (debugging)
```

### Test File Locations

| Test Type | Location | Framework |
|-----------|----------|-----------|
| Unit | `client/src/**/*.test.{ts,tsx}` | Vitest |
| Unit | `shared/**/*.test.ts` | Vitest |
| E2E | `e2e/*.spec.ts` | Playwright |

### Writing New Tests

#### Vitest Unit Test (React Components)
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const { user } = render(<MyComponent />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

#### Playwright E2E Test
```typescript
import { test, expect } from '@playwright/test';

test('should complete gameplay sequence', async ({ page }) => {
  await page.goto('http://localhost:5000');
  
  // Use role selectors
  await expect(page.getByRole('heading', { name: 'BEPPO LAUGHS' })).toBeVisible();
  
  // Use test IDs
  await page.getByTestId('button-start-game').click();
  
  // Verify game started
  await expect(page.getByText('FEAR')).toBeVisible();
  
  // Capture screenshot
  await page.screenshot({ path: 'test-results/gameplay.png' });
});
```

### Astro-Specific Testing

#### Testing Astro Pages
Astro pages use SSG - test the build output:
```bash
# Build first
pnpm run build

# Preview production
pnpm run preview

# Run E2E against preview
pnpm run test:e2e
```

#### Testing React Islands
Test React components in isolation (unit tests), then integration via E2E.

### Debugging Failed Tests

1. **Check test output** for error messages
2. **Run in isolation** to rule out test interference
   ```bash
   pnpm run test -- MyComponent.test.ts
   pnpm run test:e2e -- full-gameplay.spec.ts
   ```
3. **Check for async issues** - ensure proper awaits
4. **Verify test data** - ensure fixtures are correct
5. **Check environment** - CI vs local differences
6. **Use Playwright UI** for E2E debugging
   ```bash
   pnpm run test:e2e:ui
   ```

### Coverage Guidelines

- Aim for 80%+ coverage on critical paths
- 100% coverage on security-sensitive code
- Test Three.js components via E2E (unit testing 3D is hard)
- Don't chase coverage metrics at expense of quality

### Playwright Screenshot Testing

E2E tests capture screenshots for visual regression:
```typescript
await page.screenshot({
  path: 'test-results/screenshots/room-1.png',
  fullPage: true
});
```

Screenshots stored in `test-results/screenshots/` (gitignored)

### Flaky Test Identification

If tests fail intermittently:
1. Add retry logic for network-dependent operations
2. Use `waitForTimeout` sparingly (prefer explicit waits)
3. Check for race conditions in Three.js scene loading
4. Use Playwright's built-in retry mechanisms

```typescript
// Good: Wait for element
await expect(page.getByText('Loaded')).toBeVisible({ timeout: 10000 });

// Bad: Arbitrary timeout
await page.waitForTimeout(5000);
```

### CI Testing

Tests run automatically in GitHub Actions:
- Unit tests: Always run
- E2E tests: Run on PR
- Build verification: Always run

Check `.github/workflows/` for GitHub Actions CI configuration.

