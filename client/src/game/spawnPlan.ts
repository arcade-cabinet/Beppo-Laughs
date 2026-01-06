import seedrandom from 'seedrandom';
import { ASSET_IMAGE_BASE, type AssetCatalog, type CatalogImageAsset } from './assetCatalog';
import type { MazeGeometry } from './maze/geometry';

export type BlockadePlan = {
  nodeId: string;
  worldX: number;
  worldZ: number;
  textureUrl: string;
  requiredItemId: string;
  requiredItemName: string;
};

export type CollectiblePlan = {
  id: string;
  name: string;
  nodeId: string;
  worldX: number;
  worldZ: number;
  textureUrl: string;
  unlocksBlockadeId?: string;
};

export type SpawnPlan = {
  blockades: BlockadePlan[];
  collectibles: CollectiblePlan[];
};

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1)}` : word))
    .join(' ');

export const formatAssetLabel = (assetId: string) => {
  const cleaned = assetId
    .replace(/^(item_|paper_mache_|popup_|slide_|drop_)/, '')
    .replace(/_cutout$/, '')
    .replace(/_item$/, '')
    .replace(/_/g, ' ')
    .trim();

  return toTitleCase(cleaned || assetId);
};

const seededShuffle = <T>(items: T[], seed: string) => {
  const rng = seedrandom(seed);
  const output = [...items];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
};

const pickAssetAt = (assets: CatalogImageAsset[], index: number, seed: string) => {
  if (!assets.length) return null;
  const shuffled = seededShuffle(assets, seed);
  return shuffled[index % shuffled.length] ?? null;
};

export const buildSpawnPlan = ({
  geometry,
  seed,
  catalog,
}: {
  geometry: MazeGeometry;
  seed: string;
  catalog: AssetCatalog | null;
}): SpawnPlan | null => {
  if (!catalog) return null;

  const obstacleAssets = catalog.images.obstacles;
  const solutionAssets = [
    ...catalog.images.coreCollectibles,
    ...catalog.images.solutionItems,
  ];

  if (!obstacleAssets.length || !solutionAssets.length) return null;

  const seedBase = seed || 'default';
  const nodes = Array.from(geometry.railNodes.values());
  const avoidNodes = new Set([geometry.centerNodeId, ...geometry.exitNodeIds]);
  const candidateNodes = nodes.filter((node) => !avoidNodes.has(node.id));

  if (!candidateNodes.length) return null;

  const blockadeCount = Math.max(1, Math.floor(nodes.length / 10));
  const blockadeNodes = seededShuffle(candidateNodes, `${seedBase}:blockade-nodes`).slice(
    0,
    blockadeCount,
  );
  const remainingNodes = seededShuffle(
    candidateNodes.filter((node) => !blockadeNodes.some((b) => b.id === node.id)),
    `${seedBase}:collectible-nodes`,
  );

  const blockades: BlockadePlan[] = blockadeNodes.map((node, index) => {
    const obstacleAsset = pickAssetAt(obstacleAssets, index, `${seedBase}:obstacles`);
    const solutionAsset = pickAssetAt(solutionAssets, index, `${seedBase}:solutions`);
    const requiredItemId = `unlock-${node.id}`;
    const requiredItemName = formatAssetLabel(solutionAsset?.id ?? 'Circus Relic');

    return {
      nodeId: node.id,
      worldX: node.worldX,
      worldZ: node.worldZ,
      textureUrl: obstacleAsset ? `${ASSET_IMAGE_BASE}${obstacleAsset.fileName}` : '',
      requiredItemId,
      requiredItemName,
    };
  });

  const collectibles: CollectiblePlan[] = blockades.map((blockade, index) => {
    const node = remainingNodes[index % remainingNodes.length] ?? blockadeNodes[index];
    const solutionAsset = pickAssetAt(solutionAssets, index, `${seedBase}:solutions`);

    return {
      id: blockade.requiredItemId,
      name: blockade.requiredItemName,
      nodeId: node.id,
      worldX: node.worldX,
      worldZ: node.worldZ,
      textureUrl: solutionAsset ? `${ASSET_IMAGE_BASE}${solutionAsset.fileName}` : '',
      unlocksBlockadeId: blockade.nodeId,
    };
  });

  return { blockades, collectibles };
};
