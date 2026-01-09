import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DriveControls } from './DriveControls';

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn(() => ({
    setAccelerating: vi.fn(),
    setBraking: vi.fn(),
    accelerating: false,
    braking: false,
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
});
