import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { useGameStore } from '../../game/store';
import { MazeGeometry, RailNode } from '../../game/maze/geometry';

interface RailPlayerProps {
  geometry: MazeGeometry;
}

export function RailPlayer({ geometry }: RailPlayerProps) {
  const { camera } = useThree();
  
  const currentPos = useRef(new Vector3());
  const targetPos = useRef(new Vector3());
  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) return;
    
    const centerNode = geometry.railNodes.get(geometry.centerNodeId);
    if (centerNode) {
      useGameStore.getState().setCurrentNode(geometry.centerNodeId);
      camera.position.set(centerNode.worldX, 1.4, centerNode.worldZ);
      currentPos.current.set(centerNode.worldX, 1.4, centerNode.worldZ);
      
      camera.rotation.set(0, 0, 0);
      
      if (centerNode.connections.length > 0) {
        const firstConnection = geometry.railNodes.get(centerNode.connections[0]);
        if (firstConnection) {
          const lookDir = Math.atan2(
            firstConnection.worldX - centerNode.worldX,
            firstConnection.worldZ - centerNode.worldZ
          );
          camera.rotation.y = lookDir;
          camera.rotation.x = 0;
          camera.rotation.z = 0;
          useGameStore.getState().setCameraRotation(lookDir);
        }
      }
      
      console.log('Player at cell:', centerNode.gridX, centerNode.gridY, '-> world:', centerNode.worldX, centerNode.worldZ);
      initialized.current = true;
    }
  }, [geometry, camera]);
  
  const getDirectionRotation = (fromNode: RailNode, toNode: RailNode): number => {
    const dx = toNode.worldX - fromNode.worldX;
    const dz = toNode.worldZ - fromNode.worldZ;
    return Math.atan2(dx, dz);
  };
  
  useFrame((state, delta) => {
    const gameState = useGameStore.getState();
    const { currentNode, targetNode, isMoving, moveProgress, moveSpeed, isGameOver, hasWon } = gameState;
    
    if (isGameOver || hasWon) return;
    
    const fromNode = geometry.railNodes.get(currentNode);
    const toNode = targetNode ? geometry.railNodes.get(targetNode) : null;
    
    if (isMoving && fromNode && toNode) {
      currentPos.current.set(fromNode.worldX, 1.4, fromNode.worldZ);
      targetPos.current.set(toNode.worldX, 1.4, toNode.worldZ);
      
      const distance = currentPos.current.distanceTo(targetPos.current);
      
      const baseSpeed = 2.5;
      const progressDelta = (baseSpeed * moveSpeed * delta) / Math.max(distance, 0.1);
      const newProgress = moveProgress + progressDelta;
      
      if (newProgress >= 1) {
        camera.position.copy(targetPos.current);
        gameState.completeMove();
        
        if (toNode.isExit) {
          gameState.triggerWin();
        }
      } else {
        gameState.updateMoveProgress(newProgress);
        
        const easedProgress = newProgress < 0.5 
          ? 2 * newProgress * newProgress 
          : 1 - Math.pow(-2 * newProgress + 2, 2) / 2;
        
        const lerpedPos = new Vector3().lerpVectors(currentPos.current, targetPos.current, easedProgress);
        camera.position.copy(lerpedPos);
        
        const targetRot = getDirectionRotation(fromNode, toNode);
        camera.rotation.y = MathUtils.lerp(camera.rotation.y, targetRot, 0.15);
      }
      
      const bobAmount = Math.sin(state.clock.elapsedTime * 12 * moveSpeed) * 0.04;
      camera.position.y = 1.4 + bobAmount;
    } else if (fromNode && !isMoving) {
      camera.position.x = MathUtils.lerp(camera.position.x, fromNode.worldX, 0.1);
      camera.position.z = MathUtils.lerp(camera.position.z, fromNode.worldZ, 0.1);
      camera.position.y = MathUtils.lerp(camera.position.y, 1.4, 0.1);
    }
    
    const maxPitchUp = -0.17;
    const maxPitchDown = 0.26;
    camera.rotation.x = Math.max(maxPitchUp, Math.min(maxPitchDown, camera.rotation.x));
    
    camera.rotation.z = MathUtils.lerp(camera.rotation.z, 0, 0.2);
    
    const sanity = gameState.getSanityLevel();
    if (sanity < 50) {
      const shake = (50 - sanity) / 50 * 0.015;
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.z += (Math.random() - 0.5) * shake;
      
      const tilt = Math.sin(state.clock.elapsedTime * 2) * 0.03 * (1 - sanity / 50);
      camera.rotation.z = MathUtils.lerp(camera.rotation.z, tilt, 0.1);
    }
  });
  
  return null;
}
