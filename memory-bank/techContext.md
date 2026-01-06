# Tech Context

## Frontend Stack
- **React 19**: Latest React features for modern UI.
- **TypeScript**: Strict typing for reliability.
- **R3F (@react-three/fiber)**: 3D renderer.
- **Drei**: Essential R3F helpers (useTexture, Billboards, Text).
- **Zustand**: Lightweight state management.
- **Tailwind CSS v4**: Utility-first styling with latest v4 features.
- **Vite**: Ultra-fast build tool.

## Specialized Libraries
- **@react-three/rapier**: Physics engine for collision and world logic.
- **@react-three/postprocessing**: GPU-accelerated horror effects.
- **unique-names-generator**: For generating the 3-word horror seed phrases.
- **seedrandom**: Seeded PRNG for deterministic generation.
- **GSAP**: For complex paper-mache animations (popups, drops).

## Backend/Dev Layer
- **Node.js**: Server environment.
- **@google/genai**: Gemini API for build-time image generation.

## Development Setup
- **Package Manager**: pnpm (Required).
- **Environment**: Node.js v20+.
- **Formatting**: Biome (`pnpm run lint`).
- **Commands**:
  - `pnpm install`: Install deps.
  - `pnpm run dev`: Start development.
  - `pnpm run build`: Production build.
  - `pnpm run test`: Unit tests (Vitest).
  - `pnpm run test:e2e`: E2E tests (Playwright).

## Constraints
- **WebGL Support**: Required; must show error if unavailable.
- **Performance**: High frame rate needed for horror immersion (instancing, low ref state).
- **Memory**: Maze geometry must be room-aware/dynamic to avoid bloating.
- **Determinism**: Everything related to world-gen must be tied to the 3-word seed.
