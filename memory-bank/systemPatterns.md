# System Patterns

## Architecture Overview
The project follows a decoupled architecture where the maze logic is independent of the 3D rendering.

### 1. Game State Management (Zustand)
- Store: `client/src/game/store.ts`
- State includes: Sanity (Fear/Despair), Navigation (Progress along rail), Inventory, Maze Data.
- Access Pattern: Use `useGameStore.getState()` inside `useFrame` for performance; use hooks for UI components.

### 2. Procedural Maze Generation
- Core: `client/src/game/maze/core.ts`
- Algorithm: Growing Tree (Modified for center-start "reverse-minotaur" logic).
- Output: 2D Grid with metadata (rooms, connections, enemy/item slots).
- 3D Extrusion: `client/src/game/maze/geometry.ts` converts 2D grid to 3D meshes (instanced for performance).

### 3. Navigation & Movement
- Rail System: Player movement is locked to a `CatmullRomCurve3`.
- Controls: `RailPlayer.tsx` handles steering/progress along the path.
- Physics: Rapier used for collision detection at specific points (obstacles/items).

### 4. Horror Visual Effects
- Post-processing: Managed via `@react-three/postprocessing`.
- Dynamics: Sanity-driven distortion (Vignette, Noise, Chromatic Aberration).
- Cutouts: Paper-mache enemies are 2D planes/billboards with collage textures.

### 5. AI Asset Layer (Dev/Build Time)
- Vercel AI SDK handles generation of manifest and image prompts.
- Build Script: Generates a fixed set of "Gold" mazes and assets stored in `public/assets/mazes/`.

## Coding Standards
- Strict TypeScript.
- R3F Best Practices: Refs for animations, `useFrame` for logic, `@react-three/drei` for helpers.
- Test-driven: Vitest for logic, Playwright for E2E.
- Formatting: Biome.

## Component Structure
- `Scene.tsx`: Main canvas and high-level scene setup.
- `Maze.tsx`: Handles dynamic loading of room geometry.
- `RailPlayer.tsx`: The player's vehicle and cockpit HUD.
- `HUD.tsx`: UI overlay for sanity and hints.
