import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Billboard, Text } from '@react-three/drei';
import { Group, MathUtils } from 'three';
import { MazeGenerator } from '../../game/MazeGenerator';
import { useGameStore } from '../../game/store';
import ticketUrl from '@assets/generated_images/paper_mache_circus_ticket_item.png';
import keyUrl from '@assets/generated_images/paper_mache_key_item.png';

interface CollectiblesProps {
  maze: MazeGenerator;
}

const ITEM_TEXTURES = [ticketUrl, keyUrl];
const ITEM_NAMES = ['CIRCUS TICKET', 'MYSTERY KEY'];

interface CollectibleItem {
  id: string;
  x: number;
  z: number;
  textureIndex: number;
}

function Collectible({ item, onCollect }: { item: CollectibleItem, onCollect: (id: string) => void }) {
  const texture = useTexture(ITEM_TEXTURES[item.textureIndex]);
  const groupRef = useRef<Group>(null);
  const [collected, setCollected] = useState(false);
  const [scale, setScale] = useState(0.8);
  const [collectAnimation, setCollectAnimation] = useState(0);
  const { camera } = useThree();
  const { blockades } = useGameStore();
  
  const hasBlockades = blockades.size > 0;
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    if (collected) {
      // Collection animation
      setCollectAnimation(prev => prev + 0.1);
      setScale(MathUtils.lerp(scale, 0, 0.2));
      groupRef.current.position.y += 0.1;
      groupRef.current.rotation.y += 0.3;
      return;
    }
    
    const dist = groupRef.current.position.distanceTo(camera.position);
    
    // Collection range
    if (dist < 1.5) {
      setCollected(true);
      onCollect(item.id);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50, 30, 100]);
      }
    }
    
    // Floating/bobbing animation
    groupRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 2 + item.x) * 0.15;
    
    // Gentle rotation
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    
    // Pulsing glow - more intense if there are blockades
    const pulseIntensity = hasBlockades ? 0.2 : 0.1;
    const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 3) * pulseIntensity;
    setScale(pulse);
  });
  
  // Remove after collection animation
  if (collected && collectAnimation > 2) return null;
  
  return (
    <group ref={groupRef} position={[item.x * 2, 0.8, item.z * 2]}>
      <Billboard>
        <group scale={[scale, scale, scale]}>
          <mesh>
            <planeGeometry args={[0.7, 0.9]} />
            <meshStandardMaterial 
              map={texture} 
              transparent 
              alphaTest={0.5}
              emissive={hasBlockades ? "#ffcc00" : "#ffaa00"}
              emissiveIntensity={hasBlockades ? 0.5 : 0.3}
            />
          </mesh>
          
          {/* Glow ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <ringGeometry args={[0.35, 0.45, 16]} />
            <meshBasicMaterial color="#ffcc00" transparent opacity={hasBlockades ? 0.5 : 0.3} />
          </mesh>
        </group>
      </Billboard>
      
      {/* Item name floating above */}
      <Text
        position={[0, 0.9, 0]}
        fontSize={0.15}
        color="#ffcc00"
        anchorX="center"
      >
        {ITEM_NAMES[item.textureIndex]}
      </Text>
      
      {/* Hint when blockades exist */}
      {hasBlockades && (
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
        >
          Clears a path
        </Text>
      )}
    </group>
  );
}

export function Collectibles({ maze }: CollectiblesProps) {
  const { collectItem, collectedItems, removeBlockade, blockades } = useGameStore();
  
  // Generate items at random locations
  const items = useMemo(() => {
    const generated: CollectibleItem[] = [];
    const itemCount = Math.floor((maze.width * maze.height) / 10); // More items
    
    for (let i = 0; i < itemCount; i++) {
      let x: number, z: number;
      let attempts = 0;
      
      do {
        x = Math.floor(Math.random() * maze.width);
        z = Math.floor(Math.random() * maze.height);
        attempts++;
      } while ((x === 0 && z === 0 || generated.some(it => it.x === x && it.z === z)) && attempts < 50);
      
      if (attempts < 50) {
        generated.push({
          id: `item-${x}-${z}`,
          x,
          z,
          textureIndex: Math.floor(Math.random() * ITEM_TEXTURES.length)
        });
      }
    }
    
    return generated;
  }, [maze]);
  
  const handleCollect = (id: string) => {
    collectItem(id);
    
    // Remove a random blockade if any exist
    const blockadeArray = Array.from(blockades);
    if (blockadeArray.length > 0) {
      const randomBlockade = blockadeArray[Math.floor(Math.random() * blockadeArray.length)];
      removeBlockade(randomBlockade);
      
      // Feedback that a path was cleared
      console.log('Path cleared at:', randomBlockade);
    }
  };
  
  return (
    <group>
      {items
        .filter(item => !collectedItems.has(item.id))
        .map(item => (
          <Collectible 
            key={item.id} 
            item={item} 
            onCollect={handleCollect}
          />
        ))
      }
    </group>
  );
}
