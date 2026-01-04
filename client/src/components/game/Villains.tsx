import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Text, Billboard } from '@react-three/drei';
import { Vector3, Group, MathUtils } from 'three';
import { MazeGenerator } from '../../game/MazeGenerator';
import beppoUrl from '@assets/generated_images/paper_mache_beppo_sad_clown_cutout.png';
import barkerUrl from '@assets/generated_images/manic_boardwalk_barker_cutout.png';
import operaClownUrl from '@assets/generated_images/vintage_opera_clown_cutout.png';
import freakShowBeppoUrl from '@assets/generated_images/vintage_coney_island_freak_show_beppo_cutout.png';

interface VillainsProps {
  maze: MazeGenerator;
}

const VILLAIN_TEXTURES = [
  beppoUrl,
  barkerUrl,
  operaClownUrl,
  freakShowBeppoUrl
];

const LAUGHS = [
  "HA HA HA",
  "HEE HEE",
  "HO HO HO",
  "YOU ARE LOST",
  "BEPPO SEES YOU",
  "LAUGH WITH ME",
  "FOREVER",
  "HONK HONK"
];

function Villain({ position, textureUrl, playerPos }: { position: [number, number, number], textureUrl: string, playerPos: Vector3 }) {
  const texture = useTexture(textureUrl);
  const groupRef = useRef<Group>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasPopped, setHasPopped] = useState(false);
  const [scale, setScale] = useState(0);
  
  // Random "laugh" text
  const laughText = useMemo(() => LAUGHS[Math.floor(Math.random() * LAUGHS.length)], []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const dist = groupRef.current.position.distanceTo(playerPos);
    
    // Pop up logic
    if (dist < 8 && !hasPopped) {
      setHasPopped(true);
      setIsVisible(true);
      // Play sound here if we had audio
    }

    // Animation
    if (isVisible) {
      // Springy pop up
      const targetScale = 1.5 + Math.sin(state.clock.elapsedTime * 10) * 0.1; // Pulsing size
      setScale(MathUtils.lerp(scale, targetScale, 0.1));
      
      // Jitter/Shake effect for "Monty Python" feel
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 20) * 0.05;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 15) * 0.1;
    } else {
        setScale(0);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <group scale={[scale, scale, scale]}>
            <mesh castShadow receiveShadow>
              <planeGeometry args={[2, 3]} /> {/* Tall aspect ratio for cutouts */}
              <meshStandardMaterial 
                map={texture} 
                transparent 
                alphaTest={0.5} 
                roughness={0.8}
                emissive="#1a1a1a"
                emissiveIntensity={0.2}
              />
            </mesh>
            
            {/* Floating Laugh Text */}
            <Text
                position={[0.8, 1.8, 0.1]}
                fontSize={0.4}
                color="#8b0000"
                font="/fonts/Nosifer-Regular.ttf" // Fallback font handling needed or use generic
                anchorX="center"
                anchorY="middle"
            >
                {laughText}
            </Text>
        </group>
      </Billboard>
    </group>
  );
}

export function Villains({ maze }: VillainsProps) {
  const { camera } = useThree();
  
  // Spawn villains in random empty spots
  const villains = useMemo(() => {
    const spawned: { x: number, y: number, texture: string }[] = [];
    const count = Math.floor((maze.width * maze.height) / 10); // Density

    for (let i = 0; i < count; i++) {
      let x, y;
      let attempts = 0;
      do {
        x = Math.floor(Math.random() * maze.width);
        y = Math.floor(Math.random() * maze.height);
        attempts++;
      } while ((x === 0 && y === 0 || spawned.some(v => v.x === x && v.y === y)) && attempts < 50);

      if (attempts < 50) {
        spawned.push({
          x,
          y,
          texture: VILLAIN_TEXTURES[Math.floor(Math.random() * VILLAIN_TEXTURES.length)]
        });
      }
    }
    return spawned;
  }, [maze]);

  return (
    <group>
      {villains.map((v, i) => (
        <Villain 
            key={i} 
            position={[v.x * 2, 1.5, v.y * 2]} // *2 for cell size, 1.5 for half-height
            textureUrl={v.texture}
            playerPos={camera.position}
        />
      ))}
    </group>
  );
}
