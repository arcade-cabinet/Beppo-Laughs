import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { useGameStore } from '../../game/store';
import { MazeGeometry, RailNode } from '../../game/maze/geometry';
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
  const selectedDirection = useRef(0);
  
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
          -(firstNode.worldZ - centerNode.worldZ)
        );
        camera.rotation.y = lookDir;
        useGameStore.getState().setCameraRotation(lookDir);
      }
      
      updateAvailableMoves(centerNode);
      initialized.current = true;
    }
  }, [geometry, camera]);
  
  const updateAvailableMoves = (node: RailNode) => {
    const moves: { direction: 'north' | 'south' | 'east' | 'west'; nodeId: string; isExit: boolean }[] = [];
    
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
    
    useGameStore.getState().setAvailableMoves(moves);
  };
  
  const getDirectionAngle = (from: RailNode, to: RailNode): number => {
    return Math.atan2(to.worldX - from.worldX, -(to.worldZ - from.worldZ));
  };
  
  const pickNextTarget = (fromNode: RailNode, steeringAngle: number, currentRotation: number): RailNode | null => {
    if (fromNode.connections.length === 0) return null;
    
    if (fromNode.connections.length === 1) {
      return geometry.railNodes.get(fromNode.connections[0]) || null;
    }
    
    let bestNode: RailNode | null = null;
    let bestScore = -Infinity;
    
    for (const connId of fromNode.connections) {
      const connNode = geometry.railNodes.get(connId);
      if (!connNode) continue;
      
      const dirAngle = getDirectionAngle(fromNode, connNode);
      let angleDiff = dirAngle - currentRotation;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      
      const forwardScore = 1 - Math.abs(angleDiff) / Math.PI;
      const steeringMatch = -angleDiff * steeringAngle;
      const score = forwardScore * 0.7 + steeringMatch * 0.3;
      
      if (score > bestScore) {
        bestScore = score;
        bestNode = connNode;
      }
    }
    
    return bestNode;
  };
  
  useFrame((state, delta) => {
    const gameState = useGameStore.getState();
    const { carSpeed, steeringAngle, accelerating, braking, isGameOver, hasWon, cameraRotation } = gameState;
    
    if (isGameOver || hasWon) return;
    if (!currentNodeRef.current) return;
    
    let newSpeed = carSpeed;
    if (accelerating) {
      newSpeed = Math.min(5, carSpeed + delta * 3);
    } else if (braking) {
      newSpeed = Math.max(0, carSpeed - delta * 5);
    } else {
      newSpeed = Math.max(0, carSpeed - delta * 1);
    }
    
    const dampedSteering = MathUtils.lerp(steeringAngle, 0, delta * 2);
    gameState.setSteeringAngle(dampedSteering);
    gameState.setCarSpeed(newSpeed);
    
    if (newSpeed > 0.05) {
      if (!targetNodeRef.current) {
        const nextTarget = pickNextTarget(currentNodeRef.current, steeringAngle, cameraRotation);
        if (nextTarget) {
          targetNodeRef.current = nextTarget;
          edgeProgress.current = 0;
        }
      }
      
      if (targetNodeRef.current && currentNodeRef.current) {
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
          
          gameState.visitNode(toNode.id);
          gameState.setCurrentNode(toNode.id);
          updateAvailableMoves(toNode);
          
          if (toNode.isExit) {
            gameState.triggerWin();
            return;
          }
          
          const nextTarget = pickNextTarget(toNode, steeringAngle, camera.rotation.y);
          targetNodeRef.current = nextTarget;
        } else {
          const t = edgeProgress.current;
          const posX = fromNode.worldX + dx * t;
          const posZ = fromNode.worldZ + dz * t;
          camera.position.x = posX;
          camera.position.z = posZ;
        }
        
        if (targetNodeRef.current && currentNodeRef.current) {
          const targetRotation = getDirectionAngle(currentNodeRef.current, targetNodeRef.current);
          camera.rotation.y = MathUtils.lerp(camera.rotation.y, targetRotation, delta * 5);
          gameState.setCameraRotation(camera.rotation.y);
        }
        
        const bobAmount = Math.sin(state.clock.elapsedTime * 8 * (newSpeed / 3)) * 0.03 * (newSpeed / 3);
        camera.position.y = 1.4 + bobAmount;
      }
    } else {
      camera.position.y = MathUtils.lerp(camera.position.y, 1.4, 0.1);
    }
    
    camera.rotation.x = MathUtils.clamp(camera.rotation.x, -0.15, 0.15);
    camera.rotation.z = MathUtils.lerp(camera.rotation.z, 0, 0.2);
    
    const sanity = gameState.getSanityLevel();
    if (sanity < 50) {
      const shake = (50 - sanity) / 50 * 0.01 * (1 + newSpeed / 3);
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.z += (Math.random() - 0.5) * shake;
      
      const tilt = Math.sin(state.clock.elapsedTime * 2) * 0.02 * (1 - sanity / 50);
      camera.rotation.z = MathUtils.lerp(camera.rotation.z, tilt, 0.1);
    }
  });
  
  return <ClownCarCockpit />;
}
