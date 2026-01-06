# Active Context

## Current Work Focus
- Build-time AI asset generation pipeline fully operational.
- GitHub Actions workflow for on-demand asset generation.
- Integration of Google Gemini + Vertex AI Imagen 4.0 for better price/performance.

## Recent Changes
- **`.github/workflows/assets.yml`**: Created idempotent on-demand workflow (separate from CI/CD).
- **`script/generate-assets.ts`**: Fixed `experimental_generateImage` deprecation → now uses stable `generateImage`.
- **Provider Priority**: Google Gemini > OpenAI > Mock data fallback.
- Growing Tree maze algorithm implemented.
- CatmullRomCurve3-based rail movement functional.

## Active Decisions & Considerations
- **AI Provider Priority**: Google Gemini for text (gemini-2.0-flash), Vertex AI Imagen 4.0 for images - better price/performance than OpenAI.
- **GitHub Workflow**: Uses org secrets (`GOOGLE_GENERATIVE_AI_API_KEY`, `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`), falls back to `OPENAI_API_KEY`.
- **Idempotency**: Workflow checks existing asset count before regenerating; supports `force_regenerate` flag.
- **Growing Tree Algorithm**: Maze grows from center outward, creating natural room layouts.
- **Seed Logic**: `unique-names-generator` + `random` (PRNG) for deterministic generation.

## Pending Tasks
- [ ] Test GitHub workflow with actual org secrets.
- [ ] Integration of manifests with game runtime.
- [ ] Dynamic room-based geometry loading (LOD optimization).
- [ ] Paper-mache enemy "resolve" mechanics.
- [ ] Final visual pass for horror atmosphere.

## Important Patterns
- Use `getState()` for performance in `useFrame`.
- All assets must be wrapped in `<Suspense>`.
- Procedural generation must be purely deterministic based on the 3-word seed.
- Build-time asset generation runs on-demand via GitHub Actions, not in CI/CD.
