# Beppo Laughs

A 3D first-person survival horror game set in a procedurally generated hedge maze. Navigate through the darkness while encountering jarring paper-mache style villain cutouts inspired by Monty Python animation, Coney Island freak shows, and opera clowns.

## Overview

- **Genre**: Survival Horror / Maze Navigation
- **Theme**: Vintage Coney Island freak show meets Monty Python absurdist horror
- **Core Mechanic**: No combat - purely maze navigation with fear-based penalties

## Architecture

### Frontend (client/)
- **Framework**: React 19 with TypeScript
- **3D Engine**: Three.js via @react-three/fiber and @react-three/drei
- **State Management**: Zustand for game state (fear, seed, controls)
- **Styling**: Tailwind CSS v4 with custom horror theme
- **Routing**: Wouter

### Key Components
- `client/src/pages/Home.tsx` - Main game page with menu/game toggle
- `client/src/components/game/Scene.tsx` - Three.js canvas and 3D scene
- `client/src/components/game/Maze.tsx` - Procedural maze geometry
- `client/src/components/game/Player.tsx` - First-person controls with fear penalties
- `client/src/components/game/Villains.tsx` - Paper-mache villain cutouts
- `client/src/components/game/HUD.tsx` - Fear meter and UI overlays
- `client/src/components/game/MainMenu.tsx` - Seed selection menu
- `client/src/game/MazeGenerator.ts` - Recursive backtracking maze algorithm
- `client/src/game/store.ts` - Zustand store for fear and game state

### Backend (server/)
- **Framework**: Express.js
- **Purpose**: Static file serving (game is client-side only)

## Game Mechanics

### Fear System
- Fear increases when villain cutouts "pop up" near player
- High fear (>70) can randomly invert controls
- Fear affects: camera shake, fog density, vignette intensity
- Fear slowly recovers over time

### Maze Generation
- Uses recursive backtracking algorithm
- Seeded with `seedrandom` for reproducible mazes
- Three-word seeds for memorable sharing

### Villain Cutouts
- Spawn randomly throughout maze
- Billboard toward player (always face camera)
- Pop up with jittery Monty Python-style animation
- Display jarring "HA HA HA" text

## Style Guide

### Colors
- Primary: #1a1a1a (Deep Black)
- Secondary: #2d4a2b (Dark Hedge Green)
- Accent: #8b0000 (Blood Red)
- Fog: #4a5f4a (Misty Green-Grey)
- Moonlight: #c0c8d0 (Pale Blue-White)

### Typography
- Title: Nosifer (horror display)
- Creepy Text: Creepster
- UI: Roboto

## Generated Assets
All villain cutouts in `attached_assets/generated_images/`:
- paper_mache_beppo_sad_clown_cutout.png
- manic_boardwalk_barker_cutout.png
- vintage_opera_clown_cutout.png
- vintage_coney_island_freak_show_beppo_cutout.png
- seamless_dark_hedge_texture.png
- dark_muddy_grass_ground_texture.png

## Audio Resources (User to Source)
Recommended public domain sources for horror sound effects:
- Freesound.org (CC0 filter)
- Internet Archive
- SFXLibrary.com
- Pixabay Sound Effects

## Running the Game
```bash
npm run dev
```
Navigate to http://localhost:5000, enter a seed or randomize, and click "ENTER MAZE".

## Controls
- WASD / Arrow Keys: Move
- Mouse: Look around
- Click: Lock cursor for mouse look
