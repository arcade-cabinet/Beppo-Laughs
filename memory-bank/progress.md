# Progress

## Completed Milestones
- [x] Memory Bank architecture established.
- [x] Tech stack and system patterns documented.
- [x] Initial research on modern seed generation and maze algorithms.
- [x] Growing Tree maze algorithm (center-outward) implemented.
- [x] CatmullRomCurve3-based movement in RailPlayer.tsx.
- [x] Build-time AI manifest generation pipeline created.
- [x] Unit tests pass (88/88).
- [x] Production build successful.
- [x] **GitHub Actions workflow** for on-demand asset generation.
- [x] **Google Gemini + Vertex AI Imagen 4.0** integration.
- [x] **Deprecation fix**: `experimental_generateImage` → `generateImage`.

## What Works
- Project structure according to current `CLAUDE.md`.
- Basic R3F scene setup.
- Zustand store for basic game state.
- Growing Tree maze generation from center outward.
- Curve-based smooth movement along rail paths.
- Build-time asset generation script with Vercel AI SDK.
- Horror-themed 3-word seed generation.
- **GitHub workflow** (`assets.yml`): Idempotent, on-demand, separate from CI/CD.
- **Multi-provider support**: Google Gemini → OpenAI → Mock fallback.

## What's Left to Build
- [ ] Dynamic room-based geometry loading (LOD optimization).
- [ ] Paper-mache enemy "resolve" mechanics.
- [ ] Final visual pass for horror atmosphere.
- [ ] Integration of manifests with game runtime.
- [ ] Test GitHub workflow with org secrets.

## Current Status
Core infrastructure complete. Asset generation pipeline ready with Google Gemini + Vertex AI Imagen 4.0 support. GitHub workflow created for on-demand generation.

## Known Issues
- Entire maze still loads at once (room-based LOD is a future optimization).
- Need org secrets configured for full AI generation (`GOOGLE_GENERATIVE_AI_API_KEY`, `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`).
- Large bundle size warning (~1.5MB JS) - consider code splitting.
