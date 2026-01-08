# Testing Standards for Beppo Laughs

This document defines the **mandatory testing standards** for the Beppo Laughs codebase. All PRs must meet these standards before merge.

## Coverage Requirements

| Category | Minimum Coverage | Target |
|----------|-----------------|--------|
| Pure Functions (game logic, utilities) | **90%** | 100% |
| React Components (non-R3F) | **80%** | 95% |
| R3F Components (with test-renderer) | **70%** | 85% |
| Zustand Store Actions | **95%** | 100% |
| E2E Critical Paths | **100%** | 100% |

**No excuses. No "renders without crashing" padding. Real tests for real behavior.**

## Testing Libraries

### Required Dependencies

```json
{
  "devDependencies": {
    "@react-three/test-renderer": "^9.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "vitest": "^4.0.0",
    "@vitest/coverage-v8": "^4.0.0",
    "@playwright/test": "^1.0.0"
  }
}
```

### When to Use Each

| Library | Use For |
|---------|---------|
| `@react-three/test-renderer` | **All R3F components** - mesh props, events, scene graph |
| `@testing-library/react` | DOM components, UI, forms |
| `vitest` | Unit tests, pure functions, hooks |
| `@playwright/test` | E2E tests, user flows, integration |

## Unit Test Standards

### ❌ FORBIDDEN - Smoke Tests

These are **not acceptable** as the only tests:

```typescript
// ❌ GARBAGE - This tests nothing
it('renders without crashing', () => {
  render(<Component />);
  expect(container).toBeDefined();
});

// ❌ GARBAGE - Same thing with different words
it('accepts props', () => {
  expect(() => render(<Component prop={value} />)).not.toThrow();
});
```

### ✅ REQUIRED - Behavioral Tests

Every test must verify **actual behavior**:

```typescript
// ✅ GOOD - Tests actual behavior
it('increases fear when villain is within detection range', () => {
  const { result } = renderHook(() => useVillainProximity(villainPos, playerPos));
  expect(result.current.fearIncrease).toBe(15);
});

// ✅ GOOD - Tests state transitions
it('transitions from IDLE to MOVING when accelerating', () => {
  const store = createTestStore();
  store.getState().setAccelerating(true);
  expect(store.getState().playerState).toBe('MOVING');
});

// ✅ GOOD - Tests edge cases
it('clamps speed to max when holding accelerate too long', () => {
  const store = createTestStore();
  store.getState().setAccelerating(true);
  advanceTimers(10000); // 10 seconds
  expect(store.getState().carSpeed).toBe(MAX_SPEED);
});
```

### R3F Component Testing with `@react-three/test-renderer`

```typescript
import ReactThreeTestRenderer from '@react-three/test-renderer';

describe('RailPlayer', () => {
  it('updates camera position when moving along rail', async () => {
    const store = createTestStore();
    const renderer = await ReactThreeTestRenderer.create(
      <RailPlayer geometry={mockGeometry} />
    );

    const camera = renderer.scene.children.find(c => c.type === 'PerspectiveCamera');
    const initialPos = { ...camera.props.position };

    // Simulate movement
    await act(async () => {
      store.getState().setAccelerating(true);
      await renderer.advanceFrames(10, 16);
    });

    expect(camera.props.position.z).not.toBe(initialPos.z);
  });

  it('rotates camera when selecting fork direction', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <RailPlayer geometry={mockGeometry} />
    );

    const group = renderer.scene.children[0];
    const initialRotation = group.props.rotation.y;

    await renderer.fireEvent(group, 'selectFork', { direction: 'left' });

    expect(group.props.rotation.y).toBe(initialRotation - Math.PI / 2);
  });
});
```

### Zustand Store Testing

```typescript
import { createStore } from 'zustand';
import { gameStoreSlice } from './store';

describe('Game Store', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore(gameStoreSlice);
  });

  describe('movement actions', () => {
    it('setAccelerating updates carSpeed over time', () => {
      const { setAccelerating, carSpeed } = store.getState();

      expect(carSpeed).toBe(0);
      setAccelerating(true);

      vi.advanceTimersByTime(1000);
      expect(store.getState().carSpeed).toBeGreaterThan(0);
    });

    it('completeMove updates currentNode and visitedNodes', () => {
      const { completeMove, currentNode, visitedNodes } = store.getState();

      completeMove('node-2');

      expect(store.getState().currentNode).toBe('node-2');
      expect(store.getState().visitedNodes).toContain('node-2');
    });
  });

  describe('sanity system', () => {
    it('increaseFear caps at 100', () => {
      store.getState().increaseFear(150);
      expect(store.getState().fear).toBe(100);
    });

    it('triggers game over when fear + despair >= 200', () => {
      store.getState().increaseFear(100);
      store.getState().increaseDespair(100);
      expect(store.getState().isGameOver).toBe(true);
    });
  });
});
```

### Pure Function Testing

