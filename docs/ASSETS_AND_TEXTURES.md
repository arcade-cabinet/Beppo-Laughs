# Assets and Textures Guide

## Overview

This document describes how textures and assets are managed in Beppo Laughs. All game assets are centrally managed through the `client/src/game/textures.ts` library, which provides a single source of truth for all visual and media assets used throughout the game.

## Asset Organization

### Directory Structure

```
attached_assets/
├── generated_images/          # AI-generated 2D asset images
│   ├── paper_mache_*.png     # Collectible item textures
│   ├── *_floor_texture.png   # Maze floor textures
│   ├── *_canvas_texture.png  # Ceiling/wall textures
│   ├── *_texture.png         # Environment textures
│   └── *_cutout.png          # Character/NPC cutouts
└── generated_videos/          # AI-generated video assets
    └── beppo_clown_*.mp4     # Game state videos (win/lose)
```

### Texture Categories

#### 1. Collectible Textures (`COLLECTIBLE_TEXTURES`)

Paper mâché themed collectible items that appear in the maze:

- **CIRCUS_TICKET**: 1.3MB, used for maze navigation rewards
- **MYSTERY_KEY**: 1.3MB, used for maze blockade resolution

**Usage:**
```typescript
import { COLLECTIBLE_TEXTURES, COLLECTIBLE_TEXTURE_URLS, COLLECTIBLE_NAMES } from '../../game/textures';

// Get a specific texture
const ticketTexture = COLLECTIBLE_TEXTURES.CIRCUS_TICKET;

// Get all URLs for rendering
const textureUrl = COLLECTIBLE_TEXTURE_URLS[index];
const itemName = COLLECTIBLE_NAMES[index];
```

**Animation Effects:**
- **Pop-up**: 0.6 seconds on spawn (ease-out-quad)
- **Pop-down**: 0.5 seconds on collection (shrink + slide up)
- **Floating**: Continuous bob animation while waiting to be collected
- **Pulsing**: Scale pulse that intensifies when nearby or near blockades

#### 2. Maze Environment Textures (`MAZE_TEXTURES`)

Seamlessly tiling textures for maze walls, floors, and ceilings:

- **FLOOR_SAWDUST**: 2.5MB, circus tent floor with sawdust
  - Repeat: 16x16 tiles
  - Used for floor plane in maze
  
- **CEILING_CANVAS**: 2.4MB, aged carnival tent canvas
  - Repeat: 1x2 tiles
  - Used for ceiling plane in maze
  
- **GROUND_GRASS**: 2.3MB, dark muddy grass (for future use)
- **WALL_HEDGE**: 1.6MB, dark twisted hedge walls (for future use)

**Usage:**
```typescript
import { MAZE_TEXTURES } from '../../game/textures';
import { useTexture } from '@react-three/drei';

const floorTexture = useTexture(MAZE_TEXTURES.FLOOR_SAWDUST.url);
const ceilingTexture = useTexture(MAZE_TEXTURES.CEILING_CANVAS.url);
```

#### 3. Video Assets (`VIDEO_ASSETS`)

Full-video assets for game state transitions:

- **BEPPO_GAME_OVER**: 3.2MB MP4
  - Plays when player loses the game
  - Shows Beppo laughing as the player is consumed
  - Followed by "You Lost" overlay

**Usage:**
```typescript
import { VIDEO_ASSETS } from '../../game/textures';

const videoUrl = VIDEO_ASSETS.BEPPO_GAME_OVER.url;
```

## Asset Pipeline

### Generation

All textures and videos are generated using:
- **Google Imagen 4.0** (via Gemini API) for 2D cutouts and textures
- **Google Veo 3.1** (via Gemini API) for video assets

Generated assets are stored in `attached_assets/generated_images/` and `attached_assets/generated_videos/`, and mirrored to `client/public/assets/generated_images/` and `client/public/assets/generated_videos/` for runtime loading.
The generation script also writes a catalog for runtime selection at `client/public/assets/asset-catalog.json`, grouped by category so seeded maze logic can deterministically select walls, floors, obstacles, and items. Each entry includes tags (e.g., `floor`, `wall`, `obstacle`) for consistent selection rules.
For brand alignment notes and historical motif references, see `docs/VISUAL_REFERENCES.md`.

### Build Process

