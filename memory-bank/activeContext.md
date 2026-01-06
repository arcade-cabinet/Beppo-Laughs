# Active Context

## Current Work Focus
- Seeded, deterministic obstacle/item flow tied to the Gemini-generated asset catalog.
- Runtime integration of asset catalog into maze textures, collectibles, and blockade visuals.
- Stabilizing the asset workflow and documenting video generation as next phase.
- Preparing work on a dedicated PR branch so other agents can pick up cleanly.
- CI lint cleanup to keep PR checks green.

## Recent Changes
- Added asset catalog loader and seeded selection helpers (`client/src/game/assetCatalog.ts`).
- Maze wall/floor/ceiling textures now pick deterministic catalog assets per seed (`client/src/components/game/Maze.tsx`).
- Collectibles now seeded from catalog with fallback (`client/src/components/game/Collectibles.tsx`).
- Added deterministic blockade + collectible pairing via spawn plan (`client/src/game/spawnPlan.ts`).
- Ensured blockade and collectible nodes are distinct by sampling from a shared shuffled pool.
- Added blockade rendering for paper-mache cutouts with distance-gated labels (`client/src/components/game/Blockades.tsx`).
- Store now tracks blockade requirements and clears only matching blockade on collect (`client/src/game/store.ts`).
- Tests updated for blockade requirements (`client/src/game/store.test.ts`).
- Biome config now ignores generated assets/reports; lint fixes across UI/test files for a11y and typing.

## Active Decisions & Considerations
- **AI Provider**: Gemini API only (no Vertex AI, no OpenAI fallback).
- **Runtime Asset Catalog**: `client/public/assets/asset-catalog.json` is the source of truth.
- **Determinism**: All placement and asset picks are seeded by the maze seed.
- **Blockade Logic**: Each blockade requires a specific item; collect clears only that blockade.
- **Video Assets**: Documented in manifest but generation deferred until model availability.

## Pending Tasks
- [ ] Run `pnpm test:e2e` to validate new blockade/item flow.
- [ ] Confirm asset workflow behavior after recent catalog additions.
- [ ] Expand UI/UX to surface required-item names more clearly (if needed).
- [ ] Plan video pipeline once Gemini/Veo model access is confirmed.

## Important Patterns
- Use `useGameStore.getState()` inside `useFrame` to avoid rerenders.
- All R3F asset loads go through `<Suspense>`.
- Seeded PRNG is required for placement and asset choice.
- Asset catalog should be mirrored into `client/public/assets/` for runtime access.
