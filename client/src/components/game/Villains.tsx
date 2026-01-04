import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Text, Billboard } from '@react-three/drei';
import { Vector3, Group, MathUtils } from 'three';
import { MazeGenerator } from '../../game/MazeGenerator';
import { useGameStore } from '../../game/store';
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
  "YOU CANNOT LEAVE",
  "BEPPO SEES YOU",
  "JOIN THE CIRCUS",
  "FOREVER LOST",
  "HONK HONK",
  "TURN BACK",
  "NO ESCAPE"
];

function Villain({ 
  position, 
  textureUrl, 
  playerPos,
  isBlockade,
  cellKey 
}: { 
  position: [number, number, number], 
  textureUrl: string, 
  playerPos: Vector3,
  isBlockade: boolean,
  cellKey: string
}) {
  const texture = useTexture(textureUrl);
  const groupRef = useRef<Group>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasPopped, setHasPopped] = useState(false);
  const [scale, setScale] = useState(0);
  const { increaseFear, addBlockade, blockades } = useGameStore();
  
  const laughText = useMemo(() => LAUGHS[Math.floor(Math.random() * LAUGHS.length)], []);
  
  // Check if this blockade has been cleared (was added but now removed)
  const isBlocked = blockades.has(cellKey);
  const wasCleared = hasPopped && isBlockade && !isBlocked;

  useFrame((state) => {
    if (!groupRef.current) return;

    const dist = groupRef.current.position.distanceTo(playerPos);
    
    // Pop up logic - triggers when player gets close
    if (dist < 5 && !hasPopped) {
      setHasPopped(true);
      setIsVisible(true);
      increaseFear(15);
      
      // Create blockade if this is a blocking villain
      if (isBlockade) {
        addBlockade(cellKey);
      }
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 200]);
      }
    }

    // Animation
    if (isVisible && !wasCleared) {
      const targetScale = 1.8 + Math.sin(state.clock.elapsedTime * 8) * 0.15;
      setScale(MathUtils.lerp(scale, targetScale, 0.1));
      
      // Monty Python jitter
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 25) * 0.08;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 18) * 0.15;
      
      // Random jump
      if (Math.random() > 0.995) {
        groupRef.current.position.y += 0.3;
      }
    } else if (wasCleared) {
      // Fade out and collapse when cleared
      setScale(MathUtils.lerp(scale, 0, 0.15));
      if (groupRef.current) {
        groupRef.current.rotation.z += 0.1; // Spin away
      }
    } else {
      setScale(MathUtils.lerp(scale, 0, 0.1));
    }
  });

  // Don't render if fully cleared and scaled down
  if (wasCleared && scale < 0.05) return null;

  return (
    <group ref={groupRef} position={position}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <group scale={[scale, scale, scale]}>
          <mesh castShadow receiveShadow>
            <planeGeometry args={[2.5, 3.5]} />
            <meshStandardMaterial 
              map={texture} 
              transparent 
              alphaTest={0.5} 
              roughness={0.8}
              emissive={isBlocked ? "#ff0000" : "#1a1a1a"}
              emissiveIntensity={isBlocked ? 0.5 : 0.2}
            />
          </mesh>
          
          {/* Floating Laugh Text */}
          <Text
            position={[0.9 + Math.random() * 0.3, 2.0, 0.1]}
            fontSize={0.5}
            color={isBlocked ? "#ff0000" : "#8b0000"}
            anchorX="center"
            anchorY="middle"
          >
            {laughText}
          </Text>
          
          {/* Blockade indicator */}
          {isBlocked && (
            <>
              <Text
                position={[0, -2.0, 0.1]}
                fontSize={0.25}
                color="#ffcc00"
                anchorX="center"
              >
                PATH BLOCKED
              </Text>
              <Text
                position={[0, -2.4, 0.1]}
                fontSize={0.18}
                color="#ffffff"
                anchorX="center"
              >
                Find a circus item to pass
              </Text>
            </>
          )}
        </group>
      </Billboard>
      
      {/* Visual blockade barrier */}
      {isBlocked && (
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[2, 2, 0.1]} />
          <meshStandardMaterial 
            color="#8b0000" 
            transparent 
            opacity={0.3}
            emissive="#ff0000"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}

export function Villains({ maze }: VillainsProps) {
  const { camera } = useThree();
  
  const villains = useMemo(() => {
    const spawned: { x: number, y: number, texture: string, isBlockade: boolean, cellKey: string }[] = [];
    const count = Math.floor((maze.width * maze.height) / 6);

    for (let i = 0; i < count; i++) {
      let x: number, y: number;
      let attempts = 0;
      do {
        x = Math.floor(Math.random() * maze.width);
        y = Math.floor(Math.random() * maze.height);
        attempts++;
      } while ((x === 0 && y === 0 || spawned.some(v => v.x === x && v.y === y)) && attempts < 50);

      if (attempts < 50) {
        // 50% chance to be a blocking villain
        const isBlockade = Math.random() > 0.5;
        
        spawned.push({
          x,
          y,
          texture: VILLAIN_TEXTURES[Math.floor(Math.random() * VILLAIN_TEXTURES.length)],
          isBlockade,
          cellKey: `${x},${y}`
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
          position={[v.x * 2, 1.5, v.y * 2]}
          textureUrl={v.texture}
          playerPos={camera.position}
          isBlockade={v.isBlockade}
          cellKey={v.cellKey}
        />
      ))}
    </group>
  );
}
