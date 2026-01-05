import { useMemo } from 'react';
import { DoubleSide } from 'three';
import { MazeGeometry, WallSegment, DEFAULT_CONFIG } from '../../game/maze/geometry';
import React from 'react';

const CANVAS_COLOR = "#c4a882";
const SAWDUST_COLOR = "#8a7560";
const CEILING_COLOR = "#8a7a6a";
const POLE_COLOR = "#3a2718";

interface MazeProps {
  geometry: MazeGeometry;
}

export function Maze({ geometry }: MazeProps) {
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
          color={CANVAS_COLOR}
          roughness={0.9}
          side={DoubleSide}
        />
      </mesh>
    ));
  }, [geometry]);

  const tentPoles = useMemo(() => {
    const poles: React.ReactNode[] = [];
    const nodes = Array.from(geometry.railNodes.values());
    const poleSpacing = 3;
    
    nodes.forEach((node, idx) => {
      if (node.gridX % poleSpacing === 0 && node.gridY % poleSpacing === 0) {
        poles.push(
          <mesh key={`pole-${idx}`} position={[node.worldX, wallHeight / 2 + 1, node.worldZ]} castShadow>
            <cylinderGeometry args={[0.1, 0.15, wallHeight + 2, 8]} />
            <meshStandardMaterial color={POLE_COLOR} roughness={0.8} metalness={0.05} />
          </mesh>
        );
      }
    });
    return poles;
  }, [geometry, wallHeight]);

  return (
    <group>
      {/* Sawdust floor - solid color for mobile reliability */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[geometry.floor.x, -0.02, geometry.floor.z]} 
        receiveShadow
      >
        <planeGeometry args={[geometry.floor.width, geometry.floor.depth]} />
        <meshStandardMaterial 
          color={SAWDUST_COLOR}
          roughness={0.95}
        />
      </mesh>
      
      {/* Peaked tent ceiling */}
      <mesh 
        position={[geometry.floor.x, wallHeight + 4, geometry.floor.z]}
      >
        <coneGeometry args={[geometry.floor.width * 0.9, 8, 8, 1, true]} />
        <meshStandardMaterial 
          color={CEILING_COLOR}
          roughness={0.95}
          side={DoubleSide}
        />
      </mesh>
      
      {/* Inner ceiling dark layer */}
      <mesh 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[geometry.floor.x, wallHeight + 0.5, geometry.floor.z]}
      >
        <planeGeometry args={[geometry.floor.width * 1.2, geometry.floor.depth * 1.2]} />
        <meshStandardMaterial 
          color="#0a0805"
          roughness={1}
          side={DoubleSide}
        />
      </mesh>
      
      {wallMeshes}
      {tentPoles}
    </group>
  );
}
