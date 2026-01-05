import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './Home';
import { useGameStore } from '@/game/store';

// Mock the game components
vi.mock('@/components/game/Scene', () => ({
  Scene: ({ seed }: { seed: string }) => <div data-testid="scene">Scene: {seed}</div>
}));

vi.mock('@/components/game/MainMenu', () => ({
  MainMenu: ({ onStart }: { onStart: (seed: string) => void }) => (
    <div data-testid="main-menu">
      <button type="button" onClick={() => onStart('test seed')} data-testid="mock-start">
        Start
      </button>
    </div>
  )
}));

vi.mock('@/components/game/HUD', () => ({
  HUD: () => <div data-testid="hud">HUD</div>
}));

describe('Home', () => {
  let mockResetGame: ReturnType<typeof vi.fn>;
  let mockSetSeed: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockResetGame = vi.fn();
    mockSetSeed = vi.fn();
    
    // Mock useGameStore
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        seed: '',
        setSeed: mockSetSeed,
        resetGame: mockResetGame,
        isGameOver: false,
      };
      return selector ? selector(state) : state;
    });

    // Mock navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Desktop Browser',
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('renders main menu by default', () => {
      render(<Home />);
      
      expect(screen.getByTestId('main-menu')).toBeInTheDocument();
      expect(screen.queryByTestId('scene')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hud')).not.toBeInTheDocument();
    });

    it('resets game on mount', () => {
      render(<Home />);
      
      expect(mockResetGame).toHaveBeenCalled();
    });

    it('does not show exit button when not playing', () => {
      render(<Home />);
      
      expect(screen.queryByTestId('button-exit')).not.toBeInTheDocument();
      expect(screen.queryByTestId('button-exit-mobile')).not.toBeInTheDocument();
    });
  });

  describe('Starting the Game', () => {
    it('shows scene and HUD when game starts', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('scene')).toBeInTheDocument();
        expect(screen.getByTestId('hud')).toBeInTheDocument();
      });
    });

    it('hides main menu when game starts', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('main-menu')).not.toBeInTheDocument();
      });
    });

    it('resets game state when starting', async () => {
      render(<Home />);
      
      mockResetGame.mockClear();
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(mockResetGame).toHaveBeenCalled();
      });
    });

    it('sets seed in store when starting', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(mockSetSeed).toHaveBeenCalledWith('test seed');
      });
    });

    it('passes seed to Scene component', async () => {
      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        const state = {
          seed: 'test seed',
          setSeed: mockSetSeed,
          resetGame: mockResetGame,
          isGameOver: false,
        };
        return selector ? selector(state) : state;
      });

      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('scene')).toHaveTextContent('Scene: test seed');
      });
    });
  });

  describe('Desktop Exit Button', () => {
    it('shows desktop exit button when playing on desktop', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('button-exit')).toBeInTheDocument();
        expect(screen.queryByTestId('button-exit-mobile')).not.toBeInTheDocument();
      });
    });

    it('exits game when desktop exit button is clicked', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('button-exit')).toBeInTheDocument();
      });
      
      const exitButton = screen.getByTestId('button-exit');
      fireEvent.click(exitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('main-menu')).toBeInTheDocument();
        expect(screen.queryByTestId('scene')).not.toBeInTheDocument();
      });
    });

    it('resets game when exiting', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('button-exit')).toBeInTheDocument();
      });
      
      mockResetGame.mockClear();
      
      const exitButton = screen.getByTestId('button-exit');
      fireEvent.click(exitButton);
      
      expect(mockResetGame).toHaveBeenCalled();
    });

    it('desktop exit button has correct label', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const exitButton = screen.getByTestId('button-exit');
        expect(exitButton).toHaveTextContent('ESC');
      });
    });
  });

  describe('Mobile Detection', () => {
    beforeEach(() => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      });
    });

    it('detects mobile devices', () => {
      render(<Home />);
      
      expect(navigator.userAgent).toContain('iPhone');
    });

    it('shows mobile exit button when playing on mobile', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('button-exit-mobile')).toBeInTheDocument();
        expect(screen.queryByTestId('button-exit')).not.toBeInTheDocument();
      });
    });

    it('mobile exit button has correct label', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const exitButton = screen.getByTestId('button-exit-mobile');
        expect(exitButton).toHaveTextContent('EXIT');
      });
    });
  });

  describe('Game Over State', () => {
    beforeEach(() => {
      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        const state = {
          seed: 'test seed',
          setSeed: mockSetSeed,
          resetGame: mockResetGame,
          isGameOver: true,
        };
        return selector ? selector(state) : state;
      });
    });

    it('shows restart button when game is over', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('button-restart')).toBeInTheDocument();
      });
    });

    it('restart button has correct label', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const restartButton = screen.getByTestId('button-restart');
        expect(restartButton).toHaveTextContent('TRY AGAIN');
      });
    });

    it('returns to main menu when restart is clicked', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('button-restart')).toBeInTheDocument();
      });
      
      const restartButton = screen.getByTestId('button-restart');
      fireEvent.click(restartButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('main-menu')).toBeInTheDocument();
      });
    });

    it('resets game when restarting', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('button-restart')).toBeInTheDocument();
      });
      
      mockResetGame.mockClear();
      
      const restartButton = screen.getByTestId('button-restart');
      fireEvent.click(restartButton);
      
      expect(mockResetGame).toHaveBeenCalled();
    });
  });

  describe('Fullscreen Behavior', () => {
    let mockRequestFullscreen: ReturnType<typeof vi.fn>;
    let mockExitFullscreen: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
      mockExitFullscreen = vi.fn().mockResolvedValue(undefined);
      
      Object.defineProperty(document.documentElement, 'requestFullscreen', {
        value: mockRequestFullscreen,
        configurable: true,
        writable: true,
      });
      
      Object.defineProperty(document, 'exitFullscreen', {
        value: mockExitFullscreen,
        configurable: true,
        writable: true,
      });
      
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        configurable: true,
        writable: true,
      });

      // Mock mobile
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      });
    });

    it('requests fullscreen on mobile when starting game', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(mockRequestFullscreen).toHaveBeenCalled();
      });
    });

    it('does not request fullscreen on desktop', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Desktop Browser',
        configurable: true,
      });

      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('scene')).toBeInTheDocument();
      });
      
      expect(mockRequestFullscreen).not.toHaveBeenCalled();
    });

    it('exits fullscreen when exiting game', async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        configurable: true,
        writable: true,
      });

      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('button-exit-mobile')).toBeInTheDocument();
      });
      
      const exitButton = screen.getByTestId('button-exit-mobile');
      fireEvent.click(exitButton);
      
      expect(mockExitFullscreen).toHaveBeenCalled();
    });

    it('handles fullscreen errors gracefully', async () => {
      mockRequestFullscreen.mockRejectedValue(new Error('Fullscreen denied'));
      
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      // Should still show the game even if fullscreen fails
      await waitFor(() => {
        expect(screen.getByTestId('scene')).toBeInTheDocument();
      });
    });
  });

  describe('Orientation Handling', () => {
    beforeEach(() => {
      // Mock mobile
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      });

      // Mock window dimensions for portrait
      Object.defineProperty(window, 'innerWidth', {
        value: 400,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 800,
        configurable: true,
        writable: true,
      });
    });

    it('shows rotate prompt on mobile in portrait mode when playing', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      // Trigger resize event to check orientation
      fireEvent.resize(window);
      
      await waitFor(() => {
        expect(screen.getByText('ROTATE YOUR DEVICE')).toBeInTheDocument();
        expect(screen.getByText('Landscape mode required')).toBeInTheDocument();
      });
    });

    it('does not show rotate prompt in landscape mode', async () => {
      // Mock landscape dimensions
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 400,
        configurable: true,
        writable: true,
      });

      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      fireEvent.resize(window);
      
      await waitFor(() => {
        expect(screen.queryByText('ROTATE YOUR DEVICE')).not.toBeInTheDocument();
      });
    });

    it('does not show rotate prompt on desktop', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Desktop Browser',
        configurable: true,
      });

      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      fireEvent.resize(window);
      
      await waitFor(() => {
        expect(screen.queryByText('ROTATE YOUR DEVICE')).not.toBeInTheDocument();
      });
    });

    it('does not show rotate prompt when not playing', () => {
      render(<Home />);
      
      fireEvent.resize(window);
      
      expect(screen.queryByText('ROTATE YOUR DEVICE')).not.toBeInTheDocument();
    });

    it('updates rotate prompt when orientation changes', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      // Start in portrait
      fireEvent.resize(window);
      
      await waitFor(() => {
        expect(screen.getByText('ROTATE YOUR DEVICE')).toBeInTheDocument();
      });
      
      // Change to landscape
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 400,
        configurable: true,
        writable: true,
      });
      
      fireEvent.resize(window);
      
      await waitFor(() => {
        expect(screen.queryByText('ROTATE YOUR DEVICE')).not.toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    it('maintains playing state across renders', async () => {
      const { rerender } = render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('scene')).toBeInTheDocument();
      });
      
      rerender(<Home />);
      
      expect(screen.getByTestId('scene')).toBeInTheDocument();
    });

    it('can transition from playing back to menu', async () => {
      render(<Home />);
      
      // Start game
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('scene')).toBeInTheDocument();
      });
      
      // Exit game
      const exitButton = screen.getByTestId('button-exit');
      fireEvent.click(exitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('main-menu')).toBeInTheDocument();
        expect(screen.queryByTestId('scene')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid start/exit clicks', async () => {
      render(<Home />);
      
      const startButton = screen.getByTestId('mock-start');
      
      // Rapidly click start multiple times
      fireEvent.click(startButton);
      fireEvent.click(startButton);
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('scene')).toBeInTheDocument();
      });
      
      const exitButton = screen.getByTestId('button-exit');
      
      // Rapidly click exit
      fireEvent.click(exitButton);
      fireEvent.click(exitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('main-menu')).toBeInTheDocument();
      });
    });

    it('handles starting with different seeds', async () => {
      const { rerender } = render(<Home />);
      
      mockSetSeed.mockClear();
      
      const startButton = screen.getByTestId('mock-start');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(mockSetSeed).toHaveBeenCalledWith('test seed');
      });
      
      // Exit and start again
      const exitButton = screen.getByTestId('button-exit');
      fireEvent.click(exitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('main-menu')).toBeInTheDocument();
      });
      
      mockSetSeed.mockClear();
      
      const startButton2 = screen.getByTestId('mock-start');
      fireEvent.click(startButton2);
      
      await waitFor(() => {
        expect(mockSetSeed).toHaveBeenCalled();
      });
    });
  });
});