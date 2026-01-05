import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainMenu } from './MainMenu';

describe('MainMenu', () => {
  let mockOnStart: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnStart = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the main menu with all elements', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      expect(screen.getByText('BEPPO LAUGHS')).toBeInTheDocument();
      expect(screen.getByText('Procedural Survival Horror')).toBeInTheDocument();
      expect(screen.getByTestId('input-seed')).toBeInTheDocument();
      expect(screen.getByTestId('button-random-seed')).toBeInTheDocument();
      expect(screen.getByTestId('button-start-game')).toBeInTheDocument();
      expect(screen.getByText('WARNING: GYROSCOPE & HAPTICS RECOMMENDED')).toBeInTheDocument();
      expect(screen.getByText('HEADPHONES REQUIRED')).toBeInTheDocument();
    });

    it('renders input with correct placeholder', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      expect(input).toHaveAttribute('placeholder', 'Enter three seed words...');
    });

    it('renders buttons with correct labels', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      expect(screen.getByTestId('button-random-seed')).toHaveTextContent('Randomize');
      expect(screen.getByTestId('button-start-game')).toHaveTextContent('ENTER MAZE');
    });
  });

  describe('Initial State', () => {
    it('generates a random seed on mount', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed') as HTMLInputElement;
      expect(input.value).toBeTruthy();
      
      // Should be three words
      const words = input.value.trim().split(/\s+/);
      expect(words).toHaveLength(3);
    });

    it('does not show error message initially', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      expect(screen.queryByTestId('text-seed-error')).not.toBeInTheDocument();
    });

    it('start button is enabled with valid initial seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).not.toBeDisabled();
    });
  });

  describe('Seed Input Validation', () => {
    it('accepts valid three-word seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'shadow maze whisper' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).not.toBeDisabled();
      expect(screen.queryByTestId('text-seed-error')).not.toBeInTheDocument();
    });

    it('rejects single word seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'shadow' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).toBeDisabled();
    });

    it('rejects two word seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'shadow maze' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).toBeDisabled();
    });

    it('rejects four word seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'shadow maze whisper death' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).toBeDisabled();
    });

    it('accepts seed with leading/trailing whitespace', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: '  shadow maze whisper  ' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).not.toBeDisabled();
    });

    it('accepts seed with multiple spaces between words', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'shadow    maze    whisper' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).not.toBeDisabled();
    });

    it('rejects empty string', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: '' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).toBeDisabled();
    });

    it('rejects only whitespace', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: '   ' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).toBeDisabled();
    });
  });

  describe('Error Messages', () => {
    it('shows error when clicking start with invalid seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'invalid' } });
      
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      
      expect(screen.getByTestId('text-seed-error')).toHaveTextContent(
        'Enter a three-word seed (e.g., "shadow maze whisper").'
      );
      expect(mockOnStart).not.toHaveBeenCalled();
    });

    it('clears error when valid seed is entered after error', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      
      // Enter invalid seed and trigger error
      fireEvent.change(input, { target: { value: 'invalid' } });
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      
      expect(screen.getByTestId('text-seed-error')).toBeInTheDocument();
      
      // Enter valid seed
      fireEvent.change(input, { target: { value: 'shadow maze whisper' } });
      
      expect(screen.queryByTestId('text-seed-error')).not.toBeInTheDocument();
    });

    it('does not show error when typing invalid seed (only on submit)', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'one' } });
      
      // Error should not appear until we try to start
      expect(screen.queryByTestId('text-seed-error')).not.toBeInTheDocument();
    });
  });

  describe('Random Seed Generation', () => {
    it('generates new seed when randomize button is clicked', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed') as HTMLInputElement;
      const initialSeed = input.value;
      
      const randomizeButton = screen.getByTestId('button-random-seed');
      
      // Click multiple times to ensure we get different values (with high probability)
      let differentSeedFound = false;
      for (let i = 0; i < 10; i++) {
        fireEvent.click(randomizeButton);
        if (input.value !== initialSeed) {
          differentSeedFound = true;
          break;
        }
      }
      
      expect(differentSeedFound).toBe(true);
    });

    it('generates valid three-word seed when randomizing', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const randomizeButton = screen.getByTestId('button-random-seed');
      fireEvent.click(randomizeButton);
      
      const input = screen.getByTestId('input-seed') as HTMLInputElement;
      const words = input.value.trim().split(/\s+/);
      
      expect(words).toHaveLength(3);
      expect(input.value).toMatch(/^\w+\s+\w+\s+\w+$/);
    });

    it('clears error message when randomizing', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      
      // Create an error
      fireEvent.change(input, { target: { value: 'invalid' } });
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      
      expect(screen.getByTestId('text-seed-error')).toBeInTheDocument();
      
      // Randomize should clear error
      const randomizeButton = screen.getByTestId('button-random-seed');
      fireEvent.click(randomizeButton);
      
      expect(screen.queryByTestId('text-seed-error')).not.toBeInTheDocument();
    });

    it('generates seed from predefined word list', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const randomizeButton = screen.getByTestId('button-random-seed');
      const validWords = ['dark', 'blood', 'shadow', 'maze', 'fear', 'run', 'hide', 'scream', 'whisper', 'death', 'green', 'hedge'];
      
      // Generate multiple seeds and verify all words are from the list
      for (let i = 0; i < 5; i++) {
        fireEvent.click(randomizeButton);
        
        const input = screen.getByTestId('input-seed') as HTMLInputElement;
        const words = input.value.trim().split(/\s+/);
        
        words.forEach(word => {
          expect(validWords).toContain(word);
        });
      }
    });
  });

  describe('Starting the Game', () => {
    it('calls onStart with normalized seed when valid', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'Shadow Maze Whisper' } });
      
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      
      expect(mockOnStart).toHaveBeenCalledWith('shadow maze whisper');
    });

    it('normalizes seed by trimming whitespace', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: '  shadow maze whisper  ' } });
      
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      
      expect(mockOnStart).toHaveBeenCalledWith('shadow maze whisper');
    });

    it('normalizes seed by collapsing multiple spaces', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'shadow    maze    whisper' } });
      
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      
      expect(mockOnStart).toHaveBeenCalledWith('shadow maze whisper');
    });

    it('converts seed to lowercase', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'SHADOW MAZE WHISPER' } });
      
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      
      expect(mockOnStart).toHaveBeenCalledWith('shadow maze whisper');
    });

    it('handles mixed case input correctly', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'ShAdOw MaZe WhIsPeR' } });
      
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      
      expect(mockOnStart).toHaveBeenCalledWith('shadow maze whisper');
    });

    it('does not call onStart when seed is invalid', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'invalid' } });
      
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      
      expect(mockOnStart).not.toHaveBeenCalled();
    });

    it('calls onStart only once per click', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'shadow maze whisper' } });
      
      const startButton = screen.getByTestId('button-start-game');
      fireEvent.click(startButton);
      
      expect(mockOnStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input Interaction', () => {
    it('updates seed input when user types', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'new seed value' } });
      
      expect(input.value).toBe('new seed value');
    });

    it('allows clearing the input', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '' } });
      
      expect(input.value).toBe('');
    });

    it('maintains input value after randomize and manual edit', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const randomizeButton = screen.getByTestId('button-random-seed');
      fireEvent.click(randomizeButton);
      
      const input = screen.getByTestId('input-seed') as HTMLInputElement;
      const randomSeed = input.value;
      
      fireEvent.change(input, { target: { value: 'manual seed input' } });
      
      expect(input.value).toBe('manual seed input');
      expect(input.value).not.toBe(randomSeed);
    });
  });

  describe('Button States', () => {
    it('enables start button with valid seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'valid three words' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).not.toBeDisabled();
    });

    it('disables start button with invalid seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'invalid' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).toBeDisabled();
    });

    it('randomize button is always enabled', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const randomizeButton = screen.getByTestId('button-random-seed');
      expect(randomizeButton).not.toBeDisabled();
      
      // Even with invalid input
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: '' } });
      
      expect(randomizeButton).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles seed with special characters in words', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'word1 word2 word3' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).not.toBeDisabled();
    });

    it('handles seed with numbers', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      fireEvent.change(input, { target: { value: 'word1 123 abc' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).not.toBeDisabled();
    });

    it('handles very long words in seed', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      const longWord = 'a'.repeat(100);
      fireEvent.change(input, { target: { value: `${longWord} ${longWord} ${longWord}` } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).not.toBeDisabled();
    });

    it('handles rapid consecutive changes to input', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      
      fireEvent.change(input, { target: { value: 'one' } });
      fireEvent.change(input, { target: { value: 'one two' } });
      fireEvent.change(input, { target: { value: 'one two three' } });
      
      const startButton = screen.getByTestId('button-start-game');
      expect(startButton).not.toBeDisabled();
    });

    it('handles rapid clicks on randomize button', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const randomizeButton = screen.getByTestId('button-random-seed');
      const input = screen.getByTestId('input-seed') as HTMLInputElement;
      
      // Click multiple times rapidly
      for (let i = 0; i < 10; i++) {
        fireEvent.click(randomizeButton);
      }
      
      // Should still have a valid seed
      const words = input.value.trim().split(/\s+/);
      expect(words).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    it('has proper test ids for automation', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      expect(screen.getByTestId('input-seed')).toBeInTheDocument();
      expect(screen.getByTestId('button-random-seed')).toBeInTheDocument();
      expect(screen.getByTestId('button-start-game')).toBeInTheDocument();
    });

    it('input has text type', () => {
      render(<MainMenu onStart={mockOnStart} />);
      
      const input = screen.getByTestId('input-seed');
      expect(input).toHaveAttribute('type', 'text');
    });
  });
});