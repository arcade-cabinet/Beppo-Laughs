import { render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../../game/store';
import { HUD } from './HUD';

// Mock beppo video asset - DEFAULT TO EMPTY for tests, or override in specific tests
vi.mock('@assets/generated_videos/beppo_clown_emerging_laughing_game_over.mp4', () => ({
  default: '',
}));

// Mock VIDEO_ASSETS to return empty string by default
vi.mock('../../game/textures', async () => {
  const actual = await vi.importActual('../../game/textures');
  return {
    ...actual,
    VIDEO_ASSETS: {
      BEPPO_GAME_OVER: {
        url: '', // Default to empty
        name: 'Beppo Game Over',
        description: 'Beppo laughing as player loses',
      },
    },
  };
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, animate, ...props }: any) => (
      <div data-opacity={animate?.opacity} {...props}>
        {children}
      </div>
    ),
    h1: ({ children, ...props }: ComponentProps<'h1'>) => <h1 {...props}>{children}</h1>,
  },
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn(),
}));

describe('HUD', () => {
  const mockState = {
    fear: 50,
    despair: 50,
    maxSanity: 100,
    isGameOver: false,
    hasWon: false,
    visitedCells: new Set(['0,0', '1,1']),

    isInverted: vi.fn(() => false),
    getSanityLevel: vi.fn(() => 50),
  };

  type StoreState = typeof mockState;
  type Selector<T> = (state: StoreState) => T;
  const mockUseGameStore = useGameStore as unknown as {
    mockImplementation: <T>(fn: (selector?: Selector<T>) => T | StoreState) => void;
  };

  it('renders exploration counter correctly', () => {
    mockUseGameStore.mockImplementation((selector) => (selector ? selector(mockState) : mockState));
    render(<HUD />);
    expect(screen.getByText(/CELLS: 2/)).toBeInTheDocument();
  });

  it('renders instructions', () => {
    mockUseGameStore.mockImplementation((selector) => (selector ? selector(mockState) : mockState));
    render(<HUD />);
    expect(screen.getByText(/TAP markers to move/i)).toBeInTheDocument();
  });

  it('renders win overlay when hasWon is true', () => {
    const winState = { ...mockState, hasWon: true };
    mockUseGameStore.mockImplementation((selector) => (selector ? selector(winState) : winState));
    render(<HUD />);
    expect(screen.getByText('ESCAPED!')).toBeInTheDocument();
  });

  it('renders game over overlay immediately when video is missing', () => {
    const gameOverState = { ...mockState, isGameOver: true };
    mockUseGameStore.mockImplementation((selector) =>
      selector ? selector(gameOverState) : gameOverState,
    );
    render(<HUD />);
    const gameOverText = screen.getByText('BEPPO FOUND YOU');
    expect(gameOverText).toBeInTheDocument();

    // Check the parent container opacity
    const textContainer = gameOverText.closest('div[data-opacity]');
    // With empty video URL, videoEnded is set to true immediately, so opacity should be 1
    expect(textContainer).toHaveAttribute('data-opacity', '1');

    // Ensure video is not rendered
    // Testing library queries by role might not find <video> by default role.
    const videos = document.getElementsByTagName('video');
    expect(videos.length).toBe(0);
  });
});
