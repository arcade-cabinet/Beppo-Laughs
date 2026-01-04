import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei'; // Removed Fog import
import { Suspense, useState, useEffect } from 'react';
import { Maze } from './Maze';
import { Player } from './Player';
import { MazeGenerator } from '../../game/MazeGenerator';
import { Villains } from './Villains';

interface SceneProps {
  seed: string;
}

export function Scene({ seed }: SceneProps) {
  const [maze, setMaze] = useState<MazeGenerator | null>(null);

  useEffect(() => {
    // Generate maze on mount or seed change
    // 10x10 is small for testing, maybe 15x15 for game
    const newMaze = new MazeGenerator(10, 10, seed);
    setMaze(newMaze);
  }, [seed]);

  if (!maze) return null;

  return (
    <Canvas shadows camera={{ fov: 75, near: 0.1, far: 100 }}>
      {/* Atmosphere */}
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 0, 15]} /> {/* Dense darkness/fog close by */}
      
      <Sky sunPosition={[0, -1, 0]} turbidity={10} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Lighting */}
      <ambientLight intensity={0.05} color="#1a1a1a" />
      <pointLight position={[10, 10, 10]} intensity={0.1} color="#2d4a2b" />
      
      {/* Flashlight attached to camera is handled by default in many horror games, 
          or we can add a SpotLight inside Player pointing forward */}
      <spotLight 
        position={[0, 5, 0]} 
        angle={0.5} 
        penumbra={1} 
        intensity={0.5} 
        castShadow 
        color="#c0c8d0"
      />

      <Suspense fallback={null}>
        <Maze maze={maze} />
        <Villains maze={maze} />
      </Suspense>

      <Player position={[0, 1, 0]} />
    </Canvas>
  );
}
