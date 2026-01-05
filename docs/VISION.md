# Beppo Laughs - Game Vision

## Concept

A 3D first-person survival horror game set in a surreal 1800s circus big top tent labyrinth. You are TRAPPED at the center of Beppo's nightmare carnival - navigate outward to escape while SDF ray-marched villain figures stalk you through the canvas corridors.

## Genre & Influences

- **Genre**: Survival Horror / Maze Navigation / Arcade
- **Theme**: Victorian circus nightmare meets Monty Python absurdist horror
- **Influences**: Coney Island freak shows, classic arcade maze games, psychological horror

## Core Experience

### The Setting
You wake up in a garish clown car, surrounded by striped canvas walls. The smell of sawdust and something... else. Flickering tungsten lights cast long shadows. Beppo's laugh echoes somewhere in the maze.

### The Goal
Start at the center of a procedurally generated maze. Navigate outward to find an exit on the perimeter before your sanity runs out. Simple concept, terrifying execution.

### The Twist: Reverse Minotaur
Unlike traditional mazes where you enter from outside, you start TRAPPED at the center. The exits are on the edges. You must escape outward, not find your way in.

## Gameplay Pillars

### 1. Atmospheric Dread
- Warm, oppressive circus atmosphere
- Fog that closes in as sanity drops
- Procedural audio that responds to player state
- SDF ray-marched villains that distort and morph

### 2. Simple Controls, Deep Tension
- Auto-navigation along maze paths (no complex steering)
- Gas and brake pedals (touch-friendly)
- Fork prompts for direction choices
- Focus on decision-making, not dexterity

### 3. Dual Sanity Management
- **Fear** increases when exploring new areas
- **Despair** increases when backtracking
- Forces strategic navigation choices
- No "safe" option - every decision has consequences

### 4. Procedural Replayability
- Seed-based maze generation
- Share seeds for competitive play
- Every playthrough is different

## Target Platforms

### Primary: Mobile Web
- Touch controls designed for portrait/landscape
- Fullscreen immersive mode
- Gyroscope and haptics (where supported)
- Works offline (PWA potential)

### Secondary: Desktop Web
- Keyboard/mouse support
- Larger viewport for more detail
- Same core experience

## Success Metrics

### Player Experience Goals
- Time to first scare: < 30 seconds
- Average session length: 5-10 minutes
- Completion rate: ~20% (horror games should be hard)
- Shareability: Seed sharing, screenshots

### Technical Goals
- 60fps on mid-range mobile devices
- < 5 second load time
- Works without server (client-only)
- Accessible (screen reader basics, color blind modes future)

## Non-Goals

- Multiplayer (single player experience)
- Complex inventory systems
- Story cutscenes (environmental storytelling only)
- Microtransactions
