import { useTexture } from '@react-three/drei';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { DoubleSide, RepeatWrapping } from 'three';
import { ASSET_IMAGE_BASE, loadAssetCatalog, pickSeededAsset } from '../../game/assetCatalog';
import { DEFAULT_CONFIG, type MazeGeometry, type WallSegment } from '../../game/maze/geometry';
import { useGameStore } from '../../game/store';
import { MAZE_TEXTURES } from '../../game/textures';

interface MazeProps {
  geometry: MazeGeometry;
}

/**
 * Render a 3D maze scene composed of floor, ceiling, walls, and decorative tent poles using the provided geometry and seeded asset selection.
 *
 * The component loads an asset catalog, picks textures deterministically from the current seed, applies texture wrapping/repetition, and builds meshes for the floor, peaked tent ceiling, inner ceiling layer, wall segments, and regularly spaced poles.
 *
 * @param geometry - Maze geometry containing floor dimensions, wall segments, and rail nodes used to position meshes
 * @returns A React element (group) containing the assembled 3D maze scene
 */
export function Maze({ geometry }: MazeProps) {
  const seed = useGameStore((state) => state.seed);
  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof loadAssetCatalog>>>(null);

  useEffect(() => {
    let mounted = true;
    loadAssetCatalog().then((data) => {
      if (mounted) {
        setCatalog(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const wallCandidates = useMemo(() => {
    if (!catalog) return [];
    return [...catalog.images.coreWallTextures, ...catalog.images.wallTextures];
  }, [catalog]);

  const floorCandidates = useMemo(() => {
    if (!catalog) return [];
    return [...catalog.images.coreFloorTextures, ...catalog.images.floorTextures];
  }, [catalog]);

  const wallAsset = useMemo(
    () => pickSeededAsset(wallCandidates, seed || 'default', 'wall'),
    [wallCandidates, seed],
  );
  const ceilingAsset = useMemo(
    () => pickSeededAsset(wallCandidates, seed || 'default', 'ceiling'),
    [wallCandidates, seed],
  );
  const floorAsset = useMemo(
    () => pickSeededAsset(floorCandidates, seed || 'default', 'floor'),
    [floorCandidates, seed],
  );

  const wallTextureUrl = wallAsset
    ? `${ASSET_IMAGE_BASE}${wallAsset.fileName}`
    : MAZE_TEXTURES.CEILING_CANVAS.url;
  const ceilingTextureUrl = ceilingAsset
    ? `${ASSET_IMAGE_BASE}${ceilingAsset.fileName}`
    : MAZE_TEXTURES.CEILING_CANVAS.url;
  const floorTextureUrl = floorAsset
    ? `${ASSET_IMAGE_BASE}${floorAsset.fileName}`
    : MAZE_TEXTURES.FLOOR_SAWDUST.url;

  const wallTexture = useTexture(wallTextureUrl);
  const ceilingTexture = useTexture(ceilingTextureUrl);
  const floorTexture = useTexture(floorTextureUrl);

  useMemo(() => {
    [wallTexture, ceilingTexture, floorTexture].forEach((t) => {
      t.wrapS = t.wrapT = RepeatWrapping;
    });
    wallTexture.repeat.set(1, 2);
    ceilingTexture.repeat.set(1, 2);
    floorTexture.repeat.set(16, 16);
  }, [wallTexture, ceilingTexture, floorTexture]);

  const { wallHeight } = DEFAULT_CONFIG;

  const wallMeshes = useMemo(() => {
    return geometry.walls.map((wall: WallSegment) => (
      <mesh
        key={`wall-${wall.x}-${wall.z}-${wall.width}-${wall.depth}`}
        position={[wall.x, wall.height / 2, wall.z]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wall.width, wall.height, wall.depth]} />
        <meshStandardMaterial
          map={wallTexture}
          color="#c4a882"
          roughness={0.9}
          side={DoubleSide}
          transparent={true} // Handle potential PNG transparency
          alphaTest={0.5} // Cutout transparency for clean edges if needed
        />
      </mesh>
    ));
  }, [geometry, wallTexture]);

  const tentPoles = useMemo(() => {
    const poles: React.ReactNode[] = [];
    const nodes = Array.from(geometry.railNodes.values());
    const poleSpacing = 3;

    nodes.forEach((node) => {
      if (node.gridX % poleSpacing === 0 && node.gridY % poleSpacing === 0) {
        poles.push(
          <mesh
            key={`pole-${node.id}`}
            position={[node.worldX, wallHeight / 2 + 1, node.worldZ]}
            castShadow
          >
            <cylinderGeometry args={[0.1, 0.15, wallHeight + 2, 8]} />
            <meshStandardMaterial color="#3a2718" roughness={0.8} metalness={0.05} />
          </mesh>,
        );
      }
    });
    return poles;
  }, [geometry, wallHeight]);

  return (
    <group>
      {/* Consistent sawdust floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[geometry.floor.x, -0.02, geometry.floor.z]}
        receiveShadow
      >
        <planeGeometry args={[geometry.floor.width, geometry.floor.depth]} />
        <meshStandardMaterial map={floorTexture} color="#8a7560" roughness={0.95} />
      </mesh>

      {/* Peaked tent ceiling - main canvas */}
      <mesh position={[geometry.floor.x, wallHeight + 4, geometry.floor.z]}>
        <coneGeometry args={[geometry.floor.width * 0.9, 8, 8, 1, true]} />
        <meshStandardMaterial
          map={ceilingTexture}
          color="#8a7a6a"
          roughness={0.95}
          side={DoubleSide}
          transparent={true}
          alphaTest={0.5}
        />
      </mesh>

      {/* Inner ceiling dark layer for depth */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[geometry.floor.x, wallHeight + 0.5, geometry.floor.z]}
      >
        <planeGeometry args={[geometry.floor.width * 1.2, geometry.floor.depth * 1.2]} />
        <meshStandardMaterial color="#0a0805" roughness={1} side={DoubleSide} />
      </mesh>

      {wallMeshes}
      {tentPoles}
    </group>
  );
}
