# Beppo Laughs - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   React     │  │   Three.js  │  │   Web Audio API     │  │
│  │   (UI/UX)   │  │   (3D)      │  │   (Procedural Audio)│  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                   │
│                  ┌───────┴───────┐                           │
│                  │    Zustand    │                           │
│                  │  (Game State) │                           │
│                  └───────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
Beppo-Laughs/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── game/           # All game components
│   │   │       ├── Scene.tsx   # Main 3D scene
│   │   │       ├── Maze.tsx    # Maze geometry
│   │   │       ├── RailPlayer.tsx  # Player movement
│   │   │       └── ...
│   │   ├── game/
│   │   │   ├── maze/           # Maze generation
│   │   │   │   ├── core.ts     # Algorithm
│   │   │   │   └── geometry.ts # 3D conversion
│   │   │   ├── store.ts        # Zustand state
│   │   │   └── audio.ts        # Audio engine
│   │   ├── pages/
│   │   │   └── Home.tsx        # Main page
│   │   └── shaders/            # GLSL shaders
│   └── public/
│       ├── textures/           # Game textures
│       └── fonts/              # Web fonts
├── server/                     # Express (static serving only)
├── e2e/                        # Playwright tests
├── docs/                       # Documentation
│   ├── VISION.md
│   ├── ARCHITECTURE.md
│   └── STYLE_GUIDE.md
├── CLAUDE.md                   # AI agent guidance
└── AGENTS.md                   # Specialized agent config
```

## Core Systems

### 1. Maze Generation (`client/src/game/maze/`)

#### Algorithm
- **Type**: Modified DFS (depth-first search) with guaranteed solvability
- **Dimensions**: 13x13 (odd dimensions ensure walls between all cells)
- **Center**: Player spawn point
- **Exits**: 4 exits on perimeter edges (N, S, E, W)

#### Rail Graph
```typescript
interface RailNode {
  id: string;
  gridX: number;
  gridY: number;
  worldX: number;
  worldZ: number;
  connections: string[];  // Adjacent node IDs
  isExit: boolean;
}
```

The maze is converted to a graph where:
- Nodes exist at every maze cell intersection
- Edges connect adjacent accessible cells
- Player movement is constrained to edges

### 2. State Management (`client/src/game/store.ts`)

#### Zustand Store Structure
```typescript
interface GameState {
  // Sanity
  fear: number;
  despair: number;
  maxSanity: number;

  // Navigation
  currentNode: string | null;
  targetNode: string | null;
  visitedNodes: Set<string>;
  blockades: Set<string>;

  // Movement
  carSpeed: number;
  accelerating: boolean;
  braking: boolean;

  // UI State
  pendingFork: ForkOptions | null;
  nearbyExit: ExitInfo | null;
  hintActive: boolean;

  // Game Flow
  isGameOver: boolean;
  hasWon: boolean;
}
```

#### Performance Pattern
In `useFrame` callbacks, use `getState()` instead of hooks:
```typescript
useFrame(() => {
  const { carSpeed, fear } = useGameStore.getState();
  // No re-renders triggered
});
```

### 3. 3D Rendering (`client/src/components/game/`)

#### Scene Graph
```
<Canvas>
  <fog />
  <ambientLight />
  <FlickeringLight /> (multiple)

  <Suspense fallback={null}>
    <Maze />           <!-- Walls, floor, poles -->
    <Collectibles />   <!-- Paper mache items -->
    <RailPlayer />     <!-- Camera + Cockpit -->
    <Villains />       <!-- SDF ray-marched -->
    <HintOverlay />    <!-- Footprints/handprints -->
  </Suspense>
</Canvas>
```

#### Camera System
- Camera attached to RailPlayer
- Position interpolates along rail edges
- Rotation faces travel direction
- ClownCarCockpit follows camera as child

### 4. Audio System (`client/src/game/audio.ts`)

#### Procedural Generation
- **Oscillators**: Detuned for creepy laugh synthesis
- **Pink Noise**: Ambient texture
- **Dynamic Gain**: Modulated by game state (fear, despair)

#### Browser Requirement
Audio context requires user interaction to start:
```typescript
audioManager.initialize(); // Call on first click
```

## Data Flow

### Movement Flow
```
User Input (Gas/Brake)
    │
    ▼
Zustand Store (accelerating/braking)
    │
    ▼
RailPlayer useFrame()
    │
    ├── Update carSpeed
    ├── Calculate edgeProgress
    ├── Move camera position
    └── Check for fork/exit
            │
            ▼
      ForkPrompt / InteractionPrompt
            │
            ▼
      User selects direction
            │
            ▼
      Store.setTargetNode()
```

### Sanity Flow
```
visitNode(nodeId)
    │
    ▼
Check if visited before
    │
    ├── New cell → Increase FEAR
    └── Visited cell → Increase DESPAIR
            │
            ▼
Update fog, lighting, audio
            │
            ▼
Check win/lose conditions
```

## Performance Considerations

### Optimization Strategies
1. **Instanced Meshes**: Maze walls use instancing
2. **Ref-based Animation**: No React state in render loops
3. **Lazy Loading**: Assets in Suspense boundaries
4. **Shader Efficiency**: SDF villains limited to 48 iterations

### Target Metrics
- 60 FPS on iPhone 12 / Pixel 5 equivalent
- < 500KB initial JS bundle
- < 3MB total assets

## Future Considerations

### Potential Improvements
- **drei MotionPathControls**: Replace custom RailPlayer
- **Post-processing**: Use @react-three/postprocessing for effects
- **Web Workers**: Offload maze generation
- **PWA**: Offline support with service worker