```typescript
import { generateMaze } from './maze/core';
import { buildSpawnPlan } from './spawnPlan';

describe('generateMaze', () => {
  it('produces deterministic output for same seed', () => {
    const maze1 = generateMaze(13, 13, 'test-seed');
    const maze2 = generateMaze(13, 13, 'test-seed');

    expect(maze1.cells).toEqual(maze2.cells);
    expect(maze1.exits).toEqual(maze2.exits);
  });

  it('always has exactly one center cell', () => {
    const maze = generateMaze(13, 13, 'any-seed');
    const centers = maze.cells.filter(c => c.isCenter);
    expect(centers).toHaveLength(1);
  });

  it('has 4 exits on the perimeter', () => {
    const maze = generateMaze(13, 13, 'any-seed');
    expect(maze.exits).toHaveLength(4);
    maze.exits.forEach(exit => {
      expect(
        exit.x === 0 || exit.x === 12 || exit.y === 0 || exit.y === 12
      ).toBe(true);
    });
  });

  it('all cells are reachable from center', () => {
    const maze = generateMaze(13, 13, 'any-seed');
    const visited = new Set<string>();
    const queue = [maze.center];

    while (queue.length > 0) {
      const cell = queue.shift()!;
      if (visited.has(cell.id)) continue;
      visited.add(cell.id);
      cell.connections.forEach(c => queue.push(maze.getCell(c)));
    }

    expect(visited.size).toBe(maze.cells.length);
  });
});
```

## E2E Test Standards

### ❌ FORBIDDEN - waitForTimeout

```typescript
// ❌ NEVER DO THIS - Flaky, slow, unreliable
await page.waitForTimeout(2000);
await page.screenshot({ path: 'screenshot.png' });
```

### ✅ REQUIRED - Condition-Based Waits

```typescript
// ✅ GOOD - Wait for actual conditions
await expect(page.getByTestId('game-canvas')).toBeVisible();
await expect(page.getByText(/CELLS:/)).toBeVisible();

// ✅ GOOD - Wait for state changes
await expect(page.getByTestId('fear-meter')).toHaveAttribute('data-value', '15');

// ✅ GOOD - Wait for animations to complete
await page.waitForFunction(() => {
  const canvas = document.querySelector('canvas');
  return canvas && canvas.getContext('webgl2');
});
```

### E2E Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('button-start-game')).toBeVisible();
  });

  test('player can navigate through maze and collect items', async ({ page }) => {
    // Start game with deterministic seed
    await page.getByTestId('input-seed').fill('test-seed-123');
    await page.getByTestId('button-start-game').click();

    // Verify game loaded
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.getByText(/CELLS:/)).toBeVisible();

    // Move through maze
    const lever = page.getByTestId('lever-control');
    await lever.dispatchEvent('pointerdown');

    // Wait for movement to complete (not timeout!)
    await expect(page.getByTestId('current-cell')).not.toHaveText('center');

    await lever.dispatchEvent('pointerup');

    // Verify state changed
    const cellText = await page.getByTestId('current-cell').textContent();
    expect(cellText).not.toBe('center');
  });

  test('game over triggers when sanity depletes', async ({ page }) => {
    await page.getByTestId('input-seed').fill('villain-heavy-seed');
    await page.getByTestId('button-start-game').click();

    // Navigate toward villains (known positions for this seed)
    // ... movement code ...

    // Verify game over state
    await expect(page.getByTestId('game-over-screen')).toBeVisible();
    await expect(page.getByText(/You lost your mind/)).toBeVisible();
  });
});
```

## Test File Organization

```
client/src/
├── components/
│   └── game/
│       ├── RailPlayer.tsx
│       ├── RailPlayer.test.tsx      # Unit tests
│       └── __snapshots__/           # Snapshot tests (if needed)
├── game/
│   ├── store.ts
│   ├── store.test.ts                # Store action tests
│   ├── maze/
│   │   ├── core.ts
│   │   ├── core.test.ts             # Maze generation tests
│   │   ├── geometry.ts
│   │   └── geometry.test.ts         # Geometry tests
│   └── spawnPlan.ts
│       └── spawnPlan.test.ts        # Spawn logic tests
e2e/
├── gameplay.spec.ts                  # Core gameplay flow
├── navigation.spec.ts                # Maze navigation
├── combat.spec.ts                    # Villain encounters
├── collection.spec.ts                # Item collection
└── accessibility.spec.ts             # A11y tests
```

## Pre-Commit Checklist

Before submitting a PR with tests:

- [ ] **No smoke-only tests** - Every component has behavioral tests
- [ ] **Coverage meets thresholds** - Check with `pnpm test:coverage`
- [ ] **No waitForTimeout** - E2E tests use condition-based waits
- [ ] **R3F uses test-renderer** - Not jsdom mocking hacks
- [ ] **Store fully tested** - All actions have tests
- [ ] **Edge cases covered** - Boundary conditions, error states
- [ ] **Deterministic** - Tests pass reliably, no flakiness

## Running Tests

```bash
# Unit tests
pnpm test                    # Run all unit tests
pnpm test:watch              # Watch mode
pnpm test:coverage           # With coverage report

# E2E tests
pnpm test:e2e                # Run all E2E tests
pnpm test:e2e:ui             # Interactive UI mode

# Coverage requirements
pnpm test:coverage -- --coverage.thresholds.lines=80
```

## References

- [React Three Fiber Testing Docs](https://r3f.docs.pmnd.rs/api/testing)
- [@react-three/test-renderer](https://www.npmjs.com/package/@react-three/test-renderer)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
