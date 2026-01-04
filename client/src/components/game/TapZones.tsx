import { useMemo, useRef } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { MazeGeometry, RailNode, DEFAULT_CONFIG } from '../../game/maze/geometry';
import { useGameStore } from '../../game/store';
import { Mesh, Vector3 } from 'three';

interface TapZonesProps {
  geometry: MazeGeometry;
}

interface TapZoneProps {
  targetNode: RailNode;
  currentNode: RailNode;
  direction: 'north' | 'south' | 'east' | 'west';
  isExit: boolean;
  onTap: () => void;
}

function TapZone({ targetNode, currentNode, direction, isExit, onTap }: TapZoneProps) {
  const { isMoving, blockades } = useGameStore();
  const isBlocked = blockades.has(targetNode.id);
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (glowRef.current) {
      const glow = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      (glowRef.current.material as any).opacity = glow * 0.4;
    }
  });
  
  if (isMoving || isBlocked) return null;
  
  const directionOffsets: Record<string, [number, number]> = {
    north: [0, -2],
    south: [0, 2],
    east: [2, 0],
    west: [-2, 0],
  };
  
  const offset = directionOffsets[direction] || [0, 0];
  const markerX = currentNode.worldX + offset[0];
  const markerZ = currentNode.worldZ + offset[1];
  const markerY = 0.8;
  
  const arrows: Record<string, string> = {
    north: '↑',
    south: '↓',
    east: '→',
    west: '←'
  };
  
  const baseColor = isExit ? '#00ff00' : '#ffcc00';
  const glowColor = isExit ? '#00ff44' : '#ffdd44';
  const label = isExit ? 'EXIT' : 'GO';
  
  return (
    <group position={[markerX, markerY, markerZ]}>
      <mesh 
        ref={glowRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.3, 0]}
      >
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.3} />
      </mesh>
      
      <mesh 
        ref={meshRef}
        onClick={onTap}
        onPointerDown={onTap}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color={baseColor} 
          emissive={baseColor}
          emissiveIntensity={0.5}
          transparent 
          opacity={0.9} 
        />
      </mesh>
      
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.6}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          onClick={onTap}
          onPointerDown={onTap}
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {arrows[direction]}
        </Text>
      </Billboard>
      
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, -0.7, 0]}
          fontSize={0.25}
          color={isExit ? '#00ff00' : '#ffffff'}
          anchorX="center"
          anchorY="middle"
          onClick={onTap}
          onPointerDown={onTap}
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </Billboard>
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
  const { currentNode, isMoving, startMoveTo, blockades, setAvailableMoves } = useGameStore();
  
  const availableMoves = useMemo(() => {
    if (!currentNode || isMoving) return [];
    
    const current = geometry.railNodes.get(currentNode);
    if (!current) {
      console.log('TapZones: No current node found for:', currentNode);
      return [];
    }
    
    const moves: { targetNode: RailNode; currentNode: RailNode; direction: 'north' | 'south' | 'east' | 'west' }[] = [];
    
    console.log('TapZones: Current node', currentNode, 'has connections:', current.connections);
    
    for (const connId of current.connections) {
      const node = geometry.railNodes.get(connId);
      if (!node) continue;
      if (blockades.has(connId)) continue;
      
      const direction = getDirection(current, node);
      moves.push({ targetNode: node, currentNode: current, direction });
    }
    
    console.log('TapZones: Available moves:', moves.length);
    
    const movesForStore = moves.map(m => ({
      direction: m.direction,
      nodeId: m.targetNode.id,
      isExit: m.targetNode.isExit
    }));
    setAvailableMoves(movesForStore);
    
    return moves;
  }, [currentNode, isMoving, geometry, blockades, setAvailableMoves]);
  
  const handleTap = (nodeId: string) => {
    console.log('TapZones: Tapped to move to', nodeId);
    startMoveTo(nodeId, 1.0);
  };
  
  if (isMoving) return null;
  
  return (
    <group>
      {availableMoves.map(({ targetNode, currentNode, direction }) => (
        <TapZone
          key={targetNode.id}
          targetNode={targetNode}
          currentNode={currentNode}
          direction={direction}
          isExit={targetNode.isExit}
          onTap={() => handleTap(targetNode.id)}
        />
      ))}
    </group>
  );
}
