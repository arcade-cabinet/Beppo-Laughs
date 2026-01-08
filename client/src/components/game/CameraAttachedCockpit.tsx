import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import type { Group } from 'three';
import { ClownCarInterior } from './ClownCarInterior';

/**
 * Attaches the clown car interior to the camera viewport.
 * The interior is FIXED to the player's view - creating a first-person driver perspective.
 * Only the camera (player's viewpoint) moves through the maze world.
 *
 * This creates the immersive feeling of sitting in the driver's seat
 * while the world flows past your windshield.
 */
export function CameraAttachedCockpit() {
  const { camera } = useThree();
  const cockpitGroupRef = useRef<Group>(null);

  useFrame(() => {
    if (cockpitGroupRef.current) {
      // Copy camera position and rotation every frame
      // This makes the cockpit stay fixed to the viewport
      cockpitGroupRef.current.position.copy(camera.position);
      cockpitGroupRef.current.rotation.copy(camera.rotation);
    }
  });

  return (
    <group ref={cockpitGroupRef}>
      <Suspense fallback={null}>
        <ClownCarInterior />
      </Suspense>
    </group>
  );
}
