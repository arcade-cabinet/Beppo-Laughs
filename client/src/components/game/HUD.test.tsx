import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../../game/store';
import { HUD } from './HUD';

// Mock beppo video asset
vi.mock('@assets/generated_videos/beppo_clown_emerging_laughing_game_over.mp4', () => ({
    default: 'mock-video-url'
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
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

    it('renders exploration counter correctly', () => {
        (useGameStore as any).mockImplementation((selector: any) =>
            selector ? selector(mockState) : mockState
        );
        render(<HUD />);
        expect(screen.getByText(/CELLS: 2/)).toBeInTheDocument();
    });

    it('renders instructions', () => {
        (useGameStore as any).mockImplementation((selector: any) =>
            selector ? selector(mockState) : mockState
        );
        render(<HUD />);
        expect(screen.getByText(/TAP markers to move/i)).toBeInTheDocument();
    });

    it('renders win overlay when hasWon is true', () => {
        const winState = { ...mockState, hasWon: true };
        (useGameStore as any).mockImplementation((selector: any) =>
            selector ? selector(winState) : winState
        );
        render(<HUD />);
        expect(screen.getByText('ESCAPED!')).toBeInTheDocument();
    });

    it('renders game over overlay when isGameOver is true', () => {
        const gameOverState = { ...mockState, isGameOver: true };
        (useGameStore as any).mockImplementation((selector: any) =>
            selector ? selector(gameOverState) : gameOverState
        );
        render(<HUD />);
        expect(screen.getByText('BEPPO FOUND YOU')).toBeInTheDocument();
    });
});
