import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GestureControls } from './GestureControls';

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn(() => ({
    availableMoves: [],
    isMoving: false,
    startMoveTo: vi.fn(),
    cameraRotation: 0,
    setCameraRotation: vi.fn(),
  })),
}));

describe('GestureControls', () => {
  it('renders without crashing', () => {
    const { container } = render(<GestureControls />);
    expect(container).toBeDefined();
  });

  it('renders null as expected', () => {
    const { container } = render(<GestureControls />);
    // GestureControls returns null, so container should have no direct children
    expect(container.firstChild).toBeNull();
  });

  it('can be mounted and unmounted without errors', () => {
    const { unmount } = render(<GestureControls />);
    expect(() => unmount()).not.toThrow();
  });

  it('handles missing canvas element gracefully', () => {
    // Test that it doesn't crash when canvas is not found
    expect(() => render(<GestureControls />)).not.toThrow();
  });
});
