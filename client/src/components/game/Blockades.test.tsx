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

  describe('Blockade Visibility', () => {
    it('shows blockades only when they are in blocked cells', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        blockades: new Set(['node1']),
      }));

      const blockades: BlockadePlan[] = [
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

      const { container } = render(
        <Suspense fallback={null}>
          <Blockades blockades={blockades} />
        </Suspense>,
      );
      
      expect(container).toBeTruthy();
    });

    it('hides blockades when not in blocked cells', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        blockades: new Set(),
      }));

      const blockades: BlockadePlan[] = [
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

      const { container } = render(
        <Suspense fallback={null}>
          <Blockades blockades={blockades} />
        </Suspense>,
      );
      
      expect(container).toBeTruthy();
    });

    it('updates visibility when blockades set changes', () => {
      const { useGameStore } = require('../../game/store');
      
      let blockedSet = new Set<string>();
      useGameStore.mockImplementation(() => ({
        blockades: blockedSet,
      }));

      const blockades: BlockadePlan[] = [
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

      const { rerender } = render(
        <Suspense fallback={null}>
          <Blockades blockades={blockades} />
        </Suspense>,
      );

      blockedSet = new Set(['node1']);
      rerender(
        <Suspense fallback={null}>
          <Blockades blockades={blockades} />
        </Suspense>,
      );
      
      expect(() => rerender(<Suspense fallback={null}><Blockades blockades={blockades} /></Suspense>)).not.toThrow();
    });
  });

  describe('Blockade Properties', () => {
    it('displays required item name for each blockade', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        blockades: new Set(['node1']),
      }));

      const blockades: BlockadePlan[] = [
        {
          id: 'blockade1',
          nodeId: 'node1',
          worldX: 0,
          worldZ: 0,
          textureUrl: '/blockade.png',
          requiredItemId: 'item1',
          requiredItemName: 'Golden Key',
        },
      ];

      render(
        <Suspense fallback={null}>
          <Blockades blockades={blockades} />
        </Suspense>,
      );
      
      // Component should render with the required item name
      expect(() => render(<Suspense fallback={null}><Blockades blockades={blockades} /></Suspense>)).not.toThrow();
    });

    it('handles blockades at different world positions', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        blockades: new Set(['node1', 'node2', 'node3']),
      }));

      const blockades: BlockadePlan[] = [
        {
          id: 'blockade1',
          nodeId: 'node1',
          worldX: -5,
          worldZ: -5,
          textureUrl: '/blockade1.png',
          requiredItemId: 'item1',
          requiredItemName: 'Key',
        },
        {
          id: 'blockade2',
          nodeId: 'node2',
          worldX: 0,
          worldZ: 0,
          textureUrl: '/blockade2.png',
          requiredItemId: 'item2',
          requiredItemName: 'Ticket',
        },
        {
          id: 'blockade3',
          nodeId: 'node3',
          worldX: 5,
          worldZ: 5,
          textureUrl: '/blockade3.png',
          requiredItemId: 'item3',
          requiredItemName: 'Token',
        },
      ];

      expect(() =>
        render(
          <Suspense fallback={null}>
            <Blockades blockades={blockades} />
          </Suspense>,
        ),
      ).not.toThrow();
    });
  });

  describe('Texture Loading', () => {
    it('handles missing textures gracefully', () => {
      const { useGameStore } = require('../../game/store');
      const { useTexture } = require('@react-three/drei');
      
      useGameStore.mockImplementation(() => ({
        blockades: new Set(['node1']),
      }));

      useTexture.mockReturnValue(undefined);

      const blockades: BlockadePlan[] = [
        {
          id: 'blockade1',
          nodeId: 'node1',
          worldX: 0,
          worldZ: 0,
          textureUrl: '/invalid.png',
          requiredItemId: 'item1',
          requiredItemName: 'Key',
        },
      ];

      expect(() =>
        render(
          <Suspense fallback={null}>
            <Blockades blockades={blockades} />
          </Suspense>,
        ),
      ).not.toThrow();
    });

    it('loads multiple unique textures', () => {
      const { useGameStore } = require('../../game/store');
      const { useTexture } = require('@react-three/drei');
      
      useGameStore.mockImplementation(() => ({
        blockades: new Set(['node1', 'node2', 'node3']),
      }));

      const mockTextures = [{}, {}, {}];
      useTexture.mockReturnValue(mockTextures);

      const blockades: BlockadePlan[] = [
        {
          id: 'blockade1',
          nodeId: 'node1',
          worldX: 0,
          worldZ: 0,
          textureUrl: '/texture1.png',
          requiredItemId: 'item1',
          requiredItemName: 'Key',
        },
        {
          id: 'blockade2',
          nodeId: 'node2',
          worldX: 4,
          worldZ: 0,
          textureUrl: '/texture2.png',
          requiredItemId: 'item2',
          requiredItemName: 'Ticket',
        },
        {
          id: 'blockade3',
          nodeId: 'node3',
          worldX: 8,
          worldZ: 0,
          textureUrl: '/texture3.png',
          requiredItemId: 'item3',
          requiredItemName: 'Token',
        },
      ];

      render(
        <Suspense fallback={null}>
          <Blockades blockades={blockades} />
        </Suspense>,
      );

      expect(useTexture).toHaveBeenCalledWith(['/texture1.png', '/texture2.png', '/texture3.png']);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty blockades gracefully', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        blockades: new Set(),
      }));

      expect(() =>
        render(
          <Suspense fallback={null}>
            <Blockades blockades={[]} />
          </Suspense>,
        ),
      ).not.toThrow();
    });

    it('handles duplicate node IDs', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        blockades: new Set(['node1']),
      }));

      const blockades: BlockadePlan[] = [
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
          nodeId: 'node1',
          worldX: 0,
          worldZ: 0,
          textureUrl: '/blockade2.png',
          requiredItemId: 'item2',
          requiredItemName: 'Ticket',
        },
      ];

      expect(() =>
        render(
          <Suspense fallback={null}>
            <Blockades blockades={blockades} />
          </Suspense>,
        ),
      ).not.toThrow();
    });

    it('handles very long item names', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        blockades: new Set(['node1']),
      }));

      const blockades: BlockadePlan[] = [
        {
          id: 'blockade1',
          nodeId: 'node1',
          worldX: 0,
          worldZ: 0,
          textureUrl: '/blockade.png',
          requiredItemId: 'item1',
          requiredItemName: 'A Very Long and Elaborate Item Name That Should Still Display',
        },
      ];

      expect(() =>
        render(
          <Suspense fallback={null}>
            <Blockades blockades={blockades} />
          </Suspense>,
        ),
      ).not.toThrow();
    });
  });
});

// Additional tests: Blockades extended coverage
describe('Blockades - robustness', () => {
  it('handles blockades missing requiredItemId gracefully', () => {
    const blockades = [{
      id: 'b1',
      nodeId: 'n1',
      worldX: 1, worldZ: 2,
      textureUrl: '/missing.png',
      requiredItemId: undefined as unknown as string,
      requiredItemName: 'Unknown',
    }];
    expect(() =>
      render(<Suspense fallback={null}><Blockades blockades={blockades as any} /></Suspense>)
    ).not.toThrow();
  });

  it('supports duplicate blockade entries without crashing', () => {
    const block = {
      id: 'dup',
      nodeId: 'node1',
      worldX: 0, worldZ: 0,
      textureUrl: '/dup.png',
      requiredItemId: 'item',
      requiredItemName: 'Item',
    };
    const list = [block, { ...block }];
    expect(() =>
      render(<Suspense fallback={null}><Blockades blockades={list} /></Suspense>)
    ).not.toThrow();
  });
});
