import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { useGameStore } from '../../game/store';
import { MazeGenerator, RailNode } from '../../game/MazeGenerator';

interface RailPlayerProps {
  maze: MazeGenerator;
}

export function RailPlayer({ maze }: RailPlayerProps) {
  const { camera } = useThree();
  
  const currentPos = useRef(new Vector3());
  const targetPos = useRef(new Vector3());
  const initialized = useRef(false);
  
  // Initialize player at center of maze (only once)
  useEffect(() => {
    if (initialized.current) return;
    
    const centerNode = maze.railGraph.nodes.get(maze.railGraph.centerNode);
    if (centerNode) {
      useGameStore.getState().setCurrentNode(maze.railGraph.centerNode);
      camera.position.set(centerNode.worldX, 1.4, centerNode.worldZ);
      currentPos.current.set(centerNode.worldX, 1.4, centerNode.worldZ);
      
      // Look toward first available path
      if (centerNode.connections.length > 0) {
        const firstConnection = maze.railGraph.nodes.get(centerNode.connections[0]);
        if (firstConnection) {
          const lookDir = Math.atan2(
            firstConnection.worldX - centerNode.worldX,
            firstConnection.worldZ - centerNode.worldZ
          );
          camera.rotation.y = lookDir;
          useGameStore.getState().setCameraRotation(lookDir);
        }
      }
      
      initialized.current = true;
    }
  }, [maze, camera]);
  
  // Calculate target rotation based on movement direction
  const getDirectionRotation = (fromNode: RailNode, toNode: RailNode): number => {
    const dx = toNode.worldX - fromNode.worldX;
    const dz = toNode.worldZ - fromNode.worldZ;
    return Math.atan2(dx, dz);
  };
  
  useFrame((state, delta) => {
    // Get fresh state each frame
    const gameState = useGameStore.getState();
    const { currentNode, targetNode, isMoving, moveProgress, moveSpeed, isGameOver, hasWon } = gameState;
    
    if (isGameOver || hasWon) return;
    
    const fromNode = maze.railGraph.nodes.get(currentNode);
    const toNode = targetNode ? maze.railGraph.nodes.get(targetNode) : null;
    
    if (isMoving && fromNode && toNode) {
      // Update positions
      currentPos.current.set(fromNode.worldX, 1.4, fromNode.worldZ);
      targetPos.current.set(toNode.worldX, 1.4, toNode.worldZ);
      
      const distance = currentPos.current.distanceTo(targetPos.current);
      
      // Calculate new progress
      const baseSpeed = 2.5; // Units per second
      const progressDelta = (baseSpeed * moveSpeed * delta) / Math.max(distance, 0.1);
      const newProgress = moveProgress + progressDelta;
      
      if (newProgress >= 1) {
        // Arrived at target
        camera.position.copy(targetPos.current);
        gameState.completeMove();
        
        // Check if reached exit
        if (toNode.isExit) {
          gameState.triggerWin();
        }
      } else {
        // Interpolate position
        gameState.updateMoveProgress(newProgress);
        
        // Smooth easing
        const easedProgress = newProgress < 0.5 
          ? 2 * newProgress * newProgress 
          : 1 - Math.pow(-2 * newProgress + 2, 2) / 2;
        
        const lerpedPos = new Vector3().lerpVectors(currentPos.current, targetPos.current, easedProgress);
        camera.position.copy(lerpedPos);
        
        // Smoothly rotate toward target
        const targetRot = getDirectionRotation(fromNode, toNode);
        camera.rotation.y = MathUtils.lerp(camera.rotation.y, targetRot, 0.15);
      }
      
      // Walking bob
      const bobAmount = Math.sin(state.clock.elapsedTime * 12 * moveSpeed) * 0.04;
      camera.position.y = 1.4 + bobAmount;
    } else if (fromNode && !isMoving) {
      // Idle at current node - ensure we're positioned correctly
      camera.position.x = MathUtils.lerp(camera.position.x, fromNode.worldX, 0.1);
      camera.position.z = MathUtils.lerp(camera.position.z, fromNode.worldZ, 0.1);
      camera.position.y = MathUtils.lerp(camera.position.y, 1.4, 0.1);
    }
    
    // Lock camera pitch to prevent looking outside tent
    // Clamp vertical look to slight range (-15 to +10 degrees)
    const maxPitchUp = -0.17; // ~10 degrees up
    const maxPitchDown = 0.26; // ~15 degrees down
    camera.rotation.x = Math.max(maxPitchUp, Math.min(maxPitchDown, camera.rotation.x));
    
    // Keep camera level on Z axis (no roll exploit)
    camera.rotation.z = MathUtils.lerp(camera.rotation.z, 0, 0.2);
    
    // Sanity-based camera effects
    const sanity = gameState.getSanityLevel();
    if (sanity < 50) {
      const shake = (50 - sanity) / 50 * 0.015;
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.z += (Math.random() - 0.5) * shake;
      
      // Slight tilt at low sanity (within limits)
      const tilt = Math.sin(state.clock.elapsedTime * 2) * 0.03 * (1 - sanity / 50);
      camera.rotation.z = MathUtils.lerp(camera.rotation.z, tilt, 0.1);
    }
  });
  
  return null;
}