1. Assets are imported in `client/src/game/textures.ts`
2. Vite's asset pipeline processes them during build
3. Assets are bundled and optimized for production
4. Vite alias `@assets` maps to the `attached_assets` directory

### Runtime Loading

Assets are loaded using:
- **React Three Fiber's `useTexture`**: For 3D textures
- **HTML5 `<video>` element**: For video playback

All textures are pre-loaded and cached automatically by Three.js.

## Adding New Textures

To add new textures:

1. **Generate or create the asset** and place in appropriate `attached_assets/` subdirectory
2. **Import in `client/src/game/textures.ts`**:
   ```typescript
   import myTextureUrl from '@assets/generated_images/my_texture.png';
   ```

3. **Create a category object or extend existing**:
   ```typescript
   export const MY_TEXTURES = {
     VARIANT_A: {
       url: myTextureUrl,
       name: 'My Texture A',
       description: 'Detailed description...',
     },
   } as const;
   ```

4. **Use in components**:
   ```typescript
   import { MY_TEXTURES } from '../../game/textures';
   const texture = useTexture(MY_TEXTURES.VARIANT_A.url);
   ```

## Texture Configuration

### Tiling and Wrapping

Textures are configured in their respective components:

**Floor (sawdust)**:
- Wrapping: `RepeatWrapping`
- Repeat: 16x16 (creates detailed pattern)

**Ceiling (canvas)**:
- Wrapping: `RepeatWrapping`
- Repeat: 1x2 (maintains orientation)

### Material Properties

**Collectible Items**:
- Material: `meshStandardMaterial`
- Transparent: `true`
- Alpha Test: `0.5` (for cutout images)
- Emissive: Dynamic based on proximity
  - Nearby: `#ffff00` (yellow)
  - Blocked: `#ffcc00` (orange)
  - Normal: `#ffaa00` (amber)

**Maze Surfaces**:
- Material: `meshStandardMaterial`
- Metalness: `0` (non-metallic)
- Roughness: High (for matte appearance)

## Performance Considerations

### File Sizes
- Total texture size: ~12MB across all assets
- Bundled and served with gzip compression (~3.5MB)
- Textures are cached by browsers and Three.js

### Optimization Tips
1. Keep repeat values reasonable (16x16 max for detail)
2. Use `alphaTest` instead of `transparent` for cutouts where possible
3. Textures are automatically compressed by Vite during build
4. Consider LOD (Level of Detail) for distant objects

### Future Improvements
- Implement KTX2/Basis compression for WebGL compatibility
- Add texture atlasing for collectible items
- Use WebP format for modern browsers
- Implement progressive loading for large scenes

## Asset Inventory

| Asset | Type | Size | Format | Usage |
|-------|------|------|--------|-------|
| Paper Mâché Circus Ticket | Texture | 1.3MB | PNG | Collectible item |
| Paper Mâché Mystery Key | Texture | 1.3MB | PNG | Collectible item |
| Circus Sawdust Floor | Texture | 2.5MB | PNG | Maze floor |
| Vintage Circus Tent Canvas | Texture | 2.4MB | PNG | Maze ceiling |
| Dark Muddy Grass | Texture | 2.3MB | PNG | Future use |
| Seamless Dark Hedge | Texture | 1.6MB | PNG | Future use |
| Beppo Game Over Video | Video | 3.2MB | MP4 | Game over state |

## Helper Functions

### `getRandomCollectibleTexture()`
Returns a random collectible texture object with metadata:
```typescript
const randomItem = getRandomCollectibleTexture();
// Returns: { url: string, name: string, description: string }
```

### `getTexturesByCategory(category)`
Retrieves all textures in a category:
```typescript
const collectibles = getTexturesByCategory('collectibles');
// Returns: { CIRCUS_TICKET: {...}, MYSTERY_KEY: {...} }
```

## Debugging Assets

To view all available textures:
```typescript
import { TEXTURE_METADATA } from '../../game/textures';
console.log(TEXTURE_METADATA);
```

To track texture loading:
```typescript
import { useTexture } from '@react-three/drei';

const texture = useTexture(url, (texture) => {
  console.log('Texture loaded:', url);
});
```

## Related Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Overall system design
- [Game Design Document](./VISION.md) - Game mechanics and themes
- [Asset Generation Script](../script/generate-assets.ts) - AI-powered asset generation
