import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import { Maze } from './Maze';
import { RailPlayer } from './RailPlayer';
import { generateMaze, MazeLayout } from '../../game/maze/core';
import { buildGeometry, MazeGeometry, DEFAULT_CONFIG } from '../../game/maze/geometry';
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
  const [mazeData, setMazeData] = useState<{ layout: MazeLayout; geometry: MazeGeometry } | null>(null);
  const { fear, despair, maxSanity } = useGameStore();
  const sanityLevel = useGameStore(state => state.getSanityLevel());

  useEffect(() => {
    const layout = generateMaze(13, 13, seed);
    const geometry = buildGeometry(layout, DEFAULT_CONFIG);
    setMazeData({ layout, geometry });
    console.log('Generated 2D maze:', layout.width, 'x', layout.height);
    console.log('Center:', layout.center, 'Exits:', layout.exits);
    console.log('Rail nodes:', geometry.railNodes.size);
  }, [seed]);

  const avgInsanity = (fear + despair) / 2 / maxSanity;
  
  const fogNear = Math.max(2, 12 - avgInsanity * 8);
  const fogFar = Math.max(15, 35 - avgInsanity * 20);
  
  const bgBrightness = Math.max(8, 25 - avgInsanity * 17);
  const bgColor = `hsl(30, 40%, ${bgBrightness}%)`;
  
  const fogHue = 30 + avgInsanity * 60;
  const fogColor = `hsl(${fogHue}, ${30 - avgInsanity * 15}%, ${20 - avgInsanity * 10}%)`;

  if (!mazeData) return null;

  const { layout, geometry } = mazeData;
  const centerWorld = { x: geometry.floor.x, z: geometry.floor.z };

  return (
    <>
      <AudioManager />
      
      <Canvas 
        shadows 
        camera={{ fov: 90, near: 0.1, far: 100 }}
        style={{
          filter: sanityLevel < 30 
            ? `saturate(${0.4 + sanityLevel / 50}) contrast(${1.1 + avgInsanity * 0.2}) sepia(${avgInsanity * 0.3})` 
            : `sepia(${avgInsanity * 0.15})`
        }}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[fogColor, fogNear, fogFar]} /> 
        
        <ambientLight intensity={0.15 + (1 - avgInsanity) * 0.15} color="#ffd4a0" />
        
        <FlickeringLight 
          position={[centerWorld.x, 4, centerWorld.z]} 
          color="#ffaa55" 
          intensity={1.2 * (1 - avgInsanity * 0.4)} 
          distance={30}
        />
        
        <FlickeringLight 
          position={[4, 3.5, 4]} 
          color="#ff9944" 
          intensity={0.8 * (1 - avgInsanity * 0.3)} 
          distance={15}
        />
        <FlickeringLight 
          position={[centerWorld.x * 2 - 4, 3.5, 4]} 
          color="#ffaa66" 
          intensity={0.7 * (1 - avgInsanity * 0.3)} 
          distance={15}
        />
        <FlickeringLight 
          position={[4, 3.5, centerWorld.z * 2 - 4]} 
          color="#ff8833" 
          intensity={0.7 * (1 - avgInsanity * 0.3)} 
          distance={15}
        />
        <FlickeringLight 
          position={[centerWorld.x * 2 - 4, 3.5, centerWorld.z * 2 - 4]} 
          color="#ffbb77" 
          intensity={0.8 * (1 - avgInsanity * 0.3)} 
          distance={15}
        />
        
        {avgInsanity > 0.2 && (
          <>
            <pointLight 
              position={[centerWorld.x - 5, 2, centerWorld.z - 5]} 
              intensity={avgInsanity * 0.5} 
              color="#8b0000" 
              distance={12} 
            />
            <pointLight 
              position={[centerWorld.x + 5, 2, centerWorld.z + 5]} 
              intensity={avgInsanity * 0.4} 
              color="#4a0066" 
              distance={12} 
            />
          </>
        )}
        
        {avgInsanity > 0.5 && (
          <spotLight
            position={[centerWorld.x, 6, centerWorld.z]}
            angle={0.4}
            penumbra={0.8}
            intensity={avgInsanity * 2}
            color="#ff4400"
            distance={20}
            target-position={[centerWorld.x, 0, centerWorld.z]}
          />
        )}

        <Suspense fallback={null}>
          <Maze geometry={geometry} />
          <Villains geometry={geometry} />
          <Collectibles geometry={geometry} />
          <TapZones geometry={geometry} />
        </Suspense>

        <RailPlayer geometry={geometry} />
      </Canvas>
    </>
  );
}
