import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, Billboard, Text } from '@react-three/drei';
import { Vector3 } from 'three';
import { MazeGenerator, RailNode } from '../../game/MazeGenerator';
import { useGameStore } from '../../game/store';

interface TapZonesProps {
  maze: MazeGenerator;
}

interface TapZoneProps {
  node: RailNode;
  direction: string;
  isExit: boolean;
  hasCollectible: boolean;
  hasVillain: boolean;
  onTap: () => void;
}

function TapZone({ node, direction, isExit, hasCollectible, hasVillain, onTap }: TapZoneProps) {
  const { isMoving, blockades } = useGameStore();
  const isBlocked = blockades.has(node.id);
  
  if (isMoving || isBlocked) return null;
  
  // Determine zone styling based on content
  let bgColor = 'rgba(255,255,255,0.2)';
  let borderColor = 'rgba(255,255,255,0.5)';
  let label = 'GO';
  
  if (isExit) {
    bgColor = 'rgba(0,255,0,0.3)';
    borderColor = 'rgba(0,255,0,0.8)';
    label = 'EXIT';
  } else if (hasCollectible) {
    bgColor = 'rgba(255,215,0,0.3)';
    borderColor = 'rgba(255,215,0,0.8)';
    label = 'ITEM';
  } else if (hasVillain) {
    bgColor = 'rgba(139,0,0,0.3)';
    borderColor = 'rgba(139,0,0,0.8)';
    label = '???';
  }
  
  // Direction arrow
  const arrows: Record<string, string> = {
    north: '↑',
    south: '↓',
    east: '→',
    west: '←'
  };
  
  return (
    <group position={[node.worldX, 0.1, node.worldZ]}>
      {/* Ground marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={onTap}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color={borderColor} transparent opacity={0.5} />
      </mesh>
      
      {/* Inner circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} onClick={onTap}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color={bgColor.replace('0.3', '0.6')} transparent opacity={0.7} />
      </mesh>
      
      {/* Floating label */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.3}
          color={borderColor.replace('0.8)', '1)')}
          anchorX="center"
          anchorY="middle"
          onClick={onTap}
        >
          {arrows[direction] || ''} {label}
        </Text>
      </Billboard>
      
      {/* Pulsing ring effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.5, 0.6, 32]} />
        <meshBasicMaterial color={borderColor} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export function TapZones({ maze }: TapZonesProps) {
  const { currentNode, isMoving, startMoveTo, blockades } = useGameStore();
  
  // Get available moves from current position
  const availableMoves = useMemo(() => {
    if (!currentNode || isMoving) return [];
    
    const current = maze.railGraph.nodes.get(currentNode);
    if (!current) return [];
    
    const moves: { node: RailNode; direction: string }[] = [];
    
    for (const connId of current.connections) {
      const node = maze.railGraph.nodes.get(connId);
      if (!node) continue;
      if (blockades.has(connId)) continue; // Skip blocked nodes
      
      const direction = maze.getDirection(currentNode, connId) || 'north';
      moves.push({ node, direction });
    }
    
    return moves;
  }, [currentNode, isMoving, maze, blockades]);
  
  const handleTap = (nodeId: string, hasCollectible: boolean, hasVillain: boolean) => {
    // Speed varies: faster toward collectibles, slower toward villains
    let speed = 1.0;
    if (hasCollectible) speed = 1.5; // Run toward items
    if (hasVillain) speed = 0.7; // Hesitant toward threats
    startMoveTo(nodeId, speed);
  };
  
  if (isMoving) return null;
  
  return (
    <group>
      {availableMoves.map(({ node, direction }) => (
        <TapZone
          key={node.id}
          node={node}
          direction={direction || 'north'}
          isExit={node.isExit}
          hasCollectible={node.hasCollectible}
          hasVillain={node.hasVillain}
          onTap={() => handleTap(node.id, node.hasCollectible, node.hasVillain)}
        />
      ))}
    </group>
  );
}
