import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler, MathUtils } from 'three';
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
  const { isInverted, fear, decreaseFear } = useGameStore();
  
  // Movement state
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  
  // Gyroscope state
  const isMobile = useRef(false);
  const gyroEnabled = useRef(false);

  useEffect(() => {
    // Initial Position - start in first cell
    camera.position.set(0, 1, 0);

    // Detect Mobile
    isMobile.current = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const onKeyDown = (event: KeyboardEvent) => {
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
    
    // Auto-lock on click for desktop
    const handleClick = () => {
      setLocked(true);
    }
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [camera]);

  useFrame((state, delta) => {
    // Fear recovery over time
    if (Math.random() > 0.995) decreaseFear(1);

    const speed = 4.0;
    const velocity = new Vector3();
    const direction = new Vector3();

    // Calculate movement direction relative to camera
    // PENALTY: Inverted controls if fear is high
    const forward = Number(moveForward.current) - Number(moveBackward.current);
    const side = Number(moveRight.current) - Number(moveLeft.current);

    direction.z = isInverted ? -forward : forward;
    direction.x = isInverted ? -side : side;
    direction.normalize(); 

    if (moveForward.current || moveBackward.current) velocity.z -= direction.z * speed * delta;
    if (moveLeft.current || moveRight.current) velocity.x -= direction.x * speed * delta;

    // Calculate target position
    const currentPos = camera.position.clone();
    
    // Apply movement in camera space
    const moveVec = new Vector3(velocity.x, 0, velocity.z);
    moveVec.applyQuaternion(camera.quaternion);
    moveVec.y = 0; // Keep on ground
    
    const targetPos = currentPos.clone().add(moveVec);
    
    // Collision detection and resolution
    const resolvedPos = resolveCollision(currentPos, targetPos, maze);
    
    camera.position.x = resolvedPos.x;
    camera.position.z = resolvedPos.z;
    
    // PENALTY: Camera shake/wobble based on fear
    if (fear > 20) {
      const shakeIntensity = (fear / 100) * 0.03;
      camera.position.x += (Math.random() - 0.5) * shakeIntensity;
    }

    // Keep height constant (walking on ground) but allow bobbing
    const isMoving = moveForward.current || moveBackward.current || moveLeft.current || moveRight.current;
    const walkBob = isMoving ? Math.sin(state.clock.elapsedTime * 10) * 0.03 : 0;
    
    camera.position.y = MathUtils.lerp(camera.position.y, 1.0 + walkBob, 0.1);
    
    if (onMove) onMove(camera.position);
  });

  // Mobile touch controls overlay
  if (isMobile.current) {
    return (
      <group>
        {/* Touch controls would be rendered in HUD/HTML layer */}
      </group>
    );
  }

  return (
    <PointerLockControls 
      onLock={() => setLocked(true)}
      onUnlock={() => setLocked(false)}
    />
  );
}
