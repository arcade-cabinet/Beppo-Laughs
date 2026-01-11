import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { PointLight } from 'three';
import * as THREE from 'three';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useGameStore } from '@/game/store';
import { loadAssetCatalog } from '../../game/assetCatalog';
import { generateMaze, type MazeLayout } from '../../game/maze/core';
import { buildGeometry, DEFAULT_CONFIG, type MazeGeometry } from '../../game/maze/geometry';
import { buildSpawnPlan } from '../../game/spawnPlan';
import { AudioManager } from './AudioManager';
import { Blockades } from './Blockades';
import { CameraAttachedCockpit } from './CameraAttachedCockpit';
import { Collectibles } from './Collectibles';
import { ForkPrompt } from './ForkPrompt';
import { HorrorEffects } from './HorrorEffects';
import { InteractionPrompt } from './InteractionPrompt';
import { JourneyMapReveal } from './JourneyMapReveal';
import { Maze } from './Maze';
import { NightmareJournal } from './NightmareJournal';
import { RailPlayer } from './RailPlayer';
import { Villains } from './Villains';

interface SceneProps {
  seed: string;
}

function FlickeringLight({
  position,
  color,
  intensity,
  distance,
}: {
  position: [number, number, number];
  color: string;
  intensity: number;
  distance: number;
}) {
  const lightRef = useRef<PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const flicker = Math.sin(state.clock.elapsedTime * 8 + position[0]) * 0.15;
      const slow = Math.sin(state.clock.elapsedTime * 0.5 + position[2]) * 0.1;
      lightRef.current.intensity = intensity * (1 + flicker + slow);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={position}
      color={color}
      intensity={intensity}
      distance={distance}
      castShadow
    />
  );
}

function getDirectionFromDelta(dx: number, dy: number): 'north' | 'south' | 'east' | 'west' {
  if (dy < 0) return 'north';
  if (dy > 0) return 'south';
  if (dx > 0) return 'east';
  return 'west';
}

/**
 * Render the interactive 3D maze scene generated from a deterministic seed.
 *
 * Generates maze geometry, loads assets, updates related game state (current node,
 * available moves, blockades and requirements), and returns the scene UI containing
 * 3D rendering, audio, post-processing, and HTML overlays.
 *
 * @param seed - Seed string used to deterministically generate the maze and spawn plan
 * @returns A React element rendering the 3D maze scene, or `null` while maze data is not yet available
 */
