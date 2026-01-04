import { useMemo, useRef, useState, useEffect } from 'react';
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
  nodeId: string;
  textureIndex: number;
}

function Collectible({ item, onCollect }: { item: CollectibleItem, onCollect: (id: string) => void }) {
  const texture = useTexture(ITEM_TEXTURES[item.textureIndex]);
  const groupRef = useRef<Group>(null);
  const [collected, setCollected] = useState(false);
  const scaleRef = useRef(0.8);
  const collectAnimRef = useRef(0);
  const { camera } = useThree();
  const { blockades, currentNode } = useGameStore();
  
  const hasBlockades = blockades.size > 0;
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    if (collected) {
      // Collection animation
      collectAnimRef.current += 0.1;
      scaleRef.current = MathUtils.lerp(scaleRef.current, 0, 0.2);
      groupRef.current.position.y += 0.1;
      groupRef.current.rotation.y += 0.3;
      groupRef.current.scale.setScalar(scaleRef.current);
      return;
    }
    
    // Check if player is at this node
    if (currentNode === item.nodeId) {
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
    groupRef.current.scale.setScalar(pulse);
  });
  
  // Remove after collection animation
  if (collected && collectAnimRef.current > 2) return null;
  
  return (
    <group ref={groupRef} position={[item.x * 2, 0.8, item.z * 2]}>
      <Billboard>
        <group>
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
  
  // Generate items at random locations and mark rail nodes
  const items = useMemo(() => {
    const generated: CollectibleItem[] = [];
    const itemCount = Math.floor((maze.width * maze.height) / 8); // More items
    
    // Avoid center and exits
    const avoidNodes = new Set([
      maze.railGraph.centerNode,
      ...maze.railGraph.exitNodes
    ]);
    
    for (let i = 0; i < itemCount; i++) {
      let x: number, z: number;
      let nodeId: string;
      let attempts = 0;
      
      do {
        x = Math.floor(Math.random() * maze.width);
        z = Math.floor(Math.random() * maze.height);
        nodeId = `${x},${z}`;
        attempts++;
      } while ((avoidNodes.has(nodeId) || generated.some(it => it.nodeId === nodeId)) && attempts < 50);
      
      if (attempts < 50) {
        generated.push({
          id: `item-${x}-${z}`,
          x,
          z,
          nodeId,
          textureIndex: Math.floor(Math.random() * ITEM_TEXTURES.length)
        });
        
        // Mark node as having collectible
        const node = maze.railGraph.nodes.get(nodeId);
        if (node) {
          node.hasCollectible = true;
        }
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
