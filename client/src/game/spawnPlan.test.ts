import { describe, expect, it } from 'vitest';
import type { AssetCatalog } from './assetCatalog';
import type { MazeGeometry } from './maze/geometry';
import { buildSpawnPlan, formatAssetLabel } from './spawnPlan';

describe('formatAssetLabel', () => {
  it('removes item_ prefix', () => {
    expect(formatAssetLabel('item_balloon')).toBe('Balloon');
  });

  it('removes paper_mache_ prefix', () => {
    expect(formatAssetLabel('paper_mache_elephant')).toBe('Elephant');
  });

  it('removes popup_ prefix', () => {
    expect(formatAssetLabel('popup_clown')).toBe('Clown');
  });

  it('removes slide_ prefix', () => {
    expect(formatAssetLabel('slide_carnival')).toBe('Carnival');
  });

  it('removes drop_ prefix', () => {
    expect(formatAssetLabel('drop_ticket')).toBe('Ticket');
  });

  it('removes _cutout suffix', () => {
    expect(formatAssetLabel('elephant_cutout')).toBe('Elephant');
  });

  it('removes _item suffix', () => {
    expect(formatAssetLabel('balloon_item')).toBe('Balloon');
  });

  it('replaces underscores with spaces', () => {
    expect(formatAssetLabel('circus_tent')).toBe('Circus Tent');
  });

  it('converts to title case', () => {
    expect(formatAssetLabel('big_top_tent')).toBe('Big Top Tent');
  });

  it('handles multiple transformations', () => {
    expect(formatAssetLabel('item_circus_tent_cutout')).toBe('Circus Tent');
  });

  it('handles empty string', () => {
    expect(formatAssetLabel('')).toBe('');
  });

  it('handles single word', () => {
    expect(formatAssetLabel('balloon')).toBe('Balloon');
  });

  it('preserves case after first letter', () => {
    expect(formatAssetLabel('mcdonald_mascot')).toBe('Mcdonald Mascot');
  });
});

