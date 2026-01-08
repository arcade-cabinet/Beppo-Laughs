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
    it('shows collect button when nearby item exists', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: { id: 'item1', name: 'Balloon', nodeId: 'node1' },
        nearbyExit: null,
        collectNearbyItem: vi.fn(),
        triggerExitInteraction: vi.fn(),
        showCollectedPopup: null,
        clearCollectedPopup: vi.fn(),
        itemInventory: 0,
        isGameOver: false,
        hasWon: false,
      }));

      render(<InteractionPrompt />);
      
      expect(screen.getByTestId('button-collect-item')).toBeInTheDocument();
      expect(screen.getByText('Balloon')).toBeInTheDocument();
    });

    it('calls collectNearbyItem when collect button clicked', () => {
      const collectNearbyItem = vi.fn();
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: { id: 'item1', name: 'Key', nodeId: 'node1' },
        nearbyExit: null,
        collectNearbyItem,
        triggerExitInteraction: vi.fn(),
        showCollectedPopup: null,
        clearCollectedPopup: vi.fn(),
        itemInventory: 0,
        isGameOver: false,
        hasWon: false,
      }));

      render(<InteractionPrompt />);
      const button = screen.getByTestId('button-collect-item');
      
      button.click();
      expect(collectNearbyItem).toHaveBeenCalled();
    });

    it('hides collect button when no nearby item', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: null,
        nearbyExit: null,
        collectNearbyItem: vi.fn(),
        triggerExitInteraction: vi.fn(),
        showCollectedPopup: null,
        clearCollectedPopup: vi.fn(),
        itemInventory: 0,
        isGameOver: false,
        hasWon: false,
      }));

      render(<InteractionPrompt />);
      
      expect(screen.queryByTestId('button-collect-item')).not.toBeInTheDocument();
    });
  });

  describe('Exit Interaction', () => {
    it('shows exit button when nearby exit exists', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: null,
        nearbyExit: { nodeId: 'exit1' },
        collectNearbyItem: vi.fn(),
        triggerExitInteraction: vi.fn(),
        showCollectedPopup: null,
        clearCollectedPopup: vi.fn(),
        itemInventory: 0,
        isGameOver: false,
        hasWon: false,
      }));

      render(<InteractionPrompt />);
      
      expect(screen.getByTestId('button-escape-exit')).toBeInTheDocument();
      expect(screen.getByText(/ESCAPE!/)).toBeInTheDocument();
    });

    it('calls triggerExitInteraction when exit button clicked', () => {
      const triggerExitInteraction = vi.fn();
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: null,
        nearbyExit: { nodeId: 'exit1' },
        collectNearbyItem: vi.fn(),
        triggerExitInteraction,
        showCollectedPopup: null,
        clearCollectedPopup: vi.fn(),
        itemInventory: 0,
        isGameOver: false,
        hasWon: false,
      }));

      render(<InteractionPrompt />);
      const button = screen.getByTestId('button-escape-exit');
      
      button.click();
      expect(triggerExitInteraction).toHaveBeenCalled();
    });

    it('prioritizes item over exit when both present', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: { id: 'item1', name: 'Key', nodeId: 'node1' },
        nearbyExit: { nodeId: 'exit1' },
        collectNearbyItem: vi.fn(),
        triggerExitInteraction: vi.fn(),
        showCollectedPopup: null,
        clearCollectedPopup: vi.fn(),
        itemInventory: 0,
        isGameOver: false,
        hasWon: false,
      }));

      render(<InteractionPrompt />);
      
      expect(screen.getByTestId('button-collect-item')).toBeInTheDocument();
      expect(screen.queryByTestId('button-escape-exit')).not.toBeInTheDocument();
    });
  });

  describe('Collection Popup', () => {
    it('shows popup after item collection', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: null,
        nearbyExit: null,
        collectNearbyItem: vi.fn(),
        triggerExitInteraction: vi.fn(),
        showCollectedPopup: { name: 'Golden Key', timestamp: Date.now() },
        clearCollectedPopup: vi.fn(),
        itemInventory: 1,
        isGameOver: false,
        hasWon: false,
      }));

      render(<InteractionPrompt />);
      
      expect(screen.getByText('COLLECTED!')).toBeInTheDocument();
      expect(screen.getByText('Golden Key')).toBeInTheDocument();
    });

    it('auto-clears popup after timeout', () => {
      vi.useFakeTimers();
      const clearCollectedPopup = vi.fn();
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: null,
        nearbyExit: null,
        collectNearbyItem: vi.fn(),
        triggerExitInteraction: vi.fn(),
        showCollectedPopup: { name: 'Balloon', timestamp: Date.now() },
        clearCollectedPopup,
        itemInventory: 1,
        isGameOver: false,
        hasWon: false,
      }));

      render(<InteractionPrompt />);
      
      vi.advanceTimersByTime(2000);
      expect(clearCollectedPopup).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('Inventory Display', () => {
    it('shows item count when inventory not empty', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: null,
        nearbyExit: null,
        collectNearbyItem: vi.fn(),
        triggerExitInteraction: vi.fn(),
        showCollectedPopup: null,
        clearCollectedPopup: vi.fn(),
        itemInventory: 3,
        isGameOver: false,
        hasWon: false,
      }));

      render(<InteractionPrompt />);
      
      expect(screen.getByTestId('display-inventory')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('hides inventory when empty', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: null,
        nearbyExit: null,
        collectNearbyItem: vi.fn(),
        triggerExitInteraction: vi.fn(),
        showCollectedPopup: null,
        clearCollectedPopup: vi.fn(),
        itemInventory: 0,
        isGameOver: false,
        hasWon: false,
      }));

      render(<InteractionPrompt />);
      
      expect(screen.queryByTestId('display-inventory')).not.toBeInTheDocument();
    });
  });

  describe('Game State', () => {
    it('hides all prompts when game over', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: { id: 'item1', name: 'Key', nodeId: 'node1' },
        nearbyExit: { nodeId: 'exit1' },
        collectNearbyItem: vi.fn(),
        triggerExitInteraction: vi.fn(),
        showCollectedPopup: null,
        clearCollectedPopup: vi.fn(),
        itemInventory: 2,
        isGameOver: true,
        hasWon: false,
      }));

      const { container } = render(<InteractionPrompt />);
      expect(container.firstChild).toBeNull();
    });

    it('hides all prompts when player won', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        nearbyItem: { id: 'item1', name: 'Key', nodeId: 'node1' },
        nearbyExit: { nodeId: 'exit1' },
        collectNearbyItem: vi.fn(),
        triggerExitInteraction: vi.fn(),
        showCollectedPopup: null,
        clearCollectedPopup: vi.fn(),
        itemInventory: 2,
        isGameOver: false,
        hasWon: true,
      }));

      const { container } = render(<InteractionPrompt />);
      expect(container.firstChild).toBeNull();
    });
  });
});

