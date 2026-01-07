import type { KeyboardEvent } from 'react';
import { useMemo } from 'react';
import type { MazeGeometry, RailNode } from '../../game/maze/geometry';
import { useGameStore } from '../../game/store';

interface TapZonesProps {
  geometry: MazeGeometry;
}

interface TapZoneProps {
  targetNode: RailNode;
  currentNode: RailNode;
  direction: 'north' | 'south' | 'east' | 'west';
  onTap: () => void;
}

function TapZone({ targetNode, currentNode, direction, onTap }: TapZoneProps) {
  const { isMoving, blockades } = useGameStore();
  const isBlocked = blockades.has(targetNode.id);

  if (isMoving || isBlocked) return null;

  const directionOffsets: Record<string, [number, number]> = {
    north: [0, -2.5],
    south: [0, 2.5],
    east: [2.5, 0],
    west: [-2.5, 0],
  };

  const offset = directionOffsets[direction] || [0, 0];
  const markerX = currentNode.worldX + offset[0];
  const markerZ = currentNode.worldZ + offset[1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTap();
    }
  };

  return (
    // @ts-expect-error - React Three Fiber mesh props don't include DOM role attribute
    <mesh
      position={[markerX, 0.5, markerZ]}
      role="button"
      tabIndex={0}
      onClick={onTap}
      onPointerDown={onTap}
      onKeyDown={handleKeyDown}
    >
      <boxGeometry args={[2.5, 1.5, 2.5]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
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
      return [];
    }

    const moves: {
      targetNode: RailNode;
      currentNode: RailNode;
      direction: 'north' | 'south' | 'east' | 'west';
    }[] = [];

    for (const connId of current.connections) {
      const node = geometry.railNodes.get(connId);
      if (!node) continue;
      if (blockades.has(connId)) continue;

      const direction = getDirection(current, node);
      moves.push({ targetNode: node, currentNode: current, direction });
    }

    const movesForStore = moves.map((m) => ({
      direction: m.direction,
      nodeId: m.targetNode.id,
      isExit: m.targetNode.isExit,
    }));
    setAvailableMoves(movesForStore);

    return moves;
  }, [currentNode, isMoving, geometry, blockades, setAvailableMoves]);

  const handleTap = (nodeId: string) => {
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
          onTap={() => handleTap(targetNode.id)}
        />
      ))}
    </group>
  );
}
