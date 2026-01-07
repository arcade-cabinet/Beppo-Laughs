import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InteractionPrompt } from './InteractionPrompt';

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
    nearbyItem: null,
    nearbyExit: null,
    collectNearbyItem: vi.fn(),
    triggerExitInteraction: vi.fn(),
    showCollectedPopup: null,
    clearCollectedPopup: vi.fn(),
    itemInventory: 0,
    isGameOver: false,
    hasWon: false,
  })),
}));

describe('InteractionPrompt', () => {
  it('renders without crashing', () => {
    const { container } = render(<InteractionPrompt />);
    expect(container).toBeDefined();
  });

  it('can be mounted and unmounted without errors', () => {
    const { unmount } = render(<InteractionPrompt />);
    expect(() => unmount()).not.toThrow();
  });
});
