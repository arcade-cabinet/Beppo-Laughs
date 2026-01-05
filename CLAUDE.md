# CLAUDE.md - AI Agent Development Guide

This file provides guidance to AI coding agents (Claude Code, Cursor, etc.) when working with this repository.

## Project Overview

**Beppo Laughs** is a 3D first-person survival horror game built with React Three Fiber. Players navigate a procedurally generated circus maze in a clown car, managing sanity meters while escaping from villain figures.

## Tech Stack

### Frontend (client/)
- **React 19** with TypeScript (strict mode)
- **@react-three/fiber** (r3f) - React renderer for Three.js
- **@react-three/drei** - Helper components for r3f (USE THESE - don't reinvent the wheel)
- **Zustand** - State management
- **Tailwind CSS v4** - Styling
- **Vite** - Build tooling

### Package Manager
This project uses **pnpm**. Do NOT use npm commands.

```bash
pnpm install    # Install dependencies
pnpm run dev    # Start development server
pnpm run build  # Production build
pnpm run test   # Run unit tests
pnpm run test:e2e  # Run Playwright E2E tests
pnpm run lint   # Lint code
```

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
```
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

### Unit Tests (Vitest)
- Co-located with source files or in `__tests__/` directories
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

## Key Files to Understand

| File | Purpose |
|------|---------|
| `client/src/game/store.ts` | Zustand game state (sanity, navigation, etc.) |
| `client/src/game/maze/core.ts` | Maze generation algorithm |
| `client/src/game/maze/geometry.ts` | 3D geometry from maze data |
| `client/src/components/game/Scene.tsx` | Main 3D scene setup |
| `client/src/components/game/RailPlayer.tsx` | Player movement system |
| `client/src/pages/Home.tsx` | Entry point with WebGL check |

## Design Decisions

### RailPlayer Implementation
We evaluated `MotionPathControls` from drei but decided against it because:
- MotionPathControls is designed for continuous predefined paths (bezier/catmull-rom curves)
- Our maze uses discrete node-to-node navigation with dynamic path selection at forks
- The current lerp-based approach is appropriate for grid-based maze navigation
- Reference: https://drei.docs.pmnd.rs/controls/motion-path-controls

### Post-Processing Effects
Horror effects use `@react-three/postprocessing` (GPU-accelerated) instead of CSS filters:
- Vignette, ChromaticAberration, Noise
- Intensity scales with sanity (fear/despair)
- See `HorrorEffects.tsx`

### Best Practice Resources
- https://drei.docs.pmnd.rs/
- https://github.com/pmndrs/react-three-fiber
- https://sbcode.net/react-three-fiber/

## Documentation

See `docs/` directory for:
- `VISION.md` - Game design vision and goals
- `ARCHITECTURE.md` - Technical architecture details
- `STYLE_GUIDE.md` - Visual and audio design guidelines
