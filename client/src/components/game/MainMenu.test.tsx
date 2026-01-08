import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MainMenu } from '@/components/game/MainMenu';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Shuffle: () => <div data-testid="icon-shuffle" />,
  Settings: () => <div data-testid="icon-settings" />,
}));

// Mock Settings Modal
vi.mock('@/components/game/SettingsModal', () => ({
  SettingsModal: () => <div data-testid="modal-settings">Settings Modal</div>,
}));

// Mock Zustand store
const mockUseGameStore = vi.fn();
vi.mock('@/game/store', () => ({
  useGameStore: (selector: any) => mockUseGameStore(selector),
}));

describe('MainMenu', () => {
  const mockOnStart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default store state
    mockUseGameStore.mockImplementation((selector: any) => {
      const state = {
        seed: '',
        isGameOver: false,
      };
      return selector(state);
    });
  });

  describe('Rendering', () => {
    it('renders the main menu with all elements', () => {
      render(<MainMenu onStart={mockOnStart} />);

      expect(screen.getByText('BEPPO LAUGHS')).toBeInTheDocument();
      expect(screen.getByTestId('input-seed')).toBeInTheDocument();
      expect(screen.getByTestId('button-start-game')).toBeInTheDocument();
      expect(screen.getByTestId('button-continue-game')).toBeInTheDocument();
      expect(screen.getByTestId('modal-settings')).toBeInTheDocument();
    });

    it('renders input with correct placeholder', () => {
      render(<MainMenu onStart={mockOnStart} />);
      const input = screen.getByTestId('input-seed');
      expect(input).toHaveAttribute('placeholder', 'Enter three seed words...');
    });

    it('renders buttons with correct labels', () => {
      render(<MainMenu onStart={mockOnStart} />);
      expect(screen.getByText('NEW GAME')).toBeInTheDocument();
      expect(screen.getByText('CONTINUE GAME')).toBeInTheDocument();
    });
  });

  describe('Seed Validation', () => {
    it('generates a random seed on mount', () => {
      render(<MainMenu onStart={mockOnStart} />);
      const input = screen.getByTestId('input-seed') as HTMLInputElement;
      expect(input.value.split(' ')).toHaveLength(3);
    });

    it('does not show error message initially', () => {
      render(<MainMenu onStart={mockOnStart} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('accepts valid three-word seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'one two three' } });
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      expect(mockOnStart).toHaveBeenCalledWith('one two three', true);
    });

    it('rejects single word seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'one' } });
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      expect(mockOnStart).not.toHaveBeenCalled();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows error when clicking start with invalid seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'invalid' } });
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Game Flow', () => {
    it('calls onStart with true for New Game', () => {
      render(<MainMenu onStart={mockOnStart} />);
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'one two three' } });
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      expect(mockOnStart).toHaveBeenCalledWith('one two three', true);
    });

    it('calls onStart with false for Continue Game', () => {
      // Mock store with saved game
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          seed: 'saved seed',
          isGameOver: false,
        };
        return selector(state);
      });

      render(<MainMenu onStart={mockOnStart} />);
      const continueButton = screen.getByTestId('button-continue-game');
      fireEvent.click(continueButton);
      expect(mockOnStart).toHaveBeenCalledWith('saved seed', false);
    });

    it('disables Continue Game when no saved game exists', () => {
      // Mock store with no saved game
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          seed: '',
          isGameOver: false,
        };
        return selector(state);
      });

      render(<MainMenu onStart={mockOnStart} />);
      const continueButton = screen.getByTestId('button-continue-game');
      expect(continueButton).toBeDisabled();
    });

    it('disables Continue Game when game is over', () => {
      // Mock store with game over
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          seed: 'saved seed',
          isGameOver: true,
        };
        return selector(state);
      });

      render(<MainMenu onStart={mockOnStart} />);
      const continueButton = screen.getByTestId('button-continue-game');
      expect(continueButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for buttons', () => {
      render(<MainMenu onStart={mockOnStart} />);
      expect(screen.getByLabelText('Randomize seed')).toBeInTheDocument();
    });
  });
});
