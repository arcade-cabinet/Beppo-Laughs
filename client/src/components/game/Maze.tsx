import { useTexture } from '@react-three/drei';
import type React from 'react';
import { useMemo } from 'react';
import { DoubleSide, RepeatWrapping } from 'three';
import { MAZE_TEXTURES } from '../../game/textures';
import { DEFAULT_CONFIG, type MazeGeometry, type WallSegment } from '../../game/maze/geometry';

interface MazeProps {
  geometry: MazeGeometry;
}

export function Maze({ geometry }: MazeProps) {
  const canvasTexture = useTexture(MAZE_TEXTURES.CEILING_CANVAS.url);
  const sawdustTexture = useTexture(MAZE_TEXTURES.FLOOR_SAWDUST.url);

  useMemo(() => {
    [canvasTexture, sawdustTexture].forEach((t) => {
      t.wrapS = t.wrapT = RepeatWrapping;
    });
    canvasTexture.repeat.set(1, 2);
    sawdustTexture.repeat.set(16, 16);
  }, [canvasTexture, sawdustTexture]);

  const { wallHeight } = DEFAULT_CONFIG;

  const wallMeshes = useMemo(() => {
    return geometry.walls.map((wall: WallSegment, idx: number) => (
      <mesh
        key={`wall-${idx}`}
        position={[wall.x, wall.height / 2, wall.z]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wall.width, wall.height, wall.depth]} />
        <meshStandardMaterial
          map={canvasTexture}
          color="#c4a882"
          roughness={0.9}
          side={DoubleSide}
        />
      </mesh>
    ));
  }, [geometry, canvasTexture]);

  const tentPoles = useMemo(() => {
    const poles: React.ReactNode[] = [];
    const nodes = Array.from(geometry.railNodes.values());
    const poleSpacing = 3;

    nodes.forEach((node, idx) => {
      if (node.gridX % poleSpacing === 0 && node.gridY % poleSpacing === 0) {
        poles.push(
          <mesh
            key={`pole-${idx}`}
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
        <meshStandardMaterial map={sawdustTexture} color="#8a7560" roughness={0.95} />
      </mesh>

      {/* Peaked tent ceiling - main canvas */}
      <mesh position={[geometry.floor.x, wallHeight + 4, geometry.floor.z]}>
        <coneGeometry args={[geometry.floor.width * 0.9, 8, 8, 1, true]} />
        <meshStandardMaterial
          map={canvasTexture}
          color="#8a7a6a"
          roughness={0.95}
          side={DoubleSide}
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
