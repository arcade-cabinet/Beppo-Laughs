import seedrandom from 'seedrandom';

export type AssetCatalog = {
  generatedAt: string;
  images: {
    coreFloorTextures: CatalogImageAsset[];
    coreWallTextures: CatalogImageAsset[];
    wallTextures: CatalogImageAsset[];
    floorTextures: CatalogImageAsset[];
    obstacles: CatalogImageAsset[];
    solutionItems: CatalogImageAsset[];
    characters: CatalogImageAsset[];
    backdrops: CatalogImageAsset[];
    all: CatalogImageAsset[];
  };
  videos: CatalogVideoAsset[];
};

export type CatalogImageAsset = {
  id: string;
  fileName: string;
  prompt: string;
  aspectRatio: string;
  group: 'core' | 'extended';
  tags: string[];
};

export type CatalogVideoAsset = {
  id: string;
  fileName: string;
  prompt: string;
  aspectRatio: string;
  durationSeconds: number;
  group: 'core' | 'extended';
};

export const ASSET_CATALOG_PATH = '/assets/asset-catalog.json';
export const ASSET_IMAGE_BASE = '/assets/generated_images/';

export async function loadAssetCatalog(): Promise<AssetCatalog | null> {
  try {
    const response = await fetch(ASSET_CATALOG_PATH, { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()) as AssetCatalog;
  } catch {
    return null;
  }
}

export function pickSeededAsset<T>(assets: T[], seed: string, salt: string): T | null {
  if (!assets.length) return null;
  const rng = seedrandom(`${seed}:${salt}`);
  const idx = Math.floor(rng() * assets.length);
  return assets[idx] || null;
}
