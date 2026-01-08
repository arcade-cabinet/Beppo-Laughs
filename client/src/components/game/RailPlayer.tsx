import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef } from 'react';
import type { Group } from 'three';
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
  const cockpitGroupRef = useRef<Group>(null);

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
    },
    [geometry],
  );

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

  const getDirectionAngle = (from: RailNode, to: RailNode): number => {
    return Math.atan2(to.worldX - from.worldX, -(to.worldZ - from.worldZ));
  };

  useFrame((_state, delta) => {
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
      // Just ensure height is correct, no damping needed for static feel
      camera.position.y = 1.4;
      return;
    }

    if (nearbyExit) {
      camera.position.y = 1.4;
      return;
    }

    if (targetNode && !targetNodeRef.current) {
      const newTarget = geometry.railNodes.get(targetNode);
      if (newTarget) {
        targetNodeRef.current = newTarget;
        edgeProgress.current = 0;

        const targetRotation = getDirectionAngle(currentNodeRef.current, newTarget);
        // Instant rotation update for "on rails" feel, or very fast smooth
        const rotDiff = targetRotation - camera.rotation.y;
        const wrappedDiff = ((rotDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
        camera.rotation.y += wrappedDiff * Math.min(1, delta * 5);
        gameState.setCameraRotation(camera.rotation.y);
      }
    }

    // Physics-based speed update
    // Acceleration: 5m/s^2, Braking: 8m/s^2, Drag: 0.5/s
    let targetSpeed: number = carSpeed;
    if (accelerating) {
      targetSpeed = Math.min(5, carSpeed + delta * 5);
    } else if (braking) {
      targetSpeed = Math.max(0, carSpeed - delta * 8);
    } else {
      // Natural deceleration (friction/drag)
      targetSpeed = Math.max(0, carSpeed - delta * 0.5);
    }

    if (Math.abs(targetSpeed - carSpeed) > 0.001) {
      gameState.setCarSpeed(targetSpeed);
    }

    // Update position
    if (targetSpeed > 0.05 && targetNodeRef.current && currentNodeRef.current) {
      const fromNode = currentNodeRef.current;
      const toNode = targetNodeRef.current;

      const dx = toNode.worldX - fromNode.worldX;
      const dz = toNode.worldZ - fromNode.worldZ;
      const edgeLength = Math.sqrt(dx * dx + dz * dz);

      const progressDelta = (targetSpeed * delta) / edgeLength;
      edgeProgress.current += progressDelta;

      if (edgeProgress.current >= 1) {
        // Arrived at node
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
        // Interpolate along path - LINEAR for smooth rail feel
        const t = edgeProgress.current;
        camera.position.x = fromNode.worldX + dx * t;
        camera.position.z = fromNode.worldZ + dz * t;
      }

      // Smooth rotation to look ahead
      if (targetNodeRef.current && currentNodeRef.current) {
        const targetRotation = getDirectionAngle(currentNodeRef.current, targetNodeRef.current);
        let diff = targetRotation - camera.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        camera.rotation.y += diff * delta * 5;
        gameState.setCameraRotation(camera.rotation.y);
      }

      // NO HEAD BOB - Smooth rail glide
      camera.position.y = 1.4;
    } else {
      camera.position.y = 1.4;
    }

    // Reset tilts - ensure camera is level
    camera.rotation.x = 0;
    camera.rotation.z = 0;

    // Update cockpit position to STRICTLY follow camera
    if (cockpitGroupRef.current) {
      // EXACT copy of position/rotation
      cockpitGroupRef.current.position.copy(camera.position);
      cockpitGroupRef.current.rotation.copy(camera.rotation);
    }
  });

  // Cockpit follows camera position updated in useFrame
  return (
    <group ref={cockpitGroupRef}>
      <Suspense fallback={null}>
        <ClownCarCockpit />
      </Suspense>
    </group>
  );
}
