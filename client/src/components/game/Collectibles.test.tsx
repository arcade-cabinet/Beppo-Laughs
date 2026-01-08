import { render } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { MazeGeometry } from '../../game/maze/geometry';
import { Collectibles } from './Collectibles';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// Mock drei
vi.mock('@react-three/drei', () => ({
  Billboard: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Text: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  useTexture: vi.fn(() => ({})),
}));

// Mock assetCatalog
vi.mock('../../game/assetCatalog', () => ({
  ASSET_IMAGE_BASE: '/assets',
  loadAssetCatalog: vi.fn().mockResolvedValue([]),
}));

// Mock textures
vi.mock('../../game/textures', () => ({
  COLLECTIBLE_NAMES: ['balloon', 'ticket'],
  COLLECTIBLE_TEXTURE_URLS: ['/balloon.png', '/ticket.png'],
}));

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn(() => ({
    currentNode: 'center',
    blockades: new Set(),
    collectedItems: new Set(),
    nearbyItem: null,
    setNearbyItem: vi.fn(),
  })),
}));

describe('Collectibles', () => {
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
          connections: [],
          isCenter: true,
          isExit: false,
        },
      ],
    ]),
    exitNodeIds: [],
  };

  it('renders without crashing', () => {
    const { container } = render(
      <Suspense fallback={null}>
        <Collectibles geometry={mockGeometry} />
      </Suspense>,
    );
    expect(container).toBeDefined();
  });

  it('accepts geometry prop', () => {
    expect(() =>
      render(
        <Suspense fallback={null}>
          <Collectibles geometry={mockGeometry} />
        </Suspense>,
      ),
    ).not.toThrow();
  });

  it('accepts items prop', () => {
    const items = [
      {
        id: 'item1',
        worldX: 0,
        worldZ: 0,
        nodeId: 'center',
        textureUrl: '/balloon.png',
        name: 'Balloon',
      },
    ];
    expect(() =>
      render(
        <Suspense fallback={null}>
          <Collectibles geometry={mockGeometry} items={items} />
        </Suspense>,
      ),
    ).not.toThrow();
  });

  it('renders with empty items array', () => {
    const { container } = render(
      <Suspense fallback={null}>
        <Collectibles geometry={mockGeometry} items={[]} />
      </Suspense>,
    );
    expect(container).toBeTruthy();
  });
});

// Additional tests: Collectibles behaviors
describe('Collectibles - behaviors', () => {

  it('tolerates missing texture url', () => {
    const geometry = {
      walls: [], floor: { x:0,z:0,width:1,depth:1 },
      centerNodeId: 'center', railNodes: new Map([['center', { id: 'center', gridX:0, gridY:0, worldX:0, worldZ:0, connections:[], isCenter:true, isExit:false }]]),
      exitNodeIds: [],
    } as any;
    const items = [{ id:'i2', worldX:1, worldZ:1, nodeId:'center', textureUrl: undefined as any, name:'Unknown' }];
    expect(() => render(<Suspense fallback={null}><Collectibles geometry={geometry} items={items as any} /></Suspense>)).not.toThrow();
  });
});
