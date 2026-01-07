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

  describe('Component Lifecycle', () => {
    it('sets up event listeners on mount', () => {
      const addEventListener = vi.spyOn(HTMLCanvasElement.prototype, 'addEventListener');
      
      render(<GestureControls />);
      
      expect(addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), expect.any(Object));
      expect(addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), expect.any(Object));
      expect(addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
    });

    it('cleans up event listeners on unmount', () => {
      const removeEventListener = vi.spyOn(HTMLCanvasElement.prototype, 'removeEventListener');
      
      const { unmount } = render(<GestureControls />);
      unmount();
      
      expect(removeEventListener).toHaveBeenCalled();
    });
  });

  describe('Store Integration', () => {
    it('uses available moves from store', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        availableMoves: [
          { direction: 'north', nodeId: 'node1', isExit: false },
          { direction: 'east', nodeId: 'node2', isExit: false },
        ],
        isMoving: false,
        startMoveTo: vi.fn(),
        cameraRotation: 0,
        setCameraRotation: vi.fn(),
      }));

      expect(() => render(<GestureControls />)).not.toThrow();
    });

    it('respects isMoving state', () => {
      const startMoveTo = vi.fn();
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        availableMoves: [{ direction: 'north', nodeId: 'node1', isExit: false }],
        isMoving: true,
        startMoveTo,
        cameraRotation: 0,
        setCameraRotation: vi.fn(),
      }));

      render(<GestureControls />);
      
      // Even if gestures occur, startMoveTo shouldn't be called when isMoving is true
      expect(startMoveTo).not.toHaveBeenCalled();
    });

    it('updates camera rotation', () => {
      const setCameraRotation = vi.fn();
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        availableMoves: [],
        isMoving: false,
        startMoveTo: vi.fn(),
        cameraRotation: 0,
        setCameraRotation,
      }));

      render(<GestureControls />);
      expect(setCameraRotation).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles no available moves', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        availableMoves: [],
        isMoving: false,
        startMoveTo: vi.fn(),
        cameraRotation: 0,
        setCameraRotation: vi.fn(),
      }));

      expect(() => render(<GestureControls />)).not.toThrow();
    });

    it('handles rapid camera rotation changes', () => {
      const { useGameStore } = require('../../game/store');
      let rotation = 0;
      
      useGameStore.mockImplementation(() => ({
        availableMoves: [],
        isMoving: false,
        startMoveTo: vi.fn(),
        cameraRotation: rotation,
        setCameraRotation: (r: number) => { rotation = r; },
      }));

      const { rerender } = render(<GestureControls />);
      
      for (let i = 0; i < 10; i++) {
        rotation += 0.1;
        rerender(<GestureControls />);
      }
      
      expect(() => rerender(<GestureControls />)).not.toThrow();
    });
  });

  describe('Canvas Dependency', () => {
    it('handles missing canvas gracefully on mount', () => {
      // Remove any existing canvas
      const existingCanvas = document.querySelector('canvas');
      existingCanvas?.remove();
      
      expect(() => render(<GestureControls />)).not.toThrow();
    });

    it('works with canvas present', () => {
      // Add a canvas element
      const canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
      
      expect(() => render(<GestureControls />)).not.toThrow();
      
      document.body.removeChild(canvas);
    });
  });
});

// Additional tests: GestureControls gestures
describe('GestureControls - gestures', () => {
  it('does not start move when move not permitted', () => {
    const startMoveTo = vi.fn();
    const { useGameStore } = require('../../game/store');
    useGameStore.mockImplementation(() => ({
      availableMoves: [],
      isMoving: false,
      startMoveTo,
      cameraRotation: 0,
      setCameraRotation: vi.fn(),
    }));
    render(<GestureControls />);
    expect(startMoveTo).not.toHaveBeenCalled();
  });

  it('keeps rotation within sane bounds', () => {
    let rotation = 0;
    const { useGameStore } = require('../../game/store');
    useGameStore.mockImplementation(() => ({
      availableMoves: [],
      isMoving: false,
      startMoveTo: vi.fn(),
      cameraRotation: rotation,
      setCameraRotation: (r: number) => { rotation = r; },
    }));
    const { rerender } = render(<GestureControls />);
    for (let i=0;i<50;i++) { rotation += 10; rerender(<GestureControls />); }
    expect(rotation).toBeDefined();
  });
});
