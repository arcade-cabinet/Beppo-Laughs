# PR History & Analysis

## Branch: `feat/maze-refactoring-and-ai-manifest`

### Current State (Pre-Refactor)
- **Maze Generation**: Simple recursive backtracking (DFS) in `core.ts`.
- **Maze Loading**: Entire grid loaded at once in `Maze.tsx`.
- **Movement**: Rail-based but appears to use simple lerping between grid nodes.
- **Seeds**: Currently using `seedrandom`. Grok research suggested switching to `unique-names-generator` + `random` for better thematic seeds and modern PRNG.
- **AI Assets**: Manual placeholder screenshots in `attached_assets`. No build pipeline for manifest generation yet.

### Key Work Items from CLAUDE.md
1. **Refactor Maze Architecture**: Move to a room-aware, demand-driven geometry system.
2. **Growing Tree Algorithm**: Replace DFS to allow better control over maze "texture" (room sizes, loopiness).
3. **MotionPathControls**: Smooth out movement using `CatmullRomCurve3`.
4. **Vercel AI SDK**: Implement the build-time manifest generation for "paper-mache" enemies.

### Research Integration Goals (from Grok docs)
- **Seed Generation**: Switch to `unique-names-generator` for horror-themed 3-word seeds.
- **Determinism**: Use `random` (npm) seeded with the 3-word phrase.
- **Algorithm**: Use "Growing Tree" starting from the center outward (Reverse-Minotaur style).
- **Placement**: Rule-based enemy/item placement for guaranteed solvability.
- **AI Dev Layer**: Build-time generation of Monty Python style assets.

### File Analysis
| File | Status | Planned Change |
|------|--------|----------------|
| `core.ts` | Old DFS | Implement Growing Tree + seeded `random` |
| `Maze.tsx` | Static | Implement Dynamic Room Loading |
| `RailPlayer.tsx` | Lerp | Implement `MotionPathControls` |
| `store.ts` | Basic | Add Maze Manifest + Room navigation state |
| `script/build.ts` | Basic | Add AI Manifest Generation pipeline |
