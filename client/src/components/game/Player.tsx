import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { PointerLockControls } from '@react-three/drei';
import { useGameStore } from '../../game/store';
import { resolveCollision } from '../../game/collision';
import { MazeGenerator } from '../../game/MazeGenerator';

interface PlayerProps {
  position?: [number, number, number];
  onMove?: (pos: Vector3) => void;
  maze: MazeGenerator;
}

export function Player({ position = [1, 1, 1], onMove, maze }: PlayerProps) {
  const { camera } = useThree();
  const [locked, setLocked] = useState(false);
  const { 
    fear, 
    despair, 
    updatePlayerPosition, 
    decreaseFear, 
    decreaseDespair, 
    isGameOver,
    blockades 
  } = useGameStore();
  const isInverted = useGameStore(state => state.isInverted());
  const sanityLevel = useGameStore(state => state.getSanityLevel());
  
  // Movement state
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  
  // Position tracking for cell updates
  const lastCellUpdate = useRef({ x: -999, z: -999 });
  const isMobile = useRef(false);

  useEffect(() => {
    // Initial Position - start in first cell, looking into the maze
    camera.position.set(1, 1.6, 1);
    camera.lookAt(3, 1.6, 3);

    // Detect Mobile
    isMobile.current = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const onKeyDown = (event: KeyboardEvent) => {
      if (isGameOver) return;
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = true;
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    const handleClick = () => {
      if (!isGameOver) setLocked(true);
    }
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [camera, isGameOver]);

  useFrame((state, delta) => {
    if (isGameOver) return;
    
    // Slow sanity recovery
    if (Math.random() > 0.998) {
      decreaseFear(0.5);
      decreaseDespair(0.5);
    }

    // Base speed affected by sanity
    const sanityFactor = sanityLevel / 100;
    const baseSpeed = 4.0;
    const speed = baseSpeed * (0.5 + sanityFactor * 0.5);
    
    const velocity = new Vector3();
    const direction = new Vector3();

    // Calculate movement direction
    const forward = Number(moveForward.current) - Number(moveBackward.current);
    const side = Number(moveRight.current) - Number(moveLeft.current);

    direction.z = isInverted ? -forward : forward;
    direction.x = isInverted ? -side : side;
    direction.normalize(); 

    if (moveForward.current || moveBackward.current) velocity.z -= direction.z * speed * delta;
    if (moveLeft.current || moveRight.current) velocity.x -= direction.x * speed * delta;

    const currentPos = camera.position.clone();
    
    // Apply movement in camera space
    const moveVec = new Vector3(velocity.x, 0, velocity.z);
    moveVec.applyQuaternion(camera.quaternion);
    moveVec.y = 0;
    
    // Physics distortion at low sanity
    if (sanityLevel < 50) {
      const distortionFactor = (50 - sanityLevel) / 50;
      moveVec.x += (Math.random() - 0.5) * 0.02 * distortionFactor;
      moveVec.z += (Math.random() - 0.5) * 0.02 * distortionFactor;
    }
    
    const targetPos = currentPos.clone().add(moveVec);
    
    // Collision detection WITH BLOCKADES
    const resolvedPos = resolveCollision(currentPos, targetPos, maze, blockades);
    
    camera.position.x = resolvedPos.x;
    camera.position.z = resolvedPos.z;
    
    // Camera effects based on sanity
    const avgInsanity = (fear + despair) / 2;
    
    if (avgInsanity > 20) {
      const shakeIntensity = (avgInsanity / 100) * 0.03;
      camera.position.x += (Math.random() - 0.5) * shakeIntensity;
    }
    
    if (sanityLevel < 30) {
      const tiltFactor = (30 - sanityLevel) / 30;
      camera.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05 * tiltFactor;
    } else {
      camera.rotation.z = MathUtils.lerp(camera.rotation.z, 0, 0.1);
    }

    const isMoving = moveForward.current || moveBackward.current || moveLeft.current || moveRight.current;
    const walkBob = isMoving ? Math.sin(state.clock.elapsedTime * 10) * 0.03 : 0;
    
    camera.position.y = MathUtils.lerp(camera.position.y, 1.0 + walkBob, 0.1);
    
    // Update cell tracking
    const cellX = Math.floor(camera.position.x / 2);
    const cellZ = Math.floor(camera.position.z / 2);
    
    if (cellX !== lastCellUpdate.current.x || cellZ !== lastCellUpdate.current.z) {
      lastCellUpdate.current = { x: cellX, z: cellZ };
      updatePlayerPosition(camera.position.x, camera.position.z);
    }
    
    if (onMove) onMove(camera.position);
  });

  if (isMobile.current) {
    return <group />;
  }

  return (
    <PointerLockControls 
      onLock={() => setLocked(true)}
      onUnlock={() => setLocked(false)}
    />
  );
}
