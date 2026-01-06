import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MainMenu } from './MainMenu';

// Mock framer-motion to avoid animation-related failures in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
        h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('MainMenu', () => {
    let mockOnStart: any;

    beforeEach(() => {
        mockOnStart = vi.fn();
        vi.clearAllMocks();
    });

    it('renders the main menu title', () => {
        render(<MainMenu onStart={mockOnStart} />);
        expect(screen.getAllByText('BEPPO LAUGHS')[0]).toBeInTheDocument();
    });

    it('renders the enter ride button', () => {
        render(<MainMenu onStart={mockOnStart} />);
        expect(screen.getByTestId('button-start-game')).toBeInTheDocument();
    });

    it('calls onStart when clicking enter ride', () => {
        render(<MainMenu onStart={mockOnStart} />);
        const button = screen.getByTestId('button-start-game');
        fireEvent.click(button);
        expect(mockOnStart).toHaveBeenCalled();
    });
});
