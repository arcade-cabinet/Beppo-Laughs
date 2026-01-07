/**
 * Global Texture Library
 *
 * Centralized management of all game textures and asset URLs.
 * All textures are loaded from the public/assets directory at runtime
 * with proper base path support for GitHub Pages deployment.
 */

// Get base URL from Vite/Astro environment (includes GitHub Pages base path if deployed)
const BASE_URL = import.meta.env.BASE_URL || '/';
// Ensure BASE_URL ends with slash for proper path concatenation
const ASSETS_BASE = BASE_URL.endsWith('/')
  ? `${BASE_URL}assets/generated_images/`
  : `${BASE_URL}/assets/generated_images/`;

// Helper to create asset URL
const asset = (filename: string) => `${ASSETS_BASE}${filename}`;

// Maze environment textures
const sawdustFloorUrl = asset('circus_sawdust_floor_texture.png');
const grassGroundUrl = asset('dark_muddy_grass_ground_texture.png');
// Paper mâché collectible items
const ticketItemUrl = asset('paper_mache_circus_ticket_item.png');
const keyItemUrl = asset('paper_mache_key_item.png');
const hedgeWallUrl = asset('seamless_dark_hedge_texture.png');
const canvasCeilingUrl = asset('vintage_circus_tent_canvas_texture.png');

// Video assets - Future feature for cutscene videos
// TODO: Implement video support when asset generation pipeline includes video rendering
const beppoGameOverUrl = '';

/**
 * Collectible item texture definitions
 */
export const COLLECTIBLE_TEXTURES = {
  CIRCUS_TICKET: {
    url: ticketItemUrl,
    name: 'CIRCUS TICKET',
    description: 'A mysterious paper mâché circus ticket. Clear your path!',
  },
  MYSTERY_KEY: {
    url: keyItemUrl,
    name: 'MYSTERY KEY',
    description: 'An ornate paper mâché key. Unlocks the exit!',
  },
} as const;

/**
 * Array of collectible texture URLs for random selection
 */
export const COLLECTIBLE_TEXTURE_URLS = Object.values(COLLECTIBLE_TEXTURES).map((item) => item.url);

/**
 * Array of collectible names for random selection
 */
export const COLLECTIBLE_NAMES = Object.values(COLLECTIBLE_TEXTURES).map((item) => item.name);

/**
 * Maze environment textures
 */
export const MAZE_TEXTURES = {
  FLOOR_SAWDUST: {
    url: sawdustFloorUrl,
    name: 'Circus Sawdust Floor',
    description: 'Worn circus tent flooring with scattered sawdust',
  },
  CEILING_CANVAS: {
    url: canvasCeilingUrl,
    name: 'Vintage Circus Tent Canvas',
    description: 'Aged carnival tent canvas with stains and weathering',
  },
  GROUND_GRASS: {
    url: grassGroundUrl,
    name: 'Dark Muddy Grass',
    description: 'Overgrown and muddy carnival grounds',
  },
  WALL_HEDGE: {
    url: hedgeWallUrl,
    name: 'Dark Hedge Wall',
    description: 'Dense, twisted hedge maze walls',
  },
} as const;

/**
 * Video assets
 */
export const VIDEO_ASSETS = {
  BEPPO_GAME_OVER: {
    url: beppoGameOverUrl,
    name: 'Beppo Game Over',
    description: 'Beppo laughing as player loses',
  },
} as const;

/**
 * Texture metadata for debugging and asset tracking
 */
export const TEXTURE_METADATA = {
  collectibles: COLLECTIBLE_TEXTURES,
  maze: MAZE_TEXTURES,
  videos: VIDEO_ASSETS,
} as const;

/**
 * Helper function to get a random collectible texture
 */
export function getRandomCollectibleTexture() {
  const textures = Object.values(COLLECTIBLE_TEXTURES);
  return textures[Math.floor(Math.random() * textures.length)];
}

/**
 * Helper function to get all available textures of a category
 */
export function getTexturesByCategory(category: keyof typeof TEXTURE_METADATA) {
  return TEXTURE_METADATA[category];
}
