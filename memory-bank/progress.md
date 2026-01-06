# Progress

## Completed Milestones
- [x] Memory Bank architecture established.
- [x] Tech stack and system patterns documented.
- [x] Growing Tree maze algorithm (center-outward) implemented.
- [x] CatmullRomCurve3-based movement in `RailPlayer.tsx`.
- [x] Build-time Gemini image generation pipeline created.
- [x] GitHub Actions workflow for on-demand asset generation.
- [x] Runtime asset catalog integration (maze textures, collectibles, blockades).
- [x] Deterministic blockade + collectible pairing based on seed.
- [x] Store logic updated for blockade requirements.
- [x] CI lint cleanup (Biome ignores for generated assets + a11y/type fixes).
- [x] Unit tests updated and passing.
- [x] Spawn plan now guarantees non-empty texture URLs via fallbacks.
- [x] Dependabot review/triage workflows hardened against missing credentials.
- [x] Dependabot auto-merge job no longer fails when approval is disallowed.
- [x] Latest Dependabot dependency updates merged to main.
- [x] Foundational HUD/lever/seed validation PRs are integrated in main.

## What Works
- Project structure according to current `CLAUDE.md`.
- Basic R3F scene setup.
- Zustand store for core game state and blockade requirements.
- Growing Tree maze generation from center outward.
- Curve-based smooth movement along rail paths.
- Gemini-driven asset generation pipeline.
- Asset catalog available at runtime (`client/public/assets/asset-catalog.json`).
- Seeded placement for collectibles and blockades tied to catalog.

## What's Left to Build
- [ ] Run and update E2E coverage for blockade/item flow.
- [ ] Confirm asset workflow behavior after recent catalog additions.
- [ ] Video asset generation pipeline (documented, pending model availability).
- [ ] Final visual/UX pass for horror atmosphere.
- [ ] Room-based dynamic geometry loading (LOD optimization).

## Current Status
Core gameplay is deterministic with catalog-driven assets for textures, collectibles, and blockades. Asset generation is Gemini-only and mirrored into runtime assets; spawn planning now guarantees safe fallbacks. Lint is clean after Biome adjustments; E2E still needs a run after recent changes.

## Known Issues
- Entire maze still loads at once (room-based LOD is a future optimization).
- Video generation not yet enabled (model access pending).
- Large bundle size warning (~1.5MB JS) - consider code splitting.
