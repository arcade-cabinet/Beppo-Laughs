import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ForkPrompt } from './ForkPrompt';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn(() => ({
    pendingFork: null,
    selectForkDirection: vi.fn(),
    isGameOver: false,
    hasWon: false,
  })),
}));

describe('ForkPrompt', () => {
  it('renders without crashing', () => {
    const { container } = render(<ForkPrompt />);
    expect(container).toBeDefined();
  });

  it('returns null when no pending fork', () => {
    const { container } = render(<ForkPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it('can be mounted and unmounted without errors', () => {
    const { unmount } = render(<ForkPrompt />);
    expect(() => unmount()).not.toThrow();
  });
});

// Additional tests: ForkPrompt interactions
describe('ForkPrompt - interactions and visibility', () => {
  it('invokes selectForkDirection on left/right buttons', () => {
    const selectForkDirection = vi.fn();
    const { useGameStore } = require('../../game/store');
    useGameStore.mockImplementation(() => ({
      pendingFork: { nodeId: 'n1', options: [{ direction: 'left' }, { direction: 'right' }] },
      selectForkDirection,
      isGameOver: false, hasWon: false,
    }));
    const { getByText } = render(<ForkPrompt />);
    getByText(/left/i).click();
    getByText(/right/i).click();
    expect(selectForkDirection).toHaveBeenCalledTimes(2);
  });

  it('returns null when game is over or won', () => {
    const { useGameStore } = require('../../game/store');
    useGameStore.mockImplementation(() => ({ pendingFork: { nodeId:'n1', options: [] }, selectForkDirection: vi.fn(), isGameOver: true, hasWon: false }));
    const { container: c1 } = render(<ForkPrompt />);
    expect(c1.firstChild).toBeNull();

    useGameStore.mockImplementation(() => ({ pendingFork: { nodeId:'n1', options: [] }, selectForkDirection: vi.fn(), isGameOver: false, hasWon: true }));
    const { container: c2 } = render(<ForkPrompt />);
    expect(c2.firstChild).toBeNull();
  });
});
