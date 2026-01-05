import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MathUtils } from 'three';
import type { MazeGeometry, RailNode } from '../../game/maze/geometry';
import { useGameStore } from '../../game/store';
import { ClownCarCockpit } from './ClownCarCockpit';

interface RailPlayerProps {
  geometry: MazeGeometry;
}

export function RailPlayer({ geometry }: RailPlayerProps) {
  const { camera } = useThree();

  const initialized = useRef(false);
  const currentNodeRef = useRef<RailNode | null>(null);
  const targetNodeRef = useRef<RailNode | null>(null);
  const edgeProgress = useRef(0);

  useEffect(() => {
    if (initialized.current) return;

    const centerNode = geometry.railNodes.get(geometry.centerNodeId);
    if (centerNode) {
      useGameStore.getState().setCurrentNode(geometry.centerNodeId);
      camera.position.set(centerNode.worldX, 1.4, centerNode.worldZ);
      currentNodeRef.current = centerNode;
      targetNodeRef.current = null;
      edgeProgress.current = 0;

      const firstConn = centerNode.connections[0];
      const firstNode = geometry.railNodes.get(firstConn);
      if (firstNode) {
        const lookDir = Math.atan2(
          firstNode.worldX - centerNode.worldX,
          -(firstNode.worldZ - centerNode.worldZ),
        );
        camera.rotation.y = lookDir;
        useGameStore.getState().setCameraRotation(lookDir);
      }

      checkForFork(centerNode);
      initialized.current = true;
    }
  }, [geometry, camera, checkForFork]);

  const checkForFork = (node: RailNode) => {
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
      gameState.setCarSpeed(0);
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
  };

  const getDirectionAngle = (from: RailNode, to: RailNode): number => {
    return Math.atan2(to.worldX - from.worldX, -(to.worldZ - from.worldZ));
  };

  useFrame((state, delta) => {
    const gameState = useGameStore.getState();
    const {
      carSpeed,
      accelerating,
      braking,
      isGameOver,
      hasWon,
      pendingFork,
      targetNode,
      nearbyExit,
    } = gameState;

    if (isGameOver || hasWon) return;
    if (!currentNodeRef.current) return;

    if (pendingFork) {
      camera.position.y = MathUtils.lerp(camera.position.y, 1.4, 0.1);
      return;
    }

    if (nearbyExit) {
      camera.position.y = MathUtils.lerp(camera.position.y, 1.4, 0.1);
      return;
    }

    if (targetNode && !targetNodeRef.current) {
      const newTarget = geometry.railNodes.get(targetNode);
      if (newTarget) {
        targetNodeRef.current = newTarget;
        edgeProgress.current = 0;

        const targetRotation = getDirectionAngle(currentNodeRef.current, newTarget);
        camera.rotation.y = MathUtils.lerp(camera.rotation.y, targetRotation, 0.3);
        gameState.setCameraRotation(camera.rotation.y);
      }
    }

    // Speed increments/decrements and HOLDS - no decay
    // Gas: increment speed while held (up to max 5)
    // Brake: decrement speed while held (down to 0)
    // Neither: speed stays constant (cruise control style)
    let newSpeed = carSpeed;
    if (accelerating) {
      newSpeed = Math.min(5, carSpeed + delta * 2);
    } else if (braking) {
      newSpeed = Math.max(0, carSpeed - delta * 3);
    }
    // No decay when neither pressed - speed holds
    if (newSpeed !== carSpeed) {
      gameState.setCarSpeed(newSpeed);
    }

    if (newSpeed > 0.05 && targetNodeRef.current && currentNodeRef.current) {
      const fromNode = currentNodeRef.current;
      const toNode = targetNodeRef.current;

      const dx = toNode.worldX - fromNode.worldX;
      const dz = toNode.worldZ - fromNode.worldZ;
      const edgeLength = Math.sqrt(dx * dx + dz * dz);

      const progressDelta = (newSpeed * delta) / edgeLength;
      edgeProgress.current += progressDelta;

      if (edgeProgress.current >= 1) {
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

        checkForFork(toNode);
      } else {
        const t = edgeProgress.current;
        camera.position.x = fromNode.worldX + dx * t;
        camera.position.z = fromNode.worldZ + dz * t;
      }

      if (targetNodeRef.current && currentNodeRef.current) {
        const targetRotation = getDirectionAngle(currentNodeRef.current, targetNodeRef.current);
        camera.rotation.y = MathUtils.lerp(camera.rotation.y, targetRotation, delta * 5);
        gameState.setCameraRotation(camera.rotation.y);
      }

      const bobAmount =
        Math.sin(state.clock.elapsedTime * 8 * (newSpeed / 3)) * 0.03 * (newSpeed / 3);
      camera.position.y = 1.4 + bobAmount;
    } else {
      camera.position.y = MathUtils.lerp(camera.position.y, 1.4, 0.1);
    }

    camera.rotation.x = MathUtils.clamp(camera.rotation.x, -0.15, 0.15);
    camera.rotation.z = MathUtils.lerp(camera.rotation.z, 0, 0.2);

    const sanity = gameState.getSanityLevel();
    if (sanity < 50) {
      const shake = ((50 - sanity) / 50) * 0.01 * (1 + newSpeed / 3);
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.z += (Math.random() - 0.5) * shake;

      const tilt = Math.sin(state.clock.elapsedTime * 2) * 0.02 * (1 - sanity / 50);
      camera.rotation.z = MathUtils.lerp(camera.rotation.z, tilt, 0.1);
    }
  });

  return <ClownCarCockpit />;
}