describe('buildSpawnPlan', () => {
  it('returns null when catalog is null', () => {
    const mockGeometry = {
      centerNodeId: 'center',
      exitNodeIds: [],
      railNodes: new Map([
        ['node1', { id: 'node1', worldX: 0, worldZ: 0, connections: [] }],
      ]),
    } as unknown as MazeGeometry;

    const result = buildSpawnPlan({
      geometry: mockGeometry,
      seed: 'test',
      catalog: null,
    });

    expect(result).toBeNull();
  });

  it('returns null when no obstacle assets', () => {
    const mockCatalog: AssetCatalog = {
      images: {
        obstacles: [],
        coreCollectibles: [{ id: 'item1', fileName: 'item1.png', tags: [] }],
        solutionItems: [],
        ambientPieces: [],
      },
    };

    const mockGeometry = {
      centerNodeId: 'center',
      exitNodeIds: [],
      railNodes: new Map([
        ['node1', { id: 'node1', worldX: 0, worldZ: 0, connections: [] }],
      ]),
    } as unknown as MazeGeometry;

    const result = buildSpawnPlan({
      geometry: mockGeometry,
      seed: 'test',
      catalog: mockCatalog,
    });

    expect(result).toBeNull();
  });

  it('returns null when no solution assets', () => {
    const mockCatalog: AssetCatalog = {
      images: {
        obstacles: [{ id: 'obstacle1', fileName: 'obstacle1.png', tags: [] }],
        coreCollectibles: [],
        solutionItems: [],
        ambientPieces: [],
      },
    };

    const mockGeometry = {
      centerNodeId: 'center',
      exitNodeIds: [],
      railNodes: new Map([
        ['node1', { id: 'node1', worldX: 0, worldZ: 0, connections: [] }],
      ]),
    } as unknown as MazeGeometry;

    const result = buildSpawnPlan({
      geometry: mockGeometry,
      seed: 'test',
      catalog: mockCatalog,
    });

    expect(result).toBeNull();
  });

  it('returns empty arrays when not enough candidate nodes', () => {
    const mockCatalog: AssetCatalog = {
      images: {
        obstacles: [{ id: 'obstacle1', fileName: 'obstacle1.png', tags: [] }],
        coreCollectibles: [{ id: 'item1', fileName: 'item1.png', tags: [] }],
        solutionItems: [],
        ambientPieces: [],
      },
    };

    const mockGeometry = {
      centerNodeId: 'center',
      exitNodeIds: ['exit1'],
      railNodes: new Map([
        ['center', { id: 'center', worldX: 0, worldZ: 0, connections: [] }],
      ]),
    } as unknown as MazeGeometry;

    const result = buildSpawnPlan({
      geometry: mockGeometry,
      seed: 'test',
      catalog: mockCatalog,
    });

    expect(result).toEqual({ blockades: [], collectibles: [] });
  });

  it('generates spawn plan with valid geometry and catalog', () => {
    const mockCatalog: AssetCatalog = {
      images: {
        obstacles: [{ id: 'obstacle1', fileName: 'obstacle1.png', tags: [] }],
        coreCollectibles: [{ id: 'item1', fileName: 'item1.png', tags: [] }],
        solutionItems: [],
        ambientPieces: [],
      },
    };

    const mockGeometry = {
      centerNodeId: 'center',
      exitNodeIds: [],
      railNodes: new Map([
        ['center', { id: 'center', worldX: 0, worldZ: 0, connections: [] }],
        ['node1', { id: 'node1', worldX: 10, worldZ: 10, connections: [] }],
        ['node2', { id: 'node2', worldX: 20, worldZ: 20, connections: [] }],
        ['node3', { id: 'node3', worldX: 30, worldZ: 30, connections: [] }],
        ['node4', { id: 'node4', worldX: 40, worldZ: 40, connections: [] }],
        ['node5', { id: 'node5', worldX: 50, worldZ: 50, connections: [] }],
        ['node6', { id: 'node6', worldX: 60, worldZ: 60, connections: [] }],
        ['node7', { id: 'node7', worldX: 70, worldZ: 70, connections: [] }],
        ['node8', { id: 'node8', worldX: 80, worldZ: 80, connections: [] }],
        ['node9', { id: 'node9', worldX: 90, worldZ: 90, connections: [] }],
        ['node10', { id: 'node10', worldX: 100, worldZ: 100, connections: [] }],
        ['node11', { id: 'node11', worldX: 110, worldZ: 110, connections: [] }],
      ]),
    } as unknown as MazeGeometry;

    const result = buildSpawnPlan({
      geometry: mockGeometry,
      seed: 'test',
      catalog: mockCatalog,
    });

    expect(result).toBeTruthy();
    expect(result?.blockades).toBeInstanceOf(Array);
    expect(result?.collectibles).toBeInstanceOf(Array);
    expect(result?.blockades.length).toBeGreaterThan(0);
    expect(result?.collectibles.length).toBe(result?.blockades.length);
  });

  it('uses deterministic seeding', () => {
    const mockCatalog: AssetCatalog = {
      images: {
        obstacles: [
          { id: 'obstacle1', fileName: 'obstacle1.png', tags: [] },
          { id: 'obstacle2', fileName: 'obstacle2.png', tags: [] },
        ],
        coreCollectibles: [
          { id: 'item1', fileName: 'item1.png', tags: [] },
          { id: 'item2', fileName: 'item2.png', tags: [] },
        ],
        solutionItems: [],
        ambientPieces: [],
      },
    };

    const mockGeometry = {
      centerNodeId: 'center',
      exitNodeIds: [],
      railNodes: new Map([
        ['center', { id: 'center', worldX: 0, worldZ: 0, connections: [] }],
        ['node1', { id: 'node1', worldX: 10, worldZ: 10, connections: [] }],
        ['node2', { id: 'node2', worldX: 20, worldZ: 20, connections: [] }],
        ['node3', { id: 'node3', worldX: 30, worldZ: 30, connections: [] }],
        ['node4', { id: 'node4', worldX: 40, worldZ: 40, connections: [] }],
        ['node5', { id: 'node5', worldX: 50, worldZ: 50, connections: [] }],
        ['node6', { id: 'node6', worldX: 60, worldZ: 60, connections: [] }],
        ['node7', { id: 'node7', worldX: 70, worldZ: 70, connections: [] }],
        ['node8', { id: 'node8', worldX: 80, worldZ: 80, connections: [] }],
        ['node9', { id: 'node9', worldX: 90, worldZ: 90, connections: [] }],
        ['node10', { id: 'node10', worldX: 100, worldZ: 100, connections: [] }],
        ['node11', { id: 'node11', worldX: 110, worldZ: 110, connections: [] }],
      ]),
    } as unknown as MazeGeometry;

    const result1 = buildSpawnPlan({
      geometry: mockGeometry,
      seed: 'test-seed-123',
      catalog: mockCatalog,
    });

    const result2 = buildSpawnPlan({
      geometry: mockGeometry,
      seed: 'test-seed-123',
      catalog: mockCatalog,
    });

    expect(result1).toEqual(result2);
  });

  it('excludes center and exit nodes from spawn candidates', () => {
    const mockCatalog: AssetCatalog = {
      images: {
        obstacles: [{ id: 'obstacle1', fileName: 'obstacle1.png', tags: [] }],
        coreCollectibles: [{ id: 'item1', fileName: 'item1.png', tags: [] }],
        solutionItems: [],
        ambientPieces: [],
      },
    };

    const mockGeometry = {
      centerNodeId: 'center',
      exitNodeIds: ['exit1'],
      railNodes: new Map([
        ['center', { id: 'center', worldX: 0, worldZ: 0, connections: [] }],
        ['exit1', { id: 'exit1', worldX: 5, worldZ: 5, connections: [] }],
        ['node1', { id: 'node1', worldX: 10, worldZ: 10, connections: [] }],
        ['node2', { id: 'node2', worldX: 20, worldZ: 20, connections: [] }],
        ['node3', { id: 'node3', worldX: 30, worldZ: 30, connections: [] }],
        ['node4', { id: 'node4', worldX: 40, worldZ: 40, connections: [] }],
        ['node5', { id: 'node5', worldX: 50, worldZ: 50, connections: [] }],
        ['node6', { id: 'node6', worldX: 60, worldZ: 60, connections: [] }],
        ['node7', { id: 'node7', worldX: 70, worldZ: 70, connections: [] }],
        ['node8', { id: 'node8', worldX: 80, worldZ: 80, connections: [] }],
        ['node9', { id: 'node9', worldX: 90, worldZ: 90, connections: [] }],
        ['node10', { id: 'node10', worldX: 100, worldZ: 100, connections: [] }],
        ['node11', { id: 'node11', worldX: 110, worldZ: 110, connections: [] }],
      ]),
    } as unknown as MazeGeometry;

    const result = buildSpawnPlan({
      geometry: mockGeometry,
      seed: 'test',
      catalog: mockCatalog,
    });

    const allNodeIds = result?.blockades.map((b) => b.nodeId) ?? [];
    expect(allNodeIds).not.toContain('center');
    expect(allNodeIds).not.toContain('exit1');
  });

  it('generates matching collectible for each blockade', () => {
    const mockCatalog: AssetCatalog = {
      images: {
        obstacles: [{ id: 'obstacle1', fileName: 'obstacle1.png', tags: [] }],
        coreCollectibles: [{ id: 'item1', fileName: 'item1.png', tags: [] }],
        solutionItems: [],
        ambientPieces: [],
      },
    };

    const mockGeometry = {
      centerNodeId: 'center',
      exitNodeIds: [],
      railNodes: new Map([
        ['center', { id: 'center', worldX: 0, worldZ: 0, connections: [] }],
        ['node1', { id: 'node1', worldX: 10, worldZ: 10, connections: [] }],
        ['node2', { id: 'node2', worldX: 20, worldZ: 20, connections: [] }],
        ['node3', { id: 'node3', worldX: 30, worldZ: 30, connections: [] }],
        ['node4', { id: 'node4', worldX: 40, worldZ: 40, connections: [] }],
        ['node5', { id: 'node5', worldX: 50, worldZ: 50, connections: [] }],
        ['node6', { id: 'node6', worldX: 60, worldZ: 60, connections: [] }],
        ['node7', { id: 'node7', worldX: 70, worldZ: 70, connections: [] }],
        ['node8', { id: 'node8', worldX: 80, worldZ: 80, connections: [] }],
        ['node9', { id: 'node9', worldX: 90, worldZ: 90, connections: [] }],
        ['node10', { id: 'node10', worldX: 100, worldZ: 100, connections: [] }],
        ['node11', { id: 'node11', worldX: 110, worldZ: 110, connections: [] }],
      ]),
    } as unknown as MazeGeometry;

    const result = buildSpawnPlan({
      geometry: mockGeometry,
      seed: 'test',
      catalog: mockCatalog,
    });

    expect(result?.blockades.length).toBe(result?.collectibles.length);

    result?.blockades.forEach((blockade) => {
      const matchingCollectible = result?.collectibles.find(
        (c) => c.id === blockade.requiredItemId,
      );
      expect(matchingCollectible).toBeTruthy();
      expect(matchingCollectible?.unlocksBlockadeId).toBe(blockade.nodeId);
    });
  });

  it('uses fallback seed when seed is empty', () => {
    const mockCatalog: AssetCatalog = {
      images: {
        obstacles: [{ id: 'obstacle1', fileName: 'obstacle1.png', tags: [] }],
        coreCollectibles: [{ id: 'item1', fileName: 'item1.png', tags: [] }],
        solutionItems: [],
        ambientPieces: [],
      },
    };

    const mockGeometry = {
      centerNodeId: 'center',
      exitNodeIds: [],
      railNodes: new Map([
        ['center', { id: 'center', worldX: 0, worldZ: 0, connections: [] }],
        ['node1', { id: 'node1', worldX: 10, worldZ: 10, connections: [] }],
        ['node2', { id: 'node2', worldX: 20, worldZ: 20, connections: [] }],
        ['node3', { id: 'node3', worldX: 30, worldZ: 30, connections: [] }],
        ['node4', { id: 'node4', worldX: 40, worldZ: 40, connections: [] }],
        ['node5', { id: 'node5', worldX: 50, worldZ: 50, connections: [] }],
        ['node6', { id: 'node6', worldX: 60, worldZ: 60, connections: [] }],
        ['node7', { id: 'node7', worldX: 70, worldZ: 70, connections: [] }],
        ['node8', { id: 'node8', worldX: 80, worldZ: 80, connections: [] }],
        ['node9', { id: 'node9', worldX: 90, worldZ: 90, connections: [] }],
        ['node10', { id: 'node10', worldX: 100, worldZ: 100, connections: [] }],
        ['node11', { id: 'node11', worldX: 110, worldZ: 110, connections: [] }],
      ]),
    } as unknown as MazeGeometry;

    const result = buildSpawnPlan({
      geometry: mockGeometry,
      seed: '',
      catalog: mockCatalog,
    });

    expect(result).toBeTruthy();
    expect(result?.blockades.length).toBeGreaterThan(0);
  });
});
