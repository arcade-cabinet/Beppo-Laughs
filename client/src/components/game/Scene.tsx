import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { Maze } from './Maze';
import { Player } from './Player';
import { MazeGenerator } from '../../game/MazeGenerator';
import { Villains } from './Villains';
import { Collectibles } from './Collectibles';
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
    const newMaze = new MazeGenerator(12, 12, seed);
    setMaze(newMaze);
  }, [seed]);

  // Atmosphere adjusts based on sanity
  const avgInsanity = (fear + despair) / 2 / maxSanity;
  
  // Fog gets closer as insanity rises, but starts further away
  const fogNear = Math.max(2, 8 - avgInsanity * 6);
  const fogFar = Math.max(12, 25 - avgInsanity * 10);
  
  // Color shifts at low sanity
  const bgColor = sanityLevel < 50 
    ? `hsl(${280 + (50 - sanityLevel)}, 15%, ${5 + avgInsanity * 3}%)` 
    : '#0a0a0a';

  if (!maze) return null;

  return (
    <>
      {/* Procedural Audio System */}
      <AudioManager />
      
      <Canvas 
        shadows 
        camera={{ fov: 75 + avgInsanity * 10, near: 0.1, far: 100 }}
        style={{
          filter: sanityLevel < 30 
            ? `saturate(${0.5 + sanityLevel / 60}) contrast(${1 + avgInsanity * 0.3})` 
            : 'none'
        }}
      >
        {/* Atmosphere */}
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, fogNear, fogFar]} /> 
        
        <Sky sunPosition={[0, -1, 0]} turbidity={10} rayleigh={0.5 + avgInsanity} mieCoefficient={0.005} mieDirectionalG={0.8} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1 + avgInsanity * 2} />

        {/* Lighting - brighter base for visibility */}
        <ambientLight intensity={0.25} color="#2a2a3a" />
        <hemisphereLight intensity={0.3} color="#c0c8d0" groundColor="#1a1a2a" />
        
        {/* Main directional light for shadows */}
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={0.4 * (0.5 + sanityLevel / 200)} 
          castShadow 
          color="#c0c8d0"
        />
        
        {/* Color-shifted lights at low sanity */}
        {sanityLevel < 50 && (
          <>
            <pointLight position={[-5, 3, -5]} intensity={0.2 * avgInsanity} color="#8b0000" distance={15} />
            <pointLight position={[5, 3, 5]} intensity={0.2 * avgInsanity} color="#00008b" distance={15} />
          </>
        )}
        
        {/* Player flashlight effect */}
        <spotLight 
          position={[0, 3, 0]} 
          angle={0.8} 
          penumbra={0.5} 
          intensity={0.6} 
          castShadow 
          color="#ffffee"
          distance={20}
        />

        <Suspense fallback={null}>
          <Maze maze={maze} />
          <Villains maze={maze} />
          <Collectibles maze={maze} />
        </Suspense>

        <Player position={[0, 1, 0]} maze={maze} />
      </Canvas>
    </>
  );
}
