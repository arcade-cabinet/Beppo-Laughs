# GitHub Pages Deployment Fix

## Problem Statement

The application was failing to route correctly when deployed to GitHub Pages at `https://arcade-cabinet.github.io/Beppo-Laughs/`. Users would see the "404 Page Not Found - Did you forget to add the page to the router?" error message from the NotFound component.

## Root Cause Analysis

### 1. Build System Clarification
- **Project uses**: Vite + React (NOT Astro)
- **Routing library**: Wouter v3.9.0
- **Deployment target**: GitHub Pages with base path `/Beppo-Laughs`

### 2. The Routing Issue
When deployed to GitHub Pages at a subpath (`/Beppo-Laughs`), the application needs to:
1. Build all assets with the correct base path (handled by Vite's `base` config)
2. Configure the client-side router to understand the base path

**The Problem**: Wouter was not configured with the base path, so when users navigated to `/Beppo-Laughs/`, the router tried to match against `/Beppo-Laughs/` instead of `/`, causing all routes to fail and show the 404 page.

## Solution

### Fix Applied to `client/src/App.tsx`

```typescript
import { Router as WouterRouter } from 'wouter';

// Get base path from environment variable (set during build)
const basePath = import.meta.env.BASE_URL || '/';

function Router() {
  return (
    <WouterRouter base={basePath}>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}
```

### How It Works

1. **During Development**: 
   - `import.meta.env.BASE_URL` = `/` (default)
   - Router matches routes normally at `localhost:5000/`

2. **During GitHub Pages Build**:
   - `VITE_BASE_PATH=/Beppo-Laughs` is set in `.github/workflows/cd.yml`
   - Vite's `base` config uses `process.env.VITE_BASE_PATH` 
   - `import.meta.env.BASE_URL` = `/Beppo-Laughs/`
   - All assets are built with `/Beppo-Laughs/` prefix
   - Router is configured with base path `/Beppo-Laughs/`

3. **When Deployed**:
   - User visits `https://arcade-cabinet.github.io/Beppo-Laughs/`
   - Wouter strips the `/Beppo-Laughs` prefix
   - Route `/` matches successfully
   - Application loads correctly

## Deployment Workflow

The deployment is configured in `.github/workflows/cd.yml`:

```yaml
- name: Build with Vite
  env:
    VITE_BASE_PATH: /Beppo-Laughs
  run: pnpm run build:client
```

This environment variable is used by `vite.config.ts`:

```typescript
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  // ... rest of config
});
```

## Testing

### Local Testing with Base Path
To test the build locally with the GitHub Pages base path:

```bash
VITE_BASE_PATH=/Beppo-Laughs pnpm run build:client
```

### E2E Testing
New comprehensive E2E tests have been added:
- `e2e/full-gameplay.spec.ts` - Full gameplay sequences with screenshots
- `e2e/mobile-controls.spec.ts` - Mobile and tablet device testing
- `e2e/horror-mechanics.spec.ts` - Horror-specific features (sanity, villains, effects)

Run tests with:
```bash
pnpm run test:e2e
```

## References

- [Wouter Documentation - Base Path](https://github.com/molefrog/wouter#%EF%B8%8F-router-props)
- [Vite Documentation - Base Path](https://vite.dev/config/shared-options.html#base)
- [GitHub Pages - Custom Domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## Future Considerations

If moving to a custom domain (e.g., `beppo-laughs.com`):
1. Remove `VITE_BASE_PATH` from the deployment workflow
2. The application will automatically use `/` as the base path
3. No code changes needed - the solution is already dynamic
