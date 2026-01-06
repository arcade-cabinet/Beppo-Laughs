/**
 * Global Texture Library
 *
 * Centralized management of all game textures and asset URLs.
 * All textures are imported from the attached_assets directory and bundled
 * by Vite during the build process.
 */

// Maze environment textures
import sawdustFloorUrl from '@assets/generated_images/circus_sawdust_floor_texture.png';
import grassGroundUrl from '@assets/generated_images/dark_muddy_grass_ground_texture.png';
// Paper mâché collectible items
import ticketItemUrl from '@assets/generated_images/paper_mache_circus_ticket_item.png';
import keyItemUrl from '@assets/generated_images/paper_mache_key_item.png';
import hedgeWallUrl from '@assets/generated_images/seamless_dark_hedge_texture.png';
import canvasCeilingUrl from '@assets/generated_images/vintage_circus_tent_canvas_texture.png';

// Video assets
import beppoGameOverUrl from '@assets/generated_videos/beppo_clown_emerging_laughing_game_over.mp4';

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
