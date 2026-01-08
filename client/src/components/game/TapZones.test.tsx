import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MazeGeometry } from '../../game/maze/geometry';
import { TapZones } from './TapZones';

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn(() => ({
    currentNode: 'center',
    isMoving: false,
    startMoveTo: vi.fn(),
    blockades: new Set(),
    setAvailableMoves: vi.fn(),
  })),
}));

describe('TapZones', () => {
  const mockGeometry: MazeGeometry = {
    walls: [],
    floor: { x: 0, z: 0, width: 10, depth: 10 },
    centerNodeId: 'center',
    railNodes: new Map([
      [
        'center',
        {
          id: 'center',
          gridX: 0,
          gridY: 0,
          worldX: 0,
          worldZ: 0,
          connections: ['node1'],
          isCenter: true,
          isExit: false,
        },
      ],
      [
        'node1',
        {
          id: 'node1',
          gridX: 1,
          gridY: 0,
          worldX: 4,
          worldZ: 0,
          connections: ['center'],
          isCenter: false,
          isExit: false,
        },
      ],
    ]),
    exitNodeIds: [],
  };

  it('renders without crashing', () => {
    const { container } = render(<TapZones geometry={mockGeometry} />);
    expect(container).toBeDefined();
  });

  it('accepts geometry prop', () => {
    expect(() => render(<TapZones geometry={mockGeometry} />)).not.toThrow();
  });

  it('renders with empty geometry', () => {
    const emptyGeometry: MazeGeometry = {
      walls: [],
      floor: { x: 0, z: 0, width: 0, depth: 0 },
      centerNodeId: '',
      railNodes: new Map(),
      exitNodeIds: [],
    };
    const { container } = render(<TapZones geometry={emptyGeometry} />);
    expect(container).toBeTruthy();
  });

  it('can be mounted and unmounted without errors', () => {
    const { unmount } = render(<TapZones geometry={mockGeometry} />);
    expect(() => unmount()).not.toThrow();
  });

  describe('Villain Visibility', () => {
    it('renders when visible', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 50,
        despair: 0,
        maxSanity: 100,
      }));

      expect(() => render(<SDFVillain position={[0, 1, -5]} isVisible={true} />)).not.toThrow();
    });

    it('hides when not visible', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 0,
        despair: 0,
        maxSanity: 100,
      }));

      const { container } = render(<SDFVillain position={[0, 1, -5]} isVisible={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('toggles visibility', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 30,
        despair: 0,
        maxSanity: 100,
      }));

      const { rerender } = render(<SDFVillain position={[0, 0, 0]} isVisible={false} />);
      
      rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />);
      
      expect(() => rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />)).not.toThrow();
    });
  });

  describe('Fear Integration', () => {
    it('reacts to fear level changes', () => {
      const { useGameStore } = require('../../game/store');
      let fear = 10;
      
      useGameStore.mockImplementation(() => ({
        fear,
        despair: 0,
        maxSanity: 100,
      }));

      const { rerender } = render(<SDFVillain position={[0, 0, 0]} isVisible={true} />);
      
      fear = 80;
      rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />);
      
      expect(() => rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />)).not.toThrow();
    });

    it('handles maximum fear level', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 100,
        despair: 0,
        maxSanity: 100,
      }));

      expect(() => render(<SDFVillain position={[0, 1, -5]} isVisible={true} />)).not.toThrow();
    });
  });

  describe('Position Variations', () => {
    it('renders at different positions', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 50,
        despair: 0,
        maxSanity: 100,
      }));

      const positions: [number, number, number][] = [
        [0, 0, 0],
        [5, 2, -3],
        [-5, 1, 10],
      ];

      positions.forEach(pos => {
        expect(() => render(<SDFVillain position={pos} isVisible={true} />)).not.toThrow();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles zero fear level', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 0,
        despair: 0,
        maxSanity: 100,
      }));

      expect(() => render(<SDFVillain position={[0, 0, 0]} isVisible={true} />)).not.toThrow();
    });

    it('handles rapid visibility toggles', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 40,
        despair: 0,
        maxSanity: 100,
      }));

      const { rerender } = render(<SDFVillain position={[0, 0, 0]} isVisible={true} />);
      
      for (let i = 0; i < 10; i++) {
        rerender(<SDFVillain position={[0, 0, 0]} isVisible={i % 2 === 0} />);
      }
      
      expect(() => rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />)).not.toThrow();
    });
  });
});

// Additional tests: TapZones interactions
describe('TapZones - interactions and a11y', () => {
  it('hides zones when moving', () => {
    const { useGameStore } = require('../../game/store');
    useGameStore.mockImplementation(() => ({
      availableMoves: [{ direction: 'north', nodeId: 'n1', isExit: false }],
      isMoving: true,
      startMoveTo: vi.fn(),
    }));
    const { container } = render(<TapZones />);
    expect(container.querySelector('[data-testid^="tap-zone-"]')).toBeNull();
  });

  it('renders buttons with roles for available moves', () => {
    const { useGameStore } = require('../../game/store');
    useGameStore.mockImplementation(() => ({
      availableMoves: [{ direction: 'north', nodeId: 'n1', isExit: false }],
      isMoving: false,
      startMoveTo: vi.fn(),
    }));
    const { getByRole } = render(<TapZones />);
    expect(getByRole('button')).toBeInTheDocument();
  });
});
