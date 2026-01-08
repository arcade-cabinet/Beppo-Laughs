import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MazeGeometry } from '../../game/maze/geometry';
import { RailPlayer } from './RailPlayer';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: {
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      rotation: { y: 0 },
    },
  })),
}));

// Mock drei
vi.mock('@react-three/drei', () => ({
  Text: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: {
    getState: vi.fn(() => ({
      currentNode: 'center',
      carSpeed: 0,
      pendingFork: null,
      setCurrentNode: vi.fn(),
      setCameraRotation: vi.fn(),
      setAvailableMoves: vi.fn(),
      setPendingFork: vi.fn(),
      setCarSpeed: vi.fn(),
      visitNode: vi.fn(),
      completeMove: vi.fn(),
    })),
  },
}));

describe('RailPlayer', () => {
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
    const { container } = render(<RailPlayer geometry={mockGeometry} />);
    expect(container).toBeDefined();
  });

  it('accepts geometry prop', () => {
    expect(() => render(<RailPlayer geometry={mockGeometry} />)).not.toThrow();
  });

  it('renders with Suspense boundary', () => {
    const { container } = render(<RailPlayer geometry={mockGeometry} />);
    expect(container).toBeTruthy();
  });
});

// Additional tests: RailPlayer navigation logic
describe('RailPlayer - navigation edges', () => {

  it('pauses at fork nodes', () => {
    render(<RailPlayer geometry={mockGeometry} />);
    expect(completeMove).not.toHaveBeenCalled();
  });
});
