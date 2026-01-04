import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import { Maze } from './Maze';
import { RailPlayer } from './RailPlayer';
import { MazeGenerator } from '../../game/MazeGenerator';
import { Villains } from './Villains';
import { Collectibles } from './Collectibles';
import { TapZones } from './TapZones';
import { AudioManager } from './AudioManager';
import { useGameStore } from '../../game/store';
import { PointLight } from 'three';

interface SceneProps {
  seed: string;
}

function FlickeringLight({ position, color, intensity, distance }: { 
  position: [number, number, number], 
  color: string, 
  intensity: number,
  distance: number 
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

export function Scene({ seed }: SceneProps) {
  const [maze, setMaze] = useState<MazeGenerator | null>(null);
  const { fear, despair, maxSanity } = useGameStore();
  const sanityLevel = useGameStore(state => state.getSanityLevel());

  useEffect(() => {
    const newMaze = new MazeGenerator(13, 13, seed);
    setMaze(newMaze);
  }, [seed]);

  const avgInsanity = (fear + despair) / 2 / maxSanity;
  
  // CIRCUS TENT INTERIOR: Warm amber fog, closer when insane
  const fogNear = Math.max(2, 12 - avgInsanity * 8);
  const fogFar = Math.max(15, 35 - avgInsanity * 20);
  
  // Warm sepia/amber background - darkens with insanity
  const bgBrightness = Math.max(8, 25 - avgInsanity * 17);
  const bgColor = `hsl(30, 40%, ${bgBrightness}%)`;
  
  // Fog color shifts from warm amber to sickly green as insanity rises
  const fogHue = 30 + avgInsanity * 60;
  const fogColor = `hsl(${fogHue}, ${30 - avgInsanity * 15}%, ${20 - avgInsanity * 10}%)`;

  if (!maze) return null;

  return (
    <>
      <AudioManager />
      
      <Canvas 
        shadows 
        camera={{ fov: 75, near: 0.1, far: 100 }}
        style={{
          filter: sanityLevel < 30 
            ? `saturate(${0.4 + sanityLevel / 50}) contrast(${1.1 + avgInsanity * 0.2}) sepia(${avgInsanity * 0.3})` 
            : `sepia(${avgInsanity * 0.15})`
        }}
      >
        {/* Dark circus tent interior */}
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[fogColor, fogNear, fogFar]} /> 
        
        {/* Base ambient - dim tungsten warmth */}
        <ambientLight intensity={0.15 + (1 - avgInsanity) * 0.15} color="#ffd4a0" />
        
        {/* Overhead warm lights - like old circus lanterns */}
        <FlickeringLight 
          position={[maze.width, 4, maze.height]} 
          color="#ffaa55" 
          intensity={1.2 * (1 - avgInsanity * 0.4)} 
          distance={30}
        />
        
        {/* Scattered warm point lights throughout tent */}
        <FlickeringLight 
          position={[4, 3.5, 4]} 
          color="#ff9944" 
          intensity={0.8 * (1 - avgInsanity * 0.3)} 
          distance={15}
        />
        <FlickeringLight 
          position={[maze.width * 2 - 4, 3.5, 4]} 
          color="#ffaa66" 
          intensity={0.7 * (1 - avgInsanity * 0.3)} 
          distance={15}
        />
        <FlickeringLight 
          position={[4, 3.5, maze.height * 2 - 4]} 
          color="#ff8833" 
          intensity={0.7 * (1 - avgInsanity * 0.3)} 
          distance={15}
        />
        <FlickeringLight 
          position={[maze.width * 2 - 4, 3.5, maze.height * 2 - 4]} 
          color="#ffbb77" 
          intensity={0.8 * (1 - avgInsanity * 0.3)} 
          distance={15}
        />
        
        {/* Horror accent lights - appear as sanity drops */}
        {avgInsanity > 0.2 && (
          <>
            <pointLight 
              position={[maze.width - 5, 2, maze.height - 5]} 
              intensity={avgInsanity * 0.5} 
              color="#8b0000" 
              distance={12} 
            />
            <pointLight 
              position={[maze.width + 5, 2, maze.height + 5]} 
              intensity={avgInsanity * 0.4} 
              color="#4a0066" 
              distance={12} 
            />
          </>
        )}
        
        {/* Creepy spotlight from above at high insanity */}
        {avgInsanity > 0.5 && (
          <spotLight
            position={[maze.width, 6, maze.height]}
            angle={0.4}
            penumbra={0.8}
            intensity={avgInsanity * 2}
            color="#ff4400"
            distance={20}
            target-position={[maze.width, 0, maze.height]}
          />
        )}

        <Suspense fallback={null}>
          <Maze maze={maze} />
          <Villains maze={maze} />
          <Collectibles maze={maze} />
          <TapZones maze={maze} />
        </Suspense>

        <RailPlayer maze={maze} />
      </Canvas>
    </>
  );
}
