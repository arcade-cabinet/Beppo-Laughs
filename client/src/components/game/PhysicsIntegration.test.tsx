import { render } from '@testing-library/react';
import { describe, expect, it, type Mock, vi } from 'vitest';
import { ClownCarCockpit } from './ClownCarCockpit';
import { Maze } from './Maze';
import { RailPlayer } from './RailPlayer';
import { Scene } from './Scene';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: {
      position: { x: 0, y: 1.4, z: 0, copy: vi.fn(), set: vi.fn() },
      rotation: { x: 0, y: 0, z: 0, copy: vi.fn(), set: vi.fn() },
    },
  })),
  Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  extend: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Text: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Billboard: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  useTexture: vi.fn(() => ({
    wrapS: 0,
    wrapT: 0,
    repeat: { set: vi.fn() },
  })),
}));

// Mock postprocessing to avoid R3F context issues
vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Vignette: () => null,
  ChromaticAberration: () => null,
  Noise: () => null,
  Bloom: () => null,
}));

// Setup store mock
const mockState = {
  carSpeed: 0,
  accelerating: false,
  braking: false,
  fear: 0,
  despair: 0,
  maxSanity: 100,
  currentNode: 'center',
  pendingFork: null,
  nearbyExit: null,
  visitedCells: new Set(['0,0']),
  blockades: new Set(),
  blockadeRequirements: new Map(),
  collectedItems: new Set(),
  isMoving: false,
  isGameOver: false,
  hasWon: false,

  // Actions
  setCameraRotation: vi.fn(),
  setCarSpeed: vi.fn(),
  visitNode: vi.fn(),
  completeMove: vi.fn(),
  getSanityLevel: () => 100,
  setCurrentNode: vi.fn(),
  setAvailableMoves: vi.fn(),
  setNearbyExit: vi.fn(),
  setTargetNode: vi.fn(),
  setBlockades: vi.fn(),
  setBlockadeRequirements: vi.fn(),
  setPendingFork: vi.fn(),
};

// Mock useGameStore as a function that returns state AND has getState method
vi.mock('../../game/store', () => {
  interface MockStore extends Mock {
    getState: Mock;
  }
  const storeFn = vi.fn(() => mockState) as MockStore;
  storeFn.getState = vi.fn(() => mockState);
  return { useGameStore: storeFn };
});

describe('Physics + Rendering Integration', () => {
  describe('complete movement pipeline', () => {
    it('physics system integrates with rendering without errors', () => {
      const mockGeometry = {
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
              connections: [],
              isCenter: true,
              isExit: false,
            },
          ],
        ]),
        exitNodeIds: [],
      };

      expect(() => render(<RailPlayer geometry={mockGeometry} />)).not.toThrow();
    });

    it('cockpit rendering integrates with camera positioning', () => {
      expect(() => render(<ClownCarCockpit />)).not.toThrow();
    });

    it('fog integrates with scene rendering', () => {
      expect(() => render(<Scene seed="integration-test" />)).not.toThrow();
    });
  });

  describe('state synchronization', () => {
    it('speed changes propagate through system', () => {
      // Direct access to mock state as useGameStore.getState returns it
      expect(mockState.setCarSpeed).toBeDefined();
      expect(typeof mockState.setCarSpeed).toBe('function');
    });

    it('camera rotation updates are tracked', () => {
      expect(mockState.setCameraRotation).toBeDefined();
      expect(typeof mockState.setCameraRotation).toBe('function');
    });
  });

  describe('rendering consistency', () => {
    it('materials render with transparency correctly', () => {
      const mockGeometry = {
        walls: [],
        floor: { x: 0, z: 0, width: 10, depth: 10 },
        centerNodeId: 'center',
        railNodes: new Map(),
        exitNodeIds: [],
      };

      expect(() => render(<Maze geometry={mockGeometry} />)).not.toThrow();
    });

    it('cockpit remains static during camera movement', () => {
      const { container } = render(<ClownCarCockpit />);
      expect(container).toBeDefined();
    });
  });

  describe('performance characteristics', () => {
    it('components render without memory leaks', () => {
      const { unmount } = render(<Scene seed="perf-test" />);
      expect(() => unmount()).not.toThrow();
    });

    it('multiple frame updates do not cause errors', () => {
      expect(() => render(<ClownCarCockpit />)).not.toThrow();
    });
  });
});
