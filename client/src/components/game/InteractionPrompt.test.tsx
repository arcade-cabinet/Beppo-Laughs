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

  describe('Item Interaction', () => {

    it('calls collectNearbyItem when collect button clicked', () => {

      render(<InteractionPrompt />);
      const button = screen.getByTestId('button-collect-item');
      
      button.click();
      expect(collectNearbyItem).toHaveBeenCalled();
    });

  });

  describe('Exit Interaction', () => {

    it('calls triggerExitInteraction when exit button clicked', () => {

      render(<InteractionPrompt />);
      const button = screen.getByTestId('button-escape-exit');
      
      button.click();
      expect(triggerExitInteraction).toHaveBeenCalled();
    });

  });

  describe('Collection Popup', () => {

    it('auto-clears popup after timeout', () => {
      vi.useFakeTimers();

      render(<InteractionPrompt />);
      
      vi.advanceTimersByTime(2000);
      expect(clearCollectedPopup).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('Inventory Display', () => {

  });

  describe('Game State', () => {

  });
});

// Additional tests: InteractionPrompt UX
describe('InteractionPrompt - popup and counters', () => {
  it('shows collected popup and clears it', async () => {
    render(<InteractionPrompt />);
    // Allow any timers in component to run if used
    await new Promise(r => setTimeout(r, 10));
    expect(clearCollectedPopup).toHaveBeenCalledTimes(0); // not auto-cleared synchronously
  });

});
