import { useRef, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping } from 'three';
import { MazeGenerator } from '../../game/MazeGenerator';
import hedgeTextureUrl from '@assets/generated_images/seamless_dark_hedge_texture.png';
import groundTextureUrl from '@assets/generated_images/dark_muddy_grass_ground_texture.png';
import React from 'react'; // Added React import to fix JSX namespace issue

interface MazeProps {
  maze: MazeGenerator;
}

export function Maze({ maze }: MazeProps) {
  const hedgeTexture = useTexture(hedgeTextureUrl);
  const groundTexture = useTexture(groundTextureUrl);

  // Configure Textures
  useMemo(() => {
    [hedgeTexture, groundTexture].forEach(t => {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.repeat.set(1, 1);
    });
    // Scale wall texture to repeat more often
    hedgeTexture.repeat.set(2, 1); 
    groundTexture.repeat.set(10, 10);
  }, [hedgeTexture, groundTexture]);

  const WALL_HEIGHT = 3;
  const CELL_SIZE = 2; // Size of each grid cell

  // Generate geometry based on maze data
  const walls = useMemo(() => {
    const wallMeshes: React.ReactNode[] = []; // Changed JSX.Element[] to React.ReactNode[]
    
    maze.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        const posX = x * CELL_SIZE;
        const posZ = y * CELL_SIZE;

        // Wall Thickness
        const THICKNESS = 0.2;
        const OFFSET = CELL_SIZE / 2;

        // Top Wall
        if (cell.walls.top) {
           wallMeshes.push(
            <mesh key={`top-${x}-${y}`} position={[posX, WALL_HEIGHT/2, posZ - OFFSET]} castShadow receiveShadow>
              <boxGeometry args={[CELL_SIZE + THICKNESS, WALL_HEIGHT, THICKNESS]} />
              <meshStandardMaterial map={hedgeTexture} color="#2d4a2b" roughness={0.8} />
            </mesh>
           );
        }

        if (cell.walls.bottom) {
             wallMeshes.push(
            <mesh key={`bottom-${x}-${y}`} position={[posX, WALL_HEIGHT/2, posZ + OFFSET]} castShadow receiveShadow>
              <boxGeometry args={[CELL_SIZE + THICKNESS, WALL_HEIGHT, THICKNESS]} />
              <meshStandardMaterial map={hedgeTexture} color="#2d4a2b" roughness={0.8} />
            </mesh>
           );
        }
        
        if (cell.walls.left) {
             wallMeshes.push(
            <mesh key={`left-${x}-${y}`} position={[posX - OFFSET, WALL_HEIGHT/2, posZ]} castShadow receiveShadow>
              <boxGeometry args={[THICKNESS, WALL_HEIGHT, CELL_SIZE]} />
              <meshStandardMaterial map={hedgeTexture} color="#2d4a2b" roughness={0.8} />
            </mesh>
           );
        }

        if (cell.walls.right) {
             wallMeshes.push(
            <mesh key={`right-${x}-${y}`} position={[posX + OFFSET, WALL_HEIGHT/2, posZ]} castShadow receiveShadow>
              <boxGeometry args={[THICKNESS, WALL_HEIGHT, CELL_SIZE]} />
              <meshStandardMaterial map={hedgeTexture} color="#2d4a2b" roughness={0.8} />
            </mesh>
           );
        }
      });
    });

    return wallMeshes;
  }, [maze, hedgeTexture]);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[maze.width, -0.01, maze.height]} receiveShadow>
        <planeGeometry args={[maze.width * CELL_SIZE * 2, maze.height * CELL_SIZE * 2]} />
        <meshStandardMaterial map={groundTexture} color="#1a1a1a" roughness={1} />
      </mesh>
      
      {/* Walls */}
      {walls}
    </group>
  );
}