// Additional tests: InteractionPrompt UX
describe('InteractionPrompt - popup and counters', () => {
  it('shows collected popup and clears it', async () => {
    const clearCollectedPopup = vi.fn();
    const { useGameStore } = require('../../game/store');
    useGameStore.mockImplementation(() => ({
      nearbyItem: null,
      nearbyExit: null,
      collectNearbyItem: vi.fn(),
      triggerExitInteraction: vi.fn(),
      showCollectedPopup: { name: 'Key' },
      clearCollectedPopup,
      itemInventory: 1,
      isGameOver: false,
      hasWon: false,
    }));
    render(<InteractionPrompt />);
    // Allow any timers in component to run if used
    await new Promise(r => setTimeout(r, 10));
    expect(clearCollectedPopup).toHaveBeenCalledTimes(0); // not auto-cleared synchronously
  });

  it('hides all prompts when game over or won', () => {
    const { useGameStore } = require('../../game/store');
    useGameStore.mockImplementation(() => ({
      nearbyItem: { id:'i1', name:'Balloon', nodeId:'n1' },
      nearbyExit: { nodeId: 'e1' },
      collectNearbyItem: vi.fn(),
      triggerExitInteraction: vi.fn(),
      showCollectedPopup: null,
      clearCollectedPopup: vi.fn(),
      itemInventory: 0,
      isGameOver: true,
      hasWon: false,
    }));
    const { container } = render(<InteractionPrompt />);
    expect(container.firstChild).toBeNull();
  });
});
