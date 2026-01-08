import { render } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { BlockadePlan } from '../../game/spawnPlan';
import { Blockades } from './Blockades';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// Mock drei
vi.mock('@react-three/drei', () => ({
  Billboard: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Text: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  useTexture: vi.fn((urls) => {
    if (Array.isArray(urls)) {
      return urls.map(() => ({}));
    }
    return {};
  }),
}));

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn(() => ({
    blockades: new Set(),
  })),
}));

describe('Blockades', () => {
  const mockBlockades: BlockadePlan[] = [
    {
      id: 'blockade1',
      nodeId: 'node1',
      worldX: 0,
      worldZ: 0,
      textureUrl: '/blockade.png',
      requiredItemId: 'item1',
      requiredItemName: 'Key',
    },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <Suspense fallback={null}>
        <Blockades blockades={[]} />
      </Suspense>,
    );
    expect(container).toBeDefined();
  });

  it('accepts blockades prop', () => {
    expect(() =>
      render(
        <Suspense fallback={null}>
          <Blockades blockades={mockBlockades} />
        </Suspense>,
      ),
    ).not.toThrow();
  });

  it('renders with empty blockades array', () => {
    const { container } = render(
      <Suspense fallback={null}>
        <Blockades blockades={[]} />
      </Suspense>,
    );
    expect(container).toBeTruthy();
  });

  it('renders with multiple blockades', () => {
    const multipleBlockades: BlockadePlan[] = [
      {
        id: 'blockade1',
        nodeId: 'node1',
        worldX: 0,
        worldZ: 0,
        textureUrl: '/blockade1.png',
        requiredItemId: 'item1',
        requiredItemName: 'Key',
      },
      {
        id: 'blockade2',
        nodeId: 'node2',
        worldX: 4,
        worldZ: 0,
        textureUrl: '/blockade2.png',
        requiredItemId: 'item2',
        requiredItemName: 'Ticket',
      },
    ];

    expect(() =>
      render(
        <Suspense fallback={null}>
          <Blockades blockades={multipleBlockades} />
        </Suspense>,
      ),
    ).not.toThrow();
  });
});
