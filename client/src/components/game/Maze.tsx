import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping, DoubleSide } from 'three';
import { MazeGeometry, WallSegment, DEFAULT_CONFIG } from '../../game/maze/geometry';
import canvasTextureUrl from '@assets/generated_images/vintage_circus_tent_canvas_texture.png';
import sawdustTextureUrl from '@assets/generated_images/circus_sawdust_floor_texture.png';
import React from 'react';

interface MazeProps {
  geometry: MazeGeometry;
}

export function Maze({ geometry }: MazeProps) {
  const canvasTexture = useTexture(canvasTextureUrl);
  const sawdustTexture = useTexture(sawdustTextureUrl);

  useMemo(() => {
    [canvasTexture, sawdustTexture].forEach(t => {
      t.wrapS = t.wrapT = RepeatWrapping;
    });
    canvasTexture.repeat.set(1, 1.5);
    sawdustTexture.repeat.set(12, 12);
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
    const poleSpacing = 4;
    
    nodes.forEach((node, idx) => {
      if (node.gridX % poleSpacing === 0 && node.gridY % poleSpacing === 0) {
        poles.push(
          <mesh key={`pole-${idx}`} position={[node.worldX, wallHeight / 2 + 0.5, node.worldZ]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, wallHeight + 1, 8]} />
            <meshStandardMaterial color="#4a3728" roughness={0.7} metalness={0.1} />
          </mesh>
        );
      }
    });
    return poles;
  }, [geometry, wallHeight]);

  return (
    <group>
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[geometry.floor.x, -0.01, geometry.floor.z]} 
        receiveShadow
      >
        <planeGeometry args={[geometry.floor.width, geometry.floor.depth]} />
        <meshStandardMaterial 
          map={sawdustTexture} 
          color="#a08060"
          roughness={1}
        />
      </mesh>
      
      <mesh 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[geometry.floor.x, wallHeight + 2, geometry.floor.z]}
      >
        <planeGeometry args={[geometry.floor.width * 1.5, geometry.floor.depth * 1.5]} />
        <meshStandardMaterial 
          color="#1a1510"
          roughness={1}
          side={DoubleSide}
        />
      </mesh>
      
      {wallMeshes}
      {tentPoles}
    </group>
  );
}
