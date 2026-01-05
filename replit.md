# Beppo Laughs

A 3D first-person survival horror game set in a surreal 1800s circus big top tent labyrinth. You are TRAPPED at the center of Beppo's nightmare carnival - navigate outward to escape while SDF ray-marched villain figures stalk you through the canvas corridors.

## Overview

- **Genre**: Survival Horror / Maze Navigation
- **Theme**: Victorian circus big top nightmare, Coney Island freak show meets Monty Python absurdist horror
- **Core Mechanic**: Clown car driving with dual sanity meters (Fear/Despair)
- **Goal**: Start at center, escape to perimeter exits before sanity runs out

## Architecture

### Frontend (client/)
- **Framework**: React 19 with TypeScript
- **3D Engine**: Three.js via @react-three/fiber and @react-three/drei
- **State Management**: Zustand for game state (fear, despair, blockades, rail navigation)
- **Styling**: Tailwind CSS v4 with custom horror theme
- **Routing**: Wouter
- **Audio**: Web Audio API procedural sound generation

### Key Components
- `client/src/pages/Home.tsx` - Main game page with menu/game toggle
- `client/src/components/game/Scene.tsx` - Three.js canvas with circus tent lighting
- `client/src/components/game/Maze.tsx` - Circus tent canvas walls, sawdust floor, tent poles
- `client/src/components/game/RailPlayer.tsx` - Edge-following rail movement with continuous driving
- `client/src/components/game/ClownCarCockpit.tsx` - 3D steering wheel, dashboard, and pedals
- `client/src/components/game/DriveControls.tsx` - Touch/click controls for driving (gas, brake, steer)
- `client/src/components/game/HintOverlay.tsx` - Glowing footprints and handprints
- `client/src/components/game/Villains.tsx` - SDF ray-marched villain rendering
- `client/src/components/game/Collectibles.tsx` - Paper mache items that clear blockades
- `client/src/components/game/BrainMeter.tsx` - 3D brain HUD showing Fear/Despair
- `client/src/components/game/HUD.tsx` - Sanity meters, minimap, hint button, win/lose overlays
- `client/src/components/game/AudioManager.tsx` - Reactive procedural audio
- `client/src/components/game/MainMenu.tsx` - Seed selection menu
- `client/src/game/MazeGenerator.ts` - Reverse-minotaur maze with rail graph
- `client/src/game/store.ts` - Zustand store for dual sanity, rail navigation, hints
- `client/src/game/audio.ts` - Web Audio API procedural sound engine

### Backend (server/)
- **Framework**: Express.js
- **Purpose**: Static file serving (game is client-side only)

## Game Mechanics

### Reverse Minotaur Design
- Player starts TRAPPED at maze center (13x13 odd-dimension grid)
- Exits are on the perimeter edges
- Navigate outward to escape Beppo's nightmare

### Clown Car Driving
- First-person driving experience in a clown car
- **GAS pedal** (right) - Accelerate forward along rails
- **BRAKE pedal** (left) - Slow down and stop
- **STEER control** (center) - Drag left/right to choose direction at junctions
- Edge-following movement: Car travels between maze nodes automatically
- Steering selects which path to take at intersections
- Speed indicator shows current velocity
- 3D cockpit with animated steering wheel, dashboard, and pedals

### Hint System
- **HINT button** (bottom right) reveals visual cues when pressed
- **Glowing clown shoe footprints** on ground show available paths
- **Grease paint handprints** on walls mark accessible directions
- Pink/magenta glow with pulsing animation

### Dual Sanity System
- **FEAR (Red)** - Increases when exploring unknown cells
- **DESPAIR (Blue)** - Increases when backtracking through visited cells
- Both meters visualized as 3D melting brain hemispheres
- When either meter reaches 100%, Beppo catches you (game over)

### Win/Lose Conditions
- **WIN**: Reach any exit node on the perimeter
- **LOSE**: Either sanity meter hits 100%
- Game over features cinematic Beppo video with kaleidoscopic effect

### Villain Blockades
- Villains pop up when player approaches
- 50% chance a villain creates a BLOCKADE (physical barrier)
- Blockades prevent movement until cleared
- Collect paper mache items to remove blockades

### SDF Ray Marching Villains
- Real-time procedural 3D rendering via GLSL shaders
- Signed Distance Functions create melting, morphing clown figures
- Fear level affects distortion intensity (more fear = more surreal)
- Monty Python-style jitter animation

### Circus Tent Atmosphere
- Warm flickering tungsten lights (like old lanterns)
- Amber fog that closes in as sanity drops
- Striped canvas walls with distressed vintage texture
- Sawdust floor, tent poles, decorative ropes
- Horror accent lights appear as sanity drops

### Procedural Audio System
- Creepy synthesized laughs (detuned oscillators + vibrato)
- Distorted carnival organ
- Ambient horror drone (scales with fear level)
- Jump scare stingers on villain encounters
- Sanity distortion whispers at low sanity

## Style Guide

### Colors
- Primary: #1a1510 (Dark Sepia Black)
- Canvas: #c4a882 (Aged Cream/Tan)
- Accent: #8b0000 (Blood Red)
- Warm Light: #ffaa55 (Tungsten Orange)
- Fear: #8b0000 (Dark Red)
- Despair: #00008b (Dark Blue)
- Fog: Warm amber → Sickly green (based on sanity)

### Typography
- Title: Nosifer (horror display)
- Creepy Text: Creepster
- UI: Roboto

## Generated Assets

### Textures (attached_assets/generated_images/)
- vintage_circus_tent_canvas_texture.png - Striped canvas walls
- circus_sawdust_floor_texture.png - Sawdust floor
- pale_brain_3d_asset.png - Brain meter texture

### Collectibles
- paper_mache_circus_ticket_item.png
- paper_mache_key_item.png

### Videos (attached_assets/generated_videos/)
- beppo_clown_emerging_laughing_game_over.mp4 - Game over climax

## Technical Notes

### Rail Navigation System
- RailGraph built from maze with nodes at every cell
- Edge-following movement: Player travels between nodes along edges
- edgeProgress tracks position (0-1) along current edge
- Steering input selects which path at junctions via pickNextTarget()
- Camera automatically rotates to face travel direction
- visitNode() called on each node arrival for sanity tracking
- Uses getState() in useFrame for live state updates

### SDF Shader Performance
- Villains use GLSL fragment shaders for ray marching
- Scale/animation done via mesh refs (not React state) for 60fps
- 48 ray march iterations per pixel (balanced quality/performance)

### Audio Implementation
- Web Audio API oscillators for synthesized sounds
- Pink noise for ambient texture
- Dynamic gain modulation based on game state
- Requires user interaction to initialize (browser policy)

## Running the Game
```bash
npm run dev
```
Navigate to http://localhost:5000, enter a seed or randomize, and click "ENTER MAZE".

## Controls
- **GAS** (right pedal) - Press and hold to accelerate
- **BRAKE** (left pedal) - Press to slow down/stop
- **STEER** (center) - Drag left/right to choose direction at junctions
- **HINT BUTTON** (bottom right) shows glowing clown footprints/handprints
- Find the **EXIT** markers on the perimeter to escape
- Collect items to clear blockades
- Use the **MINIMAP** (top right) to track explored areas - degrades with DESPAIR
