import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { Maze } from './Maze';
import { RailPlayer } from './RailPlayer';
import { MazeGenerator } from '../../game/MazeGenerator';
import { Villains } from './Villains';
import { Collectibles } from './Collectibles';
import { TapZones } from './TapZones';
import { AudioManager } from './AudioManager';
import { useGameStore } from '../../game/store';

interface SceneProps {
  seed: string;
}

export function Scene({ seed }: SceneProps) {
  const [maze, setMaze] = useState<MazeGenerator | null>(null);
  const { fear, despair, maxSanity } = useGameStore();
  const sanityLevel = useGameStore(state => state.getSanityLevel());

  useEffect(() => {
    // 13x13 maze (odd for true center)
    const newMaze = new MazeGenerator(13, 13, seed);
    setMaze(newMaze);
  }, [seed]);

  // Calculate insanity level (0 = sane, 1 = insane)
  const avgInsanity = (fear + despair) / 2 / maxSanity;
  
  // DAYLIGHT START: Fog is far when sane, closes in as sanity drops
  const fogNear = Math.max(3, 15 - avgInsanity * 12);
  const fogFar = Math.max(20, 40 - avgInsanity * 25);
  
  // Sky color: bright day (sane) -> dark night (insane)
  const skyBrightness = Math.max(0.1, 1 - avgInsanity * 0.9);
  
  // Background shifts from light blue (sane) to dark (insane)
  const bgHue = 210; // Blue
  const bgSaturation = 30 - avgInsanity * 20;
  const bgLightness = Math.max(5, 50 - avgInsanity * 45);
  const bgColor = `hsl(${bgHue}, ${bgSaturation}%, ${bgLightness}%)`;

  if (!maze) return null;

  return (
    <>
      {/* Procedural Audio System */}
      <AudioManager />
      
      <Canvas 
        shadows 
        camera={{ fov: 70, near: 0.1, far: 100 }}
        style={{
          filter: sanityLevel < 30 
            ? `saturate(${0.5 + sanityLevel / 60}) contrast(${1 + avgInsanity * 0.3})` 
            : 'none'
        }}
      >
        {/* Atmosphere - starts bright, darkens with insanity */}
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, fogNear, fogFar]} /> 
        
        {/* Sky - sun position changes with sanity */}
        <Sky 
          sunPosition={[0, skyBrightness * 10, -5]} 
          turbidity={2 + avgInsanity * 8} 
          rayleigh={0.5 + avgInsanity * 2} 
          mieCoefficient={0.005} 
          mieDirectionalG={0.8} 
        />
        
        {/* Stars only appear as sanity drops */}
        {avgInsanity > 0.3 && (
          <Stars 
            radius={100} 
            depth={50} 
            count={Math.floor(avgInsanity * 5000)} 
            factor={4} 
            saturation={0} 
            fade 
            speed={1 + avgInsanity * 2} 
          />
        )}

        {/* DAYLIGHT LIGHTING - bright when sane */}
        <ambientLight intensity={0.4 + (1 - avgInsanity) * 0.4} color="#ffffff" />
        <hemisphereLight 
          intensity={0.5 + (1 - avgInsanity) * 0.3} 
          color="#87ceeb" 
          groundColor="#3d5c3d" 
        />
        
        {/* Sun light - strong when sane */}
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={0.8 * (1 - avgInsanity * 0.6)} 
          castShadow 
          color="#ffffd0"
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Horror lights only appear as sanity drops */}
        {avgInsanity > 0.3 && (
          <>
            <pointLight position={[-5, 3, -5]} intensity={avgInsanity * 0.3} color="#8b0000" distance={15} />
            <pointLight position={[5, 3, 5]} intensity={avgInsanity * 0.3} color="#00008b" distance={15} />
          </>
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
