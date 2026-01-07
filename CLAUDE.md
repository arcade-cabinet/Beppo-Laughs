# CLAUDE.md - AI Agent Development Guide

This file provides guidance to AI coding agents (Claude Code, Cursor, etc.) when working with this repository.

## Project Overview

**Beppo Laughs** is a 3D first-person survival horror game built with **Astro 5** and **React Three Fiber**. Players navigate a procedurally generated circus maze in a clown car, managing sanity meters while escaping from villain figures.

## ⚠️ CRITICAL: Architecture

This project uses **Astro + React**, NOT bare Vite + React:
- **Build System**: Astro 5 (which uses Vite internally)
- **Frontend**: React 19 components loaded as Astro islands
- **Entry Point**: `src/pages/index.astro` (Astro page, not HTML)
- **React Components**: `client/src/` (marked with `client:only="react"`)

## Tech Stack

### Core Framework
- **Astro 5** - Static Site Generator with React integration
- **@astrojs/react** - Official React integration for Astro
- **@astrojs/sitemap** - SEO/sitemap generation

### Frontend (client/)
- **React 19** with TypeScript (strict mode)
- **@react-three/fiber** (r3f) - React renderer for Three.js
- **@react-three/drei** - Helper components for r3f (USE THESE - don't reinvent the wheel)
- **Zustand** - State management
- **Tailwind CSS v4** - Styling (via PostCSS)

### Package Manager
This project uses **pnpm**. Do NOT use npm commands.

```bash
pnpm install      # Install dependencies
pnpm run dev      # Astro dev server (port 5000)
pnpm run build    # Astro check + build (outputs to dist/)
pnpm run preview  # Preview production build
pnpm run test     # Run Vitest unit tests
pnpm run test:e2e # Run Playwright E2E tests
pnpm run lint     # Biome linting
```

## Astro + React Integration

### Page Structure
```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import Home from '../../client/src/pages/Home';
---

<Layout title="Beppo Laughs">
  <!-- 
    client:only="react" is REQUIRED for Three.js/WebGL
    This ensures the component only runs on client-side
  -->
  <Home client:only="react" />
</Layout>
```

### Why Astro?
1. **Proper Frontend Integration**: Wraps Vite with SSG capabilities
2. **GitHub Pages Support**: Built-in base path handling
3. **React Islands**: Components hydrate only when needed
4. **Client Directives**: `client:only="react"` for WebGL/Three.js
5. **Official GitHub Action**: Simplified deployment workflow

### Key Directives
- `client:only="react"` - Component runs ONLY on client (required for WebGL)
- `client:load` - Hydrate on page load
- `client:idle` - Hydrate when browser is idle
- `client:visible` - Hydrate when visible

**Reference**: https://docs.astro.build/en/reference/directives-reference/

## Architecture Patterns

### 1. Use Established Libraries
Before implementing custom solutions, check if `@react-three/drei` provides a component:
- **Camera controls**: Use `PointerLockControls`, `CameraControls`, `MotionPathControls`
- **Effects**: Check drei for existing post-processing effects
- **Helpers**: `useTexture`, `useGLTF`, `Text`, etc.

### 2. State Management
- Use **Zustand** store at `client/src/game/store.ts`
- Access state in r3f components via `useGameStore.getState()` in useFrame (not hooks for performance)
- Keep render-affecting state minimal

### 3. 3D Scene Structure
```tsx
<Canvas>
  <Suspense fallback={null}>
    <!-- All components that load assets -->
  </Suspense>
</Canvas>
```
- All components using textures/fonts MUST be wrapped in Suspense
- No fallback workarounds - if WebGL isn't supported, show clear error

### 4. Performance Patterns
- Use refs for animation state, not React state
- Access game state with `getState()` in `useFrame`, not hooks
- Keep mesh counts low, use instancing for repeated geometry
- Profile with React DevTools and Chrome Performance tab

## Testing

### E2E Tests (Playwright)
- Located in `e2e/` directory
- Use role-based selectors: `getByRole('heading', { name: '...' })`
- Use test IDs: `data-testid="button-start-game"`
- Run with: `pnpm run test:e2e`
- **Astro Testing Guide**: https://docs.astro.build/en/guides/testing/

### Unit Tests (Vitest)
- Co-located with source files or in `__tests__/` directories
- React components: Use @testing-library/react
- Run with: `pnpm run test`

## Code Quality

### Biome for Linting/Formatting
```bash
pnpm run lint      # Check issues
pnpm run lint:fix  # Auto-fix
pnpm run format    # Format code
```

### TypeScript
- Strict mode enabled
- No `any` types without justification
- Export types from module boundaries
- Astro types: `astro/client` included in tsconfig

## Key Files to Understand

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Astro configuration (React integration, base path) |
| `src/pages/index.astro` | Main entry point (Astro page) |
| `src/layouts/Layout.astro` | HTML wrapper with meta tags |
| `client/src/pages/Home.tsx` | React app root (loaded as island) |
| `client/src/game/store.ts` | Zustand game state (sanity, navigation, etc.) |
| `client/src/game/maze/core.ts` | Maze generation algorithm |
| `client/src/game/maze/geometry.ts` | 3D geometry from maze data |
| `client/src/components/game/Scene.tsx` | Main 3D scene setup |
| `client/src/components/game/RailPlayer.tsx` | Player movement system |

## Design Decisions

### Maze Architecture - NEEDS REFACTORING

**Current Problem:** Loading entire 169-cell maze at once (memory wasteful)

**Better Architecture (TODO):**
```
┌─────────────────────────────────────────────────┐
│  CURRENT ROOM    │  Fully rendered, detailed    │
├──────────────────┼──────────────────────────────┤
│  ADJACENT ROOMS  │  Preloaded, ready to render  │
│  (connections)   │  when player moves           │
├──────────────────┼──────────────────────────────┤
│  FAR ROOMS       │  NOT loaded until needed     │
└─────────────────────────────────────────────────┘
```

Implementation approach:
1. **Maze data** (graph) is generated from seed (lightweight, keep in memory)
2. **Geometry** (walls, floor) is generated on-demand per room
3. **Current room + connections**: Render current room geometry
4. **Preload**: When entering a room, preload geometry for connected rooms
5. **Unload**: Remove geometry for rooms player has left

### RailPlayer Implementation - NEEDS REFACTORING
The maze IS a predefined structure (generated from seed):
- DFS algorithm generates a 13x13 grid maze from 3-word seed
- Each cell has a center rail node with connections to adjacent cells
- **Only the GRAPH is known upfront** (lightweight)
- **Geometry should be generated per-room** (memory efficient)

**Current approach:** Linear lerp between nodes, entire maze loaded

**Better approach (TODO):**
1. Use `MotionPathControls` with `useMotion` for current room segment
2. Room-based geometry loading (only current + adjacent)
3. Convert current room edges to `CatmullRomCurve3` for smooth movement
4. At fork selection, switch curve and preload next room

Reference: https://drei.docs.pmnd.rs/controls/motion-path-controls

### Post-Processing Effects
Horror effects use `@react-three/postprocessing` (GPU-accelerated) instead of CSS filters:
- Vignette, ChromaticAberration, Noise
- Intensity scales with sanity (fear/despair)
- See `HorrorEffects.tsx`

## Deployment

### GitHub Pages
- Uses official `withastro/action@v5.0.2`
- Auto-detects Node.js from `.nvmrc`
- Auto-detects pnpm from lockfile
- Base path configured in `astro.config.mjs`
- Workflow: `.github/workflows/cd.yml`

### Build Output
- Development: `pnpm run dev` (Astro dev server)
- Production: `pnpm run build` (outputs to `dist/`)
- Preview: `pnpm run preview` (test production build locally)

## Best Practice Resources

### Astro
- **Main Docs**: https://docs.astro.build/
- **React Integration**: https://docs.astro.build/en/guides/integrations-guide/react/
- **Testing Guide**: https://docs.astro.build/en/guides/testing/
- **GitHub Pages Deploy**: https://docs.astro.build/en/guides/deploy/github/

### React Three Fiber
- **drei helpers**: https://drei.docs.pmnd.rs/
- **r3f GitHub**: https://github.com/pmndrs/react-three-fiber
- **Tutorials**: https://sbcode.net/react-three-fiber/
- **Three.js forum**: https://discourse.threejs.org/

## Documentation

See `docs/` directory for:
- `VISION.md` - Game design vision and goals
- `ARCHITECTURE.md` - Technical architecture details
- `STYLE_GUIDE.md` - Visual and audio design guidelines
- `GITHUB_PAGES_FIX.md` - Router base path solution
- `TESTING_ENHANCEMENTS.md` - E2E test suite documentation