export function Scene({ seed }: SceneProps) {
  const [mazeData, setMazeData] = useState<{ layout: MazeLayout; geometry: MazeGeometry } | null>(
    null,
  );
  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof loadAssetCatalog>>>(null);
  const { fear, despair, maxSanity, currentNode, blockades, isMoving, graphicsQuality } =
    useGameStore();

  useEffect(() => {
    if (!mazeData || !currentNode || isMoving) return;

    const { geometry } = mazeData;
    const current = geometry.railNodes.get(currentNode);
    if (!current) return;

    const moves: {
      direction: 'north' | 'south' | 'east' | 'west';
      nodeId: string;
      isExit: boolean;
    }[] = [];
    for (const connId of current.connections) {
      const node = geometry.railNodes.get(connId);
      if (!node) continue;
      if (blockades.has(connId)) continue;

      const dx = node.gridX - current.gridX;
      const dy = node.gridY - current.gridY;
      const direction = getDirectionFromDelta(dx, dy);
      moves.push({ direction, nodeId: node.id, isExit: node.isExit });
    }

    useGameStore.getState().setAvailableMoves(moves);
  }, [mazeData, currentNode, blockades, isMoving]);

  useEffect(() => {
    const layout = generateMaze(13, 13, seed);
    const geometry = buildGeometry(layout, DEFAULT_CONFIG);
    setMazeData({ layout, geometry });

    const store = useGameStore.getState();

    // Only set starting node if not already set (e.g. New Game vs Continue)
    if (!store.currentNode) {
      store.setCurrentNode(geometry.centerNodeId);
    }
  }, [seed]);

  useEffect(() => {
    let mounted = true;
    loadAssetCatalog().then((data) => {
      if (mounted) setCatalog(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const avgInsanity = maxSanity > 0 ? (fear + despair) / 2 / maxSanity : 0;

  // Fog calculations for atmosphere and depth perception
  // Significantly increased visibility ranges to fix visual regression
  // At avgInsanity=0: fogNear=20, fogFar=60 (provides clear maze visibility)
  const fogNear = Math.max(10, 20 - avgInsanity * 8); // Start fog much further out
  const fogFar = Math.max(35, 60 - avgInsanity * 20); // End fog much further out
  const fogHue = 30 + avgInsanity * 60;
  const fogColor = `hsl(${fogHue}, ${30 - avgInsanity * 15}%, ${15 - avgInsanity * 5}%)`;

  const bgBrightness = Math.max(8, 25 - avgInsanity * 17);
  const bgColor = `hsl(30, 40%, ${bgBrightness}%)`;

  const spawnPlan = useMemo(() => {
    if (!mazeData) return null;
    return buildSpawnPlan({
      geometry: mazeData.geometry,
      seed,
      catalog,
    });
  }, [mazeData, seed, catalog]);

  useEffect(() => {
    const store = useGameStore.getState();
    if (!spawnPlan) {
      store.setBlockades(new Set());
      store.setBlockadeRequirements(new Map());
      return;
    }

    const blockadeIds = new Set(spawnPlan.blockades.map((blockade) => blockade.nodeId));
    const requirements = new Map(
      spawnPlan.blockades.map((blockade) => [
        blockade.nodeId,
        { itemId: blockade.requiredItemId, itemName: blockade.requiredItemName },
      ]),
    );

    store.setBlockades(blockadeIds);
    store.setBlockadeRequirements(requirements);
  }, [spawnPlan]);

  if (!mazeData) return null;

  const { geometry } = mazeData;
  const centerWorld = { x: geometry.floor.x, z: geometry.floor.z };

  return (
    <>
      <AudioManager />

      <ErrorBoundary
        fallback={({ error, resetError }) => (
          <ErrorFallback
            error={error}
            resetError={resetError}
            title="WebGL rendering encountered an error"
            message="The 3D renderer failed. This could be due to graphics driver issues or browser compatibility. Try restarting the game."
          />
        )}
        onReset={() => {
          useGameStore.getState().resetGame();
        }}
      >
        <div className="w-full h-full">
          <Canvas
            shadows
            camera={{ position: [0, 1.4, 0], fov: 70, near: 0.1, far: 100 }}
            gl={{ antialias: graphicsQuality !== 'low', alpha: false }}
            onCreated={({ gl }) => {
              if (graphicsQuality !== 'low') {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.1;
              }
            }}
          >
            <color attach="background" args={[bgColor]} />

            {/* Fog for depth perception - essential for 3D feel */}
            <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

            {/* Increased ambient light to make maze visible */}
            <ambientLight intensity={0.6} color="#ffffff" />

            <FlickeringLight
              position={[centerWorld.x, 4, centerWorld.z]}
              color="#ffaa55"
              intensity={1.2 * (1 - avgInsanity * 0.4)}
              distance={30}
            />

            <Suspense fallback={null}>
              <Maze geometry={geometry} />
              {spawnPlan?.blockades.length ? <Blockades blockades={spawnPlan.blockades} /> : null}
              <Collectibles geometry={geometry} items={spawnPlan?.collectibles} />
              <RailPlayer geometry={geometry} />
              <Villains geometry={geometry} />

              {/* 3D Cockpit attached to camera */}
              <CameraAttachedCockpit />
            </Suspense>

            {/* GPU post-processing effects for horror atmosphere */}
            {graphicsQuality !== 'low' && <HorrorEffects />}
          </Canvas>
        </div>
      </ErrorBoundary>

      {/* HTML overlays for UI that needs to be 2D */}
      <ForkPrompt />
      <InteractionPrompt />
      <NightmareJournal />
      <JourneyMapReveal />
    </>
  );
}