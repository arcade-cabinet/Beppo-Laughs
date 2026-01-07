import { render, screen } from '@testing-library/react';
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
