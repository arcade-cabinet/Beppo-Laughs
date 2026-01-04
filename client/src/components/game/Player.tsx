import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler, MathUtils } from 'three';
import { PointerLockControls } from '@react-three/drei';
import { useGameStore } from '../../game/store';

interface PlayerProps {
  position?: [number, number, number];
  onMove?: (pos: Vector3) => void;
}

export function Player({ position = [1, 1, 1], onMove }: PlayerProps) {
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
  const gyroEuler = useRef(new Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    // Initial Position
    camera.position.set(...position);

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
    
    // Gyroscope Handler
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!event.alpha || !event.beta || !event.gamma) return;
      
      // Convert to radians
      const alpha = event.alpha ? event.alpha * (Math.PI / 180) : 0;
      const beta = event.beta ? event.beta * (Math.PI / 180) : 0;
      const gamma = event.gamma ? event.gamma * (Math.PI / 180) : 0;
      
      gyroEuler.current.set(beta, alpha, -gamma);
    };

    if (isMobile.current) {
        window.addEventListener('deviceorientation', handleOrientation);
    } else {
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
        }
    }

    return () => {
      if (isMobile.current) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [position, camera]);

  useFrame((state, delta) => {
    // Fear recovery over time
    if (Math.random() > 0.99) decreaseFear(0.1);

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

    // PENALTY: Camera shake/wobble based on fear
    if (fear > 20) {
        const shakeIntensity = (fear / 100) * 0.05;
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity;
    }

    if (isMobile.current) {
         // Apply gyro rotation to camera (simplified)
         // In a real app we'd need quaternion math to combine initial offset + gyro
         // For now, we'll assume desktop testing mostly or touch controls overlay
    } else {
         camera.translateX(velocity.x);
         camera.translateZ(velocity.z); // Actually moves forward/back relative to lookDir
    }
    
    // Keep height constant (walking on ground) but allow bobbing
    const walkBob = (moveForward.current || moveBackward.current || moveLeft.current || moveRight.current) 
        ? Math.sin(state.clock.elapsedTime * 10) * 0.05 
        : 0;
    
    camera.position.y = MathUtils.lerp(camera.position.y, 1.0 + walkBob, 0.1);
    
    if (onMove) onMove(camera.position);
  });

  if (isMobile.current) {
    // Render Touch Controls overlay here if needed, but for now focusing on structure
    return null; 
  }

  return (
    <PointerLockControls 
        isLocked={locked} 
        onUnlock={() => setLocked(false)}
        selector="#root" // Lock when clicking anywhere
    />
  );
}
