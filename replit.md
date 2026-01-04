# Beppo Laughs

A 3D first-person survival horror game set in a procedurally generated hedge maze. Navigate through the darkness while encountering surreal SDF ray-marched villain figures inspired by Monty Python animation, Coney Island freak shows, and opera clowns.

## Overview

- **Genre**: Survival Horror / Maze Navigation
- **Theme**: Vintage Coney Island freak show meets Monty Python absurdist horror
- **Core Mechanic**: No combat - purely maze navigation with dual sanity meters

## Architecture

### Frontend (client/)
- **Framework**: React 19 with TypeScript
- **3D Engine**: Three.js via @react-three/fiber and @react-three/drei
- **State Management**: Zustand for game state (fear, despair, blockades, path tracking)
- **Styling**: Tailwind CSS v4 with custom horror theme
- **Routing**: Wouter
- **Audio**: Web Audio API procedural sound generation

### Key Components
- `client/src/pages/Home.tsx` - Main game page with menu/game toggle
- `client/src/components/game/Scene.tsx` - Three.js canvas and 3D scene
- `client/src/components/game/Maze.tsx` - Procedural maze geometry
- `client/src/components/game/Player.tsx` - First-person controls with sanity penalties
- `client/src/components/game/Villains.tsx` - SDF ray-marched villain rendering
- `client/src/components/game/Collectibles.tsx` - Paper mache items that clear blockades
- `client/src/components/game/BrainMeter.tsx` - 3D brain HUD showing Fear/Despair
- `client/src/components/game/HUD.tsx` - Sanity meters and UI overlays
- `client/src/components/game/AudioManager.tsx` - Reactive procedural audio
- `client/src/components/game/MainMenu.tsx` - Seed selection menu
- `client/src/game/MazeGenerator.ts` - Recursive backtracking maze algorithm
- `client/src/game/store.ts` - Zustand store for dual sanity system
- `client/src/game/audio.ts` - Web Audio API procedural sound engine
- `client/src/game/collision.ts` - Collision detection with blockade support

### Backend (server/)
- **Framework**: Express.js
- **Purpose**: Static file serving (game is client-side only)

## Game Mechanics

### Dual Sanity System
- **FEAR (Red)** - Increases when exploring unknown cells
- **DESPAIR (Blue)** - Increases when backtracking through visited cells
- Both meters visualized as 3D melting brain hemispheres
- When either meter reaches 100%, Beppo catches you (game over)

### Path Tracking
- Every cell visited is tracked with visit count and timestamp
- New cells increase Fear, revisited cells increase Despair
- More repeated visits = faster Despair accumulation

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

### Perception Distortion (Low Sanity Effects)
- Camera shake and tilt
- FOV warping
- Color desaturation and hue shift
- Physics drift (random movement perturbation)
- Control inversion at very low sanity

### Procedural Audio System
- Creepy synthesized laughs (detuned oscillators + vibrato)
- Distorted carnival organ
- Ambient horror drone (scales with fear level)
- Jump scare stingers on villain encounters
- Sanity distortion whispers at low sanity

### Collectible Items
- Paper mache circus tickets and keys
- Collecting items clears one random blockade
- Items glow brighter when blockades exist
- Slight sanity recovery on collection

## Style Guide

### Colors
- Primary: #1a1a1a (Deep Black)
- Secondary: #2d4a2b (Dark Hedge Green)
- Accent: #8b0000 (Blood Red)
- Fear: #8b0000 (Dark Red)
- Despair: #00008b (Dark Blue)
- Fog: #4a5f4a (Misty Green-Grey)
- Moonlight: #c0c8d0 (Pale Blue-White)

### Typography
- Title: Nosifer (horror display)
- Creepy Text: Creepster
- UI: Roboto

## Generated Assets
All collectibles in `attached_assets/generated_images/`:
- paper_mache_circus_ticket_item.png
- paper_mache_key_item.png
- pale_brain_3d_asset.png
- seamless_dark_hedge_texture.png
- dark_muddy_grass_ground_texture.png

## Technical Notes

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
- WASD / Arrow Keys: Move
- Mouse: Look around
- Click: Lock cursor for mouse look
- Walk into items to collect them
