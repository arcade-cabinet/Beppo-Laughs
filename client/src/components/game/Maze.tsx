import { useRef, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping, DoubleSide } from 'three';
import { MazeGenerator } from '../../game/MazeGenerator';
import canvasTextureUrl from '@assets/generated_images/vintage_circus_tent_canvas_texture.png';
import sawdustTextureUrl from '@assets/generated_images/circus_sawdust_floor_texture.png';
import React from 'react';

interface MazeProps {
  maze: MazeGenerator;
}

export function Maze({ maze }: MazeProps) {
  const canvasTexture = useTexture(canvasTextureUrl);
  const sawdustTexture = useTexture(sawdustTextureUrl);

  useMemo(() => {
    [canvasTexture, sawdustTexture].forEach(t => {
      t.wrapS = t.wrapT = RepeatWrapping;
    });
    canvasTexture.repeat.set(1, 1.5);
    sawdustTexture.repeat.set(12, 12);
  }, [canvasTexture, sawdustTexture]);

  const WALL_HEIGHT = 3.5;
  const CELL_SIZE = 5;

  const walls = useMemo(() => {
    const wallMeshes: React.ReactNode[] = [];
    
    maze.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        const posX = x * CELL_SIZE;
        const posZ = y * CELL_SIZE;
        const THICKNESS = 0.15;
        const OFFSET = CELL_SIZE / 2;

        if (cell.walls.top) {
          wallMeshes.push(
            <mesh key={`top-${x}-${y}`} position={[posX, WALL_HEIGHT/2, posZ - OFFSET]} castShadow receiveShadow>
              <boxGeometry args={[CELL_SIZE + THICKNESS, WALL_HEIGHT, THICKNESS]} />
              <meshStandardMaterial 
                map={canvasTexture} 
                color="#c4a882"
                roughness={0.9}
                side={DoubleSide}
              />
            </mesh>
          );
        }

        if (cell.walls.bottom) {
          wallMeshes.push(
            <mesh key={`bottom-${x}-${y}`} position={[posX, WALL_HEIGHT/2, posZ + OFFSET]} castShadow receiveShadow>
              <boxGeometry args={[CELL_SIZE + THICKNESS, WALL_HEIGHT, THICKNESS]} />
              <meshStandardMaterial 
                map={canvasTexture} 
                color="#c4a882"
                roughness={0.9}
                side={DoubleSide}
              />
            </mesh>
          );
        }
        
        if (cell.walls.left) {
          wallMeshes.push(
            <mesh key={`left-${x}-${y}`} position={[posX - OFFSET, WALL_HEIGHT/2, posZ]} castShadow receiveShadow>
              <boxGeometry args={[THICKNESS, WALL_HEIGHT, CELL_SIZE]} />
              <meshStandardMaterial 
                map={canvasTexture} 
                color="#c4a882"
                roughness={0.9}
                side={DoubleSide}
              />
            </mesh>
          );
        }

        if (cell.walls.right) {
          wallMeshes.push(
            <mesh key={`right-${x}-${y}`} position={[posX + OFFSET, WALL_HEIGHT/2, posZ]} castShadow receiveShadow>
              <boxGeometry args={[THICKNESS, WALL_HEIGHT, CELL_SIZE]} />
              <meshStandardMaterial 
                map={canvasTexture} 
                color="#c4a882"
                roughness={0.9}
                side={DoubleSide}
              />
            </mesh>
          );
        }
      });
    });

    return wallMeshes;
  }, [maze, canvasTexture]);

  // Tent poles at intersections
  const tentPoles = useMemo(() => {
    const poles: React.ReactNode[] = [];
    const poleSpacing = 4;
    
    for (let x = 0; x < maze.width; x += poleSpacing) {
      for (let z = 0; z < maze.height; z += poleSpacing) {
        poles.push(
          <mesh key={`pole-${x}-${z}`} position={[x * CELL_SIZE, WALL_HEIGHT/2 + 0.5, z * CELL_SIZE]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, WALL_HEIGHT + 1, 8]} />
            <meshStandardMaterial color="#4a3728" roughness={0.7} metalness={0.1} />
          </mesh>
        );
      }
    }
    return poles;
  }, [maze]);

  // Rope decorations along top of walls
  const ropeDecor = useMemo(() => {
    const ropes: React.ReactNode[] = [];
    const ropeY = WALL_HEIGHT + 0.1;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = maze.width * 0.8;
      ropes.push(
        <mesh 
          key={`rope-${i}`} 
          position={[
            maze.width + Math.cos(angle) * radius, 
            ropeY - 0.5, 
            maze.height + Math.sin(angle) * radius
          ]}
          rotation={[0, angle, 0]}
        >
          <torusGeometry args={[0.3, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#8b7355" roughness={1} />
        </mesh>
      );
    }
    return ropes;
  }, [maze]);

  return (
    <group>
      {/* Sawdust Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[maze.width, -0.01, maze.height]} receiveShadow>
        <planeGeometry args={[maze.width * CELL_SIZE * 2, maze.height * CELL_SIZE * 2]} />
        <meshStandardMaterial 
          map={sawdustTexture} 
          color="#a08060"
          roughness={1}
        />
      </mesh>
      
      {/* Tent Ceiling (dark canvas above) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[maze.width, WALL_HEIGHT + 2, maze.height]}>
        <planeGeometry args={[maze.width * CELL_SIZE * 3, maze.height * CELL_SIZE * 3]} />
        <meshStandardMaterial 
          color="#1a1510"
          roughness={1}
          side={DoubleSide}
        />
      </mesh>
      
      {/* Canvas Walls */}
      {walls}
      
      {/* Tent Poles */}
      {tentPoles}
      
      {/* Decorative Ropes */}
      {ropeDecor}
    </group>
  );
}
