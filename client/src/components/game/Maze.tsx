import { useTexture } from '@react-three/drei';
import type React from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type * as THREE from 'three';
import { DoubleSide, type Mesh, RepeatWrapping } from 'three';
import { ASSET_IMAGE_BASE, loadAssetCatalog, pickSeededAsset } from '../../game/assetCatalog';
import { DEFAULT_CONFIG, type MazeGeometry, type WallSegment } from '../../game/maze/geometry';
import { useGameStore } from '../../game/store';
import { MAZE_TEXTURES } from '../../game/textures';

interface MazeProps {
  geometry: MazeGeometry;
}

// Custom component to handle per-instance UV scaling
function TexturedWall({ wall, texture }: { wall: WallSegment; texture: THREE.Texture }) {
  const meshRef = useRef<Mesh>(null);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    // We need to clone the geometry to modify its UVs safely without affecting others
    // Actually, each <boxGeometry> creates a new BufferGeometry instance unless shared.
    // In R3F, <boxGeometry> inside a component creates a new instance.
    const geometry = meshRef.current.geometry;

    // Check if UVs need update to avoid loops?
    // Texture scale factor: aim for roughly 1 repeat per 5 units of world space
    const TEXTURE_SCALE = 5.0;

    // Get the dimensions
    const { width, height, depth } = wall;

    // Update UVs based on face dimensions
    // BoxGeometry uses non-indexed vertices for separated faces (usually).
    // It creates 24 vertices (4 per face * 6 faces).
    // Order: Right(+x), Left(-x), Top(+y), Bottom(-y), Front(+z), Back(-z).
    // Note: This order is standard for Three.js BoxGeometry.

    const uvAttribute = geometry.attributes.uv;
    if (!uvAttribute) return;

    // We can assume the default UVs are 0..1 for each face.
    // We just need to multiply them by the dimensions.
    // However, we need to know which dimension corresponds to U and V for each face.

    // Right (+x): Depth x Height. U -> Depth, V -> Height.
    // Left (-x): Depth x Height. U -> Depth, V -> Height.
    // Top (+y): Width x Depth. U -> Width, V -> Depth.
    // Bottom (-y): Width x Depth. U -> Width, V -> Depth.
    // Front (+z): Width x Height. U -> Width, V -> Height.
    // Back (-z): Width x Height. U -> Width, V -> Height.

    const count = uvAttribute.count; // Should be 24

    for (let i = 0; i < count; i++) {
      const u = uvAttribute.getX(i);
      const v = uvAttribute.getY(i);

      let scaleU = 1;
      let scaleV = 1;

      const faceIndex = Math.floor(i / 4);

      switch (faceIndex) {
        case 0: // Right (+x)
        case 1: // Left (-x)
          scaleU = depth / TEXTURE_SCALE;
          scaleV = height / TEXTURE_SCALE;
          break;
        case 2: // Top (+y)
        case 3: // Bottom (-y)
          scaleU = width / TEXTURE_SCALE;
          scaleV = depth / TEXTURE_SCALE;
          break;
        case 4: // Front (+z)
        case 5: // Back (-z)
          scaleU = width / TEXTURE_SCALE;
          scaleV = height / TEXTURE_SCALE;
          break;
      }

      uvAttribute.setXY(i, u * scaleU, v * scaleV);
    }

    uvAttribute.needsUpdate = true;
  }, [wall]);

  return (
    <mesh ref={meshRef} position={[wall.x, wall.height / 2, wall.z]} castShadow receiveShadow>
      <boxGeometry args={[wall.width, wall.height, wall.depth]} />
      <meshStandardMaterial
        map={texture}
        color="#c4a882"
        roughness={0.9}
        side={DoubleSide}
        transparent={true} // Handle potential PNG transparency
        alphaTest={0.5} // Cutout transparency for clean edges if needed
      />
    </mesh>
  );
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
    // For wallTexture, we set default repeat to 1,1 because we scale UVs manually now.
    wallTexture.repeat.set(1, 1);

    ceilingTexture.repeat.set(1, 2);
    floorTexture.repeat.set(16, 16);
  }, [wallTexture, ceilingTexture, floorTexture]);

  const { wallHeight } = DEFAULT_CONFIG;

  const wallMeshes = useMemo(() => {
    return geometry.walls.map((wall: WallSegment) => (
      <TexturedWall
        key={`wall-${wall.x}-${wall.z}-${wall.width}-${wall.depth}`}
        wall={wall}
        texture={wallTexture}
      />
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
