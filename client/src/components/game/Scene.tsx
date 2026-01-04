import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { Maze } from './Maze';
import { Player } from './Player';
import { MazeGenerator } from '../../game/MazeGenerator';
import { Villains } from './Villains';
import { Collectibles } from './Collectibles';
import { useGameStore } from '../../game/store';

interface SceneProps {
  seed: string;
}

export function Scene({ seed }: SceneProps) {
  const [maze, setMaze] = useState<MazeGenerator | null>(null);
  const { fear, despair, maxSanity } = useGameStore();
  const sanityLevel = useGameStore(state => state.getSanityLevel());

  useEffect(() => {
    const newMaze = new MazeGenerator(12, 12, seed);
    setMaze(newMaze);
  }, [seed]);

  // Atmosphere adjusts based on sanity
  const avgInsanity = (fear + despair) / 2 / maxSanity;
  const fogDensity = 15 - avgInsanity * 10;
  
  // Color shifts at low sanity
  const bgColor = sanityLevel < 50 
    ? `hsl(${280 + (50 - sanityLevel)}, 20%, ${3 + avgInsanity * 2}%)` 
    : '#050505';

  if (!maze) return null;

  return (
    <Canvas 
      shadows 
      camera={{ fov: 75 + avgInsanity * 10, near: 0.1, far: 100 }} // FOV distorts with insanity
      style={{
        filter: sanityLevel < 30 
          ? `saturate(${0.5 + sanityLevel / 60}) contrast(${1 + avgInsanity * 0.3})` 
          : 'none'
      }}
    >
      {/* Atmosphere */}
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[bgColor, 0, Math.max(5, fogDensity)]} /> 
      
      <Sky sunPosition={[0, -1, 0]} turbidity={10} rayleigh={0.5 + avgInsanity} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1 + avgInsanity * 2} />

      {/* Lighting - dims with insanity */}
      <ambientLight intensity={0.08 * (sanityLevel / 100 + 0.3)} color="#1a1a1a" />
      <pointLight position={[10, 10, 10]} intensity={0.1} color="#2d4a2b" />
      
      {/* Color-shifted lights at low sanity */}
      {sanityLevel < 50 && (
        <>
          <pointLight position={[-5, 3, -5]} intensity={0.1 * avgInsanity} color="#8b0000" />
          <pointLight position={[5, 3, 5]} intensity={0.1 * avgInsanity} color="#00008b" />
        </>
      )}
      
      <spotLight 
        position={[0, 5, 0]} 
        angle={0.6} 
        penumbra={1} 
        intensity={0.4 * (sanityLevel / 100 + 0.2)} 
        castShadow 
        color="#c0c8d0"
      />

      <Suspense fallback={null}>
        <Maze maze={maze} />
        <Villains maze={maze} />
        <Collectibles maze={maze} />
      </Suspense>

      <Player position={[0, 1, 0]} maze={maze} />
    </Canvas>
  );
}
