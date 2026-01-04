import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Billboard, Text } from '@react-three/drei';
import { Group, MathUtils } from 'three';
import { MazeGeometry, DEFAULT_CONFIG } from '../../game/maze/geometry';
import { useGameStore } from '../../game/store';
import ticketUrl from '@assets/generated_images/paper_mache_circus_ticket_item.png';
import keyUrl from '@assets/generated_images/paper_mache_key_item.png';

interface CollectiblesProps {
  geometry: MazeGeometry;
}

const ITEM_TEXTURES = [ticketUrl, keyUrl];
const ITEM_NAMES = ['CIRCUS TICKET', 'MYSTERY KEY'];

interface CollectibleItem {
  id: string;
  worldX: number;
  worldZ: number;
  nodeId: string;
  textureIndex: number;
}

function Collectible({ item, onCollect }: { item: CollectibleItem, onCollect: (id: string) => void }) {
  const texture = useTexture(ITEM_TEXTURES[item.textureIndex]);
  const groupRef = useRef<Group>(null);
  const [collected, setCollected] = useState(false);
  const scaleRef = useRef(0.8);
  const collectAnimRef = useRef(0);
  const { blockades, currentNode } = useGameStore();
  
  const hasBlockades = blockades.size > 0;
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    if (collected) {
      collectAnimRef.current += 0.1;
      scaleRef.current = MathUtils.lerp(scaleRef.current, 0, 0.2);
      groupRef.current.position.y += 0.1;
      groupRef.current.rotation.y += 0.3;
      groupRef.current.scale.setScalar(scaleRef.current);
      return;
    }
    
    if (currentNode === item.nodeId) {
      setCollected(true);
      onCollect(item.id);
      
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50, 30, 100]);
      }
    }
    
    groupRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 2 + item.worldX) * 0.15;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    
    const pulseIntensity = hasBlockades ? 0.2 : 0.1;
    const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 3) * pulseIntensity;
    groupRef.current.scale.setScalar(pulse);
  });
  
  if (collected && collectAnimRef.current > 2) return null;
  
  return (
    <group ref={groupRef} position={[item.worldX, 0.8, item.worldZ]}>
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
          
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <ringGeometry args={[0.35, 0.45, 16]} />
            <meshBasicMaterial color="#ffcc00" transparent opacity={hasBlockades ? 0.5 : 0.3} />
          </mesh>
        </group>
      </Billboard>
      
      <Text
        position={[0, 0.9, 0]}
        fontSize={0.15}
        color="#ffcc00"
        anchorX="center"
      >
        {ITEM_NAMES[item.textureIndex]}
      </Text>
      
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

export function Collectibles({ geometry }: CollectiblesProps) {
  const { collectItem, collectedItems, removeBlockade, blockades } = useGameStore();
  
  const items = useMemo(() => {
    const generated: CollectibleItem[] = [];
    const nodes = Array.from(geometry.railNodes.values());
    const itemCount = Math.floor(nodes.length / 8);
    
    const avoidNodes = new Set([
      geometry.centerNodeId,
      ...geometry.exitNodeIds
    ]);
    
    for (let i = 0; i < itemCount; i++) {
      let selectedNode: typeof nodes[0] | null = null;
      let attempts = 0;
      
      do {
        const idx = Math.floor(Math.random() * nodes.length);
        selectedNode = nodes[idx];
        attempts++;
      } while (selectedNode && (avoidNodes.has(selectedNode.id) || generated.some(it => it.nodeId === selectedNode!.id)) && attempts < 50);
      
      if (attempts < 50 && selectedNode) {
        generated.push({
          id: `item-${selectedNode.id}`,
          worldX: selectedNode.worldX,
          worldZ: selectedNode.worldZ,
          nodeId: selectedNode.id,
          textureIndex: Math.floor(Math.random() * ITEM_TEXTURES.length)
        });
      }
    }
    
    return generated;
  }, [geometry]);
  
  const handleCollect = (id: string) => {
    collectItem(id);
    
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
