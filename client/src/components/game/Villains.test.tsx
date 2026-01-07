import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MazeGeometry } from '../../game/maze/geometry';
import { Villains } from './Villains';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: {
      position: { x: 0, y: 0, z: 0 },
    },
  })),
}));

// Mock drei
vi.mock('@react-three/drei', () => ({
  Billboard: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Text: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn(() => ({
    currentNode: 'center',
    fear: 0,
    despair: 0,
    increaseFear: vi.fn(),
    increaseDespair: vi.fn(),
  })),
}));

describe('Villains', () => {
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
    ]),
    exitNodeIds: [],
  };

  it('renders without crashing', () => {
    const { container } = render(<Villains geometry={mockGeometry} />);
    expect(container).toBeDefined();
  });

  it('accepts geometry prop', () => {
    expect(() => render(<Villains geometry={mockGeometry} />)).not.toThrow();
  });

  it('renders with empty geometry', () => {
    const emptyGeometry: MazeGeometry = {
      walls: [],
      floor: { x: 0, z: 0, width: 0, depth: 0 },
      centerNodeId: '',
      railNodes: new Map(),
      exitNodeIds: [],
    };
    const { container } = render(<Villains geometry={emptyGeometry} />);
    expect(container).toBeTruthy();
  });
});

// Additional tests: Villains rendering stability
describe('Villains - stability', () => {
  it('renders with empty villains array', () => {
    expect(() => render(<Villains villains={[]} />)).not.toThrow();
  });

  it('handles duplicate villain entries', () => {
    const v = { id: 'v1', worldX: 0, worldZ: 0, kind: 'shadow' } as any;
    expect(() => render(<Villains villains={[v, { ...v }]} />)).not.toThrow();
  });
});
