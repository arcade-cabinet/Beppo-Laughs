# Beppo Laughs - Project Brief

Beppo Laughs is a 3D first-person survival horror game built with React Three Fiber. Players navigate a procedurally generated circus maze in a clown car, managing sanity meters while escaping from villain figures.

## Core Requirements
- 3D First-person movement (clown car style)
- Procedural maze generation based on 3-word seeds
- Horror atmosphere with sanity meters (Fear/Despair)
- Interactive "paper-mache" style enemies and objects
- Deterministic behavior for sharing and replayability

## Tech Stack
- Frontend: React 19, R3F, Drei, Zustand, Tailwind CSS v4, Vite
- Backend: Node.js (Vercel AI SDK for dev layer)
- State Management: Zustand
- Physics: Rapier (via @react-three/rapier)
- Tooling: pnpm, Biome, Vitest, Playwright

## Key Goals
- Implement a memory-efficient maze architecture (room-based rendering)
- Smooth rail-based movement with MotionPathControls
- Surreal, low-fi horror-circus aesthetic (Monty Python style)
- AI-driven asset generation layer (build-time)
