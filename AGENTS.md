# AGENTS.md - Specialized Agent Instructions

This file provides specific guidance for specialized AI development agents working on Beppo Laughs.

## Agent Routing

### react-component-architect
Use for: React component design, hooks patterns, state management integration
Key files: `client/src/components/`, `client/src/pages/`

### frontend-developer
Use for: UI/UX implementation, Tailwind styling, accessibility
Key files: `client/src/components/game/HUD.tsx`, `client/src/components/game/MainMenu.tsx`

### code-reviewer
Use for: PR reviews, security audits, best practice validation
Focus on: WebGL security, input sanitization, bundle size

### performance-optimizer
Use for: 3D rendering optimization, bundle analysis, memory profiling
Tools: Chrome DevTools, React DevTools, vite-bundle-analyzer

### documentation-specialist
Use for: Updating docs/, README, inline documentation
Reference: docs/VISION.md, docs/ARCHITECTURE.md

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
2. Verify build: `pnpm run build`
3. Test in browser with WebGL disabled to verify error handling
4. Check mobile viewport in dev tools

### E2E Test Patterns
```typescript
// Use role selectors for semantic elements
await expect(page.getByRole('heading', { name: 'BEPPO LAUGHS' })).toBeVisible();

// Use test IDs for custom components
await page.getByTestId('button-start-game').click();
```

## Research Before Implementation

When implementing features, always check:
1. https://drei.docs.pmnd.rs/ - drei documentation
2. https://github.com/pmndrs/react-three-fiber/discussions - r3f discussions
3. https://discourse.threejs.org/ - Three.js forum
4. https://sbcode.net/react-three-fiber/ - tutorials

### Movement/Camera
- First check: `MotionPathControls`, `CameraControls`, `PointerLockControls`
- Then: Community examples on GitHub
- Last resort: Custom implementation

### Effects
- First check: `@react-three/postprocessing`
- Then: drei built-in effects
- Last resort: Custom shaders
