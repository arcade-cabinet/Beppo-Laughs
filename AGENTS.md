# AGENTS.md - Specialized Agent Instructions

This file provides specific guidance for specialized AI development agents working on Beppo Laughs.

## ⚠️ CRITICAL: Astro + React Architecture

This project uses **Astro 5** with **React** components as islands, NOT bare Vite + React.

**Key Architecture Points:**
- Entry point: `src/pages/index.astro` (Astro page)
- React components: `client/src/` (loaded as islands with `client:only="react"`)
- Build system: Astro (which wraps Vite internally)
- WebGL/Three.js: MUST use `client:only="react"` directive (client-side only)

## Agent Routing

### astro-architect
Use for: Astro page structure, SSG configuration, integration setup
Key files: `src/pages/`, `src/layouts/`, `astro.config.mjs`

### react-component-architect
Use for: React component design, hooks patterns, state management integration
Key files: `client/src/components/`, `client/src/pages/`
**Note**: All React components are loaded as Astro islands

### frontend-developer
Use for: UI/UX implementation, Tailwind styling, accessibility
Key files: `client/src/components/game/HUD.tsx`, `client/src/components/game/MainMenu.tsx`

### code-reviewer
Use for: PR reviews, security audits, best practice validation
Focus on: WebGL security, input sanitization, bundle size, Astro SSG output

### performance-optimizer
Use for: 3D rendering optimization, bundle analysis, memory profiling
Tools: Chrome DevTools, React DevTools, Astro Dev Toolbar

### documentation-specialist
Use for: Updating docs/, README, inline documentation
Reference: docs/VISION.md, docs/ARCHITECTURE.md

## Astro + React Integration

### Page Structure
```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import Home from '../../client/src/pages/Home';
---

<Layout title="Beppo Laughs">
  <!-- client:only="react" is REQUIRED for Three.js/WebGL -->
  <Home client:only="react" />
</Layout>
```

### Why client:only="react"?
- Three.js requires browser APIs (window, WebGL context)
- Cannot be server-side rendered
- Must hydrate and run only on client
- Reference: https://docs.astro.build/en/reference/directives-reference/#clientonly

## React Three Fiber Specific Guidance

### Common Patterns
```typescript
// ✅ Good: Access state imperatively in useFrame
useFrame(() => {
  const { carSpeed } = useGameStore.getState();
  // use carSpeed
});

// ❌ Bad: Using hooks causes re-renders
const carSpeed = useGameStore((s) => s.carSpeed); // Don't use in animated components
```

### Asset Loading
```typescript
// ✅ Good: Use drei hooks inside Suspense
function MyComponent() {
  const texture = useTexture('/textures/floor.png');
  return <mesh><meshStandardMaterial map={texture} /></mesh>;
}

// Wrap in Suspense
<Suspense fallback={null}>
  <MyComponent />
</Suspense>
```

### Camera Attachment
```typescript
// ✅ Good: Use drei components
import { MotionPathControls } from '@react-three/drei';

// ❌ Bad: Manual camera.position updates in useFrame
```

## Horror Game Specific

### Audio Implementation
- Use Web Audio API for procedural sounds
- Reference: `client/src/game/audio.ts`
- Always gate audio behind user interaction (browser policy)

### Visual Effects
- Post-processing: Check drei for existing effects first
- Shaders: SDF ray marching for villains (`client/src/shaders/`)
- CSS filters for sanity-based distortion (used sparingly)

### Sanity System
- Fear (red) - increases on exploration
- Despair (blue) - increases on backtracking
- Both affect fog, lighting, shader intensity

## Testing Instructions

### Before Submitting PRs
1. Run full test suite: `pnpm run test && pnpm run test:e2e`
2. Verify Astro build: `pnpm run build` (includes astro check)
3. Test in browser with WebGL disabled to verify error handling
4. Check mobile viewport in dev tools
5. Preview production build: `pnpm run preview`

### E2E Test Patterns (Playwright)
```typescript
// Use role selectors for semantic elements
await expect(page.getByRole('heading', { name: 'BEPPO LAUGHS' })).toBeVisible();

// Use test IDs for custom components
await page.getByTestId('button-start-game').click();
```

**Astro Testing Guide**: https://docs.astro.build/en/guides/testing/

### Unit Tests (Vitest)
- React components can be tested with @testing-library/react
- Astro components: Use astro:env/client for environment simulation
- Run with: `pnpm run test`

## Research Before Implementation

When implementing features, always check:
1. **Astro Docs**: https://docs.astro.build/ - Main framework
2. **Astro + React**: https://docs.astro.build/en/guides/integrations-guide/react/
3. **drei docs**: https://drei.docs.pmnd.rs/ - React Three Fiber helpers
4. **r3f discussions**: https://github.com/pmndrs/react-three-fiber/discussions
5. **Three.js forum**: https://discourse.threejs.org/
6. **r3f tutorials**: https://sbcode.net/react-three-fiber/

### Movement/Camera
- First check: `MotionPathControls`, `CameraControls`, `PointerLockControls`
- Then: Community examples on GitHub
- Last resort: Custom implementation

### Effects
- First check: `@react-three/postprocessing`
- Then: drei built-in effects
- Last resort: Custom shaders

## Build & Deployment

### Commands
```bash
pnpm run dev       # Astro dev server on :5000
pnpm run build     # Astro check + build (outputs to dist/)
pnpm run preview   # Preview production build
```

### GitHub Pages Deployment
- Uses official `withastro/action@v5.0.2`
- Auto-detects pnpm and Node.js
- Base path configured in `astro.config.mjs`
- Reference: `.github/workflows/cd.yml`

