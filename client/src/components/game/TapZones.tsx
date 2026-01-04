import { useMemo } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { MazeGeometry, RailNode, DEFAULT_CONFIG } from '../../game/maze/geometry';
import { useGameStore } from '../../game/store';

interface TapZonesProps {
  geometry: MazeGeometry;
}

interface TapZoneProps {
  node: RailNode;
  direction: string;
  isExit: boolean;
  onTap: () => void;
}

function TapZone({ node, direction, isExit, onTap }: TapZoneProps) {
  const { isMoving, blockades } = useGameStore();
  const isBlocked = blockades.has(node.id);
  
  if (isMoving || isBlocked) return null;
  
  let bgColor = 'rgba(255,255,255,0.2)';
  let borderColor = 'rgba(255,255,255,0.5)';
  let label = 'GO';
  
  if (isExit) {
    bgColor = 'rgba(0,255,0,0.3)';
    borderColor = 'rgba(0,255,0,0.8)';
    label = 'EXIT';
  }
  
  const arrows: Record<string, string> = {
    north: '↑',
    south: '↓',
    east: '→',
    west: '←'
  };
  
  return (
    <group position={[node.worldX, 0.1, node.worldZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={onTap}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color={borderColor} transparent opacity={0.5} />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} onClick={onTap}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color={bgColor.replace('0.3', '0.6')} transparent opacity={0.7} />
      </mesh>
      
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
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.5, 0.6, 32]} />
        <meshBasicMaterial color={borderColor} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function getDirection(fromNode: RailNode, toNode: RailNode): 'north' | 'south' | 'east' | 'west' {
  const dx = toNode.gridX - fromNode.gridX;
  const dy = toNode.gridY - fromNode.gridY;
  
  if (dy < 0) return 'north';
  if (dy > 0) return 'south';
  if (dx > 0) return 'east';
  return 'west';
}

export function TapZones({ geometry }: TapZonesProps) {
  const { currentNode, isMoving, startMoveTo, blockades } = useGameStore();
  
  const availableMoves = useMemo(() => {
    if (!currentNode || isMoving) return [];
    
    const current = geometry.railNodes.get(currentNode);
    if (!current) return [];
    
    const moves: { node: RailNode; direction: string }[] = [];
    
    for (const connId of current.connections) {
      const node = geometry.railNodes.get(connId);
      if (!node) continue;
      if (blockades.has(connId)) continue;
      
      const direction = getDirection(current, node);
      moves.push({ node, direction });
    }
    
    return moves;
  }, [currentNode, isMoving, geometry, blockades]);
  
  const handleTap = (nodeId: string) => {
    startMoveTo(nodeId, 1.0);
  };
  
  if (isMoving) return null;
  
  return (
    <group>
      {availableMoves.map(({ node, direction }) => (
        <TapZone
          key={node.id}
          node={node}
          direction={direction}
          isExit={node.isExit}
          onTap={() => handleTap(node.id)}
        />
      ))}
    </group>
  );
}
