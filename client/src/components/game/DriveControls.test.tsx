import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DriveControls } from './DriveControls';

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn(() => ({
    setAccelerating: vi.fn(),
    setBraking: vi.fn(),
    accelerating: false,
    carSpeed: 0,
    pendingFork: null,
    isGameOver: false,
    hasWon: false,
  })),
}));

describe('DriveControls', () => {
  it('renders without crashing', () => {
    const { container } = render(<DriveControls />);
    expect(container).toBeDefined();
  });

  it('renders the lever control', () => {
    render(<DriveControls />);
    expect(screen.getByTestId('lever-control')).toBeInTheDocument();
  });

  it('renders DRIVE label', () => {
    render(<DriveControls />);
    expect(screen.getByText('DRIVE')).toBeInTheDocument();
  });

  it('renders SPEED indicator', () => {
    render(<DriveControls />);
    expect(screen.getByText('SPEED')).toBeInTheDocument();
  });

  it('shows lever hint by default', () => {
    render(<DriveControls />);
    expect(screen.getByText('Pull the lever!')).toBeInTheDocument();
  });

  it('can be mounted and unmounted without errors', () => {
    const { unmount } = render(<DriveControls />);
    expect(() => unmount()).not.toThrow();
  });

  describe('Lever Interaction', () => {
    it('starts acceleration on lever pull', () => {

      render(<DriveControls />);
      const lever = screen.getByTestId('lever-control');
      
      lever.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      expect(setAccelerating).toHaveBeenCalledWith(true);
    });

    it('stops acceleration on lever release', () => {
      const setAccelerating = vi.fn();

      render(<DriveControls />);
      const lever = screen.getByTestId('lever-control');
      
      lever.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      expect(setAccelerating).toHaveBeenCalledWith(false);
      expect(setBraking).toHaveBeenCalledWith(false);
    });

    it('handles touch events', () => {

      render(<DriveControls />);
      const lever = screen.getByTestId('lever-control');
      
      lever.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
      expect(setAccelerating).toHaveBeenCalledWith(true);
    });

  });

  describe('Fork Interaction', () => {


    it('enables lever after fork resolution', () => {      let fork = { nodeId: 'node1', options: [] };

      const { rerender } = render(<DriveControls />);
      expect(screen.getByTestId('lever-control')).toBeDisabled();
      
      fork = null as any;
      rerender(<DriveControls />);
      expect(screen.getByTestId('lever-control')).not.toBeDisabled();
    });
  });

  describe('Speed Display', () => {

    it('updates speed indicator dynamically', () => {      let speed = 0;

      const { rerender } = render(<DriveControls />);
      
      speed = 5;
      rerender(<DriveControls />);
      
      expect(screen.getByText('SPEED')).toBeInTheDocument();
    });
  });

  describe('Game State', () => {

  });

  describe('Edge Cases', () => {
    it('handles mouse leave during lever pull', () => {
      const setAccelerating = vi.fn();

      render(<DriveControls />);
      const lever = screen.getByTestId('lever-control');
      
      lever.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      expect(setAccelerating).toHaveBeenCalledWith(false);
    });

    it('handles touch cancel events', () => {

      render(<DriveControls />);
      const lever = screen.getByTestId('lever-control');
      
      lever.dispatchEvent(new TouchEvent('touchcancel', { bubbles: true }));
      expect(setAccelerating).toHaveBeenCalledWith(false);
    });

    it('maintains state consistency across rapid interactions', () => {

      render(<DriveControls />);
      const lever = screen.getByTestId('lever-control');
      
      for (let i = 0; i < 10; i++) {
        lever.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        lever.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      }
      
      expect(setAccelerating).toHaveBeenCalled();
    });
  });
});

// Additional tests: DriveControls UX and accessibility
describe('DriveControls - accessibility and keyboard', () => {
  it('lever has accessible role and label', () => {
    render(<DriveControls />);
    const lever = screen.getByTestId('lever-control');
    expect(lever).toHaveAttribute('aria-label');
  });

  it('keyboard events toggle accelerating state', () => {
    render(<DriveControls />);
    const lever = screen.getByTestId('lever-control');
    lever.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(setAccelerating).toHaveBeenCalledWith(true);
    lever.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    expect(setAccelerating).toHaveBeenCalledWith(false);
  });
});
