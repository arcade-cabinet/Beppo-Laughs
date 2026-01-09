import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import type { MazeGeometry, RailNode } from '../../game/maze/geometry';
import { useGameStore } from '../../game/store';

interface RailPlayerProps {
  geometry: MazeGeometry;
  autoSpeed?: number; // Configurable auto-movement speed (default: 3.0)
}

// Helper function to smooth camera rotation toward target angle
function smoothRotateToward(
  currentRotation: number,
  targetRotation: number,
  delta: number,
  speed: number = 5,
): number {
  let diff = targetRotation - currentRotation;
  // Normalize to [-π, π]
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return currentRotation + diff * delta * speed;
}

export function RailPlayer({ geometry, autoSpeed = 3.0 }: RailPlayerProps) {
  // Validate autoSpeed to ensure it's positive
  const validatedSpeed = autoSpeed > 0 ? autoSpeed : 3.0;

  const { camera } = useThree();

  const initialized = useRef(false);
  const currentNodeRef = useRef<RailNode | null>(null);
  const targetNodeRef = useRef<RailNode | null>(null);
  const edgeProgress = useRef(0);

  const CAMERA_HEIGHT = 1.0; // Sitting down height

  const checkForFork = useCallback(
    (node: RailNode) => {
      const gameState = useGameStore.getState();
      const moves: {
        direction: 'north' | 'south' | 'east' | 'west';
        nodeId: string;
        isExit: boolean;
      }[] = [];

      for (const connId of node.connections) {
        const connNode = geometry.railNodes.get(connId);
        if (!connNode) continue;

        const dx = connNode.gridX - node.gridX;
        const dy = connNode.gridY - node.gridY;
        let direction: 'north' | 'south' | 'east' | 'west' = 'north';
        if (dy < 0) direction = 'north';
        else if (dy > 0) direction = 'south';
        else if (dx > 0) direction = 'east';
        else direction = 'west';

        moves.push({ direction, nodeId: connNode.id, isExit: connNode.isExit });
      }

      gameState.setAvailableMoves(moves);

      if (node.isExit) {
        gameState.setPendingFork(null);
        targetNodeRef.current = null;
        return;
      }

      if (moves.length > 1) {
        // Fork detected - pause for choice but MAINTAIN current speed
        gameState.setPendingFork({ nodeId: node.id, options: moves });
        // Don't zero speed - it will resume at current speed after selection
      } else if (moves.length === 1) {
        gameState.setPendingFork(null);
        targetNodeRef.current = geometry.railNodes.get(moves[0].nodeId) || null;
      } else {
        gameState.setPendingFork(null);
        targetNodeRef.current = null;
      }
    },
    [geometry],
  );

  useEffect(() => {
    if (initialized.current) return;

    const centerNode = geometry.railNodes.get(geometry.centerNodeId);
    if (centerNode) {
      useGameStore.getState().setCurrentNode(geometry.centerNodeId);
      camera.position.set(centerNode.worldX, CAMERA_HEIGHT, centerNode.worldZ);
      currentNodeRef.current = centerNode;
      targetNodeRef.current = null;
      edgeProgress.current = 0;

      // Camera faces the direction of first connection
      // Player always looks "forward" in direction of travel
      const firstConn = centerNode.connections[0];
      const firstNode = geometry.railNodes.get(firstConn);
      if (firstNode) {
        // Calculate lookDir: Math.atan2(-dx, -dz)
        // dx = to.x - from.x, dz = to.z - from.z
        const dx = firstNode.worldX - centerNode.worldX;
        const dz = firstNode.worldZ - centerNode.worldZ;
        const lookDir = Math.atan2(-dx, -dz);

        camera.rotation.y = lookDir;
        useGameStore.getState().setCameraRotation(lookDir);
      }

      checkForFork(centerNode);
      initialized.current = true;
    }
  }, [geometry, camera, checkForFork]);

  const getDirectionAngle = (from: RailNode, to: RailNode): number => {
    const dx = to.worldX - from.worldX;
    const dz = to.worldZ - from.worldZ;
    return Math.atan2(-dx, -dz);
  };

  useFrame((_state, delta) => {
    const gameState = useGameStore.getState();
    const { isGameOver, hasWon, pendingFork, targetNode, nearbyExit } = gameState;

    if (isGameOver || hasWon) return;
    if (!currentNodeRef.current) return;

    // Stop at forks and exits - player must make choice
    if (pendingFork || nearbyExit) {
      camera.position.y = CAMERA_HEIGHT;
      return;
    }

    // Set target if direction was chosen
    if (targetNode && !targetNodeRef.current) {
      const newTarget = geometry.railNodes.get(targetNode);
      if (newTarget) {
        targetNodeRef.current = newTarget;
        edgeProgress.current = 0;

        // Rotate camera to face new direction of travel
        const targetRotation = getDirectionAngle(currentNodeRef.current, newTarget);
        camera.rotation.y = smoothRotateToward(camera.rotation.y, targetRotation, delta);
        gameState.setCameraRotation(camera.rotation.y);
      }
    }

    // Automatic constant-speed movement when target is set
    // autoSpeed is now configurable via props (default: 3.0)

    // Update position if moving toward target
    if (targetNodeRef.current && currentNodeRef.current) {
      const fromNode = currentNodeRef.current;
      const toNode = targetNodeRef.current;

      const dx = toNode.worldX - fromNode.worldX;
      const dz = toNode.worldZ - fromNode.worldZ;
      const edgeLength = Math.sqrt(dx * dx + dz * dz);

      const progressDelta = (validatedSpeed * delta) / edgeLength;
      edgeProgress.current += progressDelta;

      if (edgeProgress.current >= 1) {
        // Arrived at node

        // TODO: Refine dead-end stopping distance/offsets; currently we snap exactly to the node.

        camera.position.x = toNode.worldX;
        camera.position.z = toNode.worldZ;

        edgeProgress.current = 0;
        currentNodeRef.current = toNode;
        targetNodeRef.current = null;

        gameState.visitNode(toNode.id);
        gameState.setCurrentNode(toNode.id);
        gameState.setTargetNode(null);

        if (toNode.isExit) {
          gameState.setNearbyExit({ nodeId: toNode.id });
        } else {
          gameState.setNearbyExit(null);
        }

        // Journal Entry Generation
        if (!gameState.visitedCells.has(toNode.id) || Math.random() < 0.2) {
          const exits = toNode.connections.length;
          const isDeadEnd = exits === 1;
          const description = isDeadEnd
            ? 'Hit a dead end. The canvas walls are closing in.'
            : exits > 2
              ? 'The path splits here. Too many choices...'
              : 'Moving deeper into the maze.';

          gameState.addJournalEntry(description);

          // Chance to corrupt if insane
          const insanity = gameState.getSanityLevel(); // 100 is sane, 0 insane
          if (insanity < 50 && Math.random() < 0.3) {
            gameState.corruptJournal();
          }
        }

        checkForFork(toNode);
      } else {
        // Interpolate along path - LINEAR for smooth rail feel
        const t = edgeProgress.current;
        camera.position.x = fromNode.worldX + dx * t;
        camera.position.z = fromNode.worldZ + dz * t;
      }

      // Smooth rotation to face direction of travel (like steering a car)
      if (targetNodeRef.current && currentNodeRef.current) {
        const targetRotation = getDirectionAngle(currentNodeRef.current, targetNodeRef.current);
        camera.rotation.y = smoothRotateToward(camera.rotation.y, targetRotation, delta);
        gameState.setCameraRotation(camera.rotation.y);
      }

      // NO HEAD BOB - Smooth rail glide at "sitting in car" height
      camera.position.y = CAMERA_HEIGHT;
    } else {
      camera.position.y = CAMERA_HEIGHT;
    }

    // Reset tilts - ensure camera is level
    camera.rotation.x = 0;
    camera.rotation.z = 0;
  });

  // RailPlayer only manages camera movement - no visual elements
  return null;
}
