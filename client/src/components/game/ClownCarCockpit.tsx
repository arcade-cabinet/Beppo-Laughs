import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/store';

export function ClownCarCockpit() {
  const leftPedalRef = useRef<THREE.Mesh>(null);
  const rightPedalRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    const state = useGameStore.getState();
    const { accelerating, braking } = state;
    
    if (rightPedalRef.current) {
      rightPedalRef.current.rotation.x = THREE.MathUtils.lerp(
        rightPedalRef.current.rotation.x,
        accelerating ? 0.4 : 0,
        0.2
      );
    }
    
    if (leftPedalRef.current) {
      leftPedalRef.current.rotation.x = THREE.MathUtils.lerp(
        leftPedalRef.current.rotation.x,
        braking ? 0.4 : 0,
        0.2
      );
    }
  });
  
  // Scale factor to make car much larger and more visible
  const scale = 2.5;
  
  return (
    <group position={[0, -0.6, 0.3]} scale={[scale, scale, scale]}>
      {/* Clown Car Hood - Garish curved metal with blemishes */}
      <group position={[0, 0.15, -0.9]}>
        {/* Main hood body - curved and extended */}
        <mesh rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[1.8, 0.12, 1.2]} />
          <meshStandardMaterial 
            color="#ff4400" 
            roughness={0.6} 
            metalness={0.4}
          />
        </mesh>
        
        {/* Hood curve front */}
        <mesh position={[0, -0.06, 0.55]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[1.7, 0.1, 0.4]} />
          <meshStandardMaterial 
            color="#ff3300" 
            roughness={0.7} 
            metalness={0.3}
          />
        </mesh>
        
        {/* Hood curve back (near player) */}
        <mesh position={[0, 0.06, -0.55]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[1.75, 0.08, 0.3]} />
          <meshStandardMaterial 
            color="#ff5500" 
            roughness={0.5} 
            metalness={0.4}
          />
        </mesh>
        
        {/* Left fender - larger */}
        <mesh position={[-0.8, 0.04, 0.2]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.35, 0.15, 1.0]} />
          <meshStandardMaterial 
            color="#ffcc00" 
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
        
        {/* Right fender - larger */}
        <mesh position={[0.8, 0.04, 0.2]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.35, 0.15, 1.0]} />
          <meshStandardMaterial 
            color="#ffcc00" 
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
        
        {/* Hood ornament - Larger Clown face */}
        <mesh position={[0, 0.12, 0.5]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial 
            color="#ffddcc" 
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 0.22, 0.5]}>
          <coneGeometry args={[0.08, 0.15, 8]} />
          <meshStandardMaterial 
            color="#ff00ff" 
            emissive="#ff00ff"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0, 0.06, 0.58]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Polka dots on hood - larger and more visible */}
        {[
          [-0.4, 0.09, 0.1], [0.4, 0.09, 0.1],
          [-0.2, 0.09, 0.35], [0.2, 0.09, 0.35],
          [0, 0.09, -0.15],
          [-0.5, 0.09, -0.2], [0.5, 0.09, -0.2],
          [-0.25, 0.09, -0.35], [0.25, 0.09, -0.35],
        ].map((pos, i) => (
          <mesh key={`dot-${i}`} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial 
              color={['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#0000ff', '#ff0066', '#66ff00', '#00ffaa', '#aa00ff'][i]}
              roughness={0.3}
              emissive={['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#0000ff', '#ff0066', '#66ff00', '#00ffaa', '#aa00ff'][i]}
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
        
        {/* Metal blemishes/rivets - larger */}
        {[
          [-0.65, 0.08, -0.3], [0.65, 0.08, -0.3],
          [-0.55, 0.08, 0.25], [0.55, 0.08, 0.25],
          [-0.3, 0.08, -0.4], [0.3, 0.08, -0.4],
          [-0.7, 0.08, 0], [0.7, 0.08, 0],
        ].map((pos, i) => (
          <mesh key={`rivet-${i}`} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.025, 0.025, 0.03, 8]} />
            <meshStandardMaterial 
              color="#888866"
              roughness={0.8}
              metalness={0.6}
            />
          </mesh>
        ))}
      </group>
      
      {/* Dashboard behind hood - larger */}
      <mesh position={[0, 0.35, -0.5]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[1.6, 0.18, 0.25]} />
        <meshStandardMaterial color="#2a1608" roughness={0.85} />
      </mesh>
      
      {/* Side panels - larger and more prominent */}
      <mesh position={[-0.85, 0.15, -0.45]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.7]} />
        <meshStandardMaterial color="#ff6600" roughness={0.6} />
      </mesh>
      <mesh position={[0.85, 0.15, -0.45]} rotation={[0, -0.15, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.7]} />
        <meshStandardMaterial color="#ff6600" roughness={0.6} />
      </mesh>
      
      {/* Floor / footwell - larger */}
      <mesh position={[0, -0.2, -0.35]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[1.1, 0.06, 0.7]} />
        <meshStandardMaterial color="#1a1510" roughness={0.9} />
      </mesh>
      
      {/* Brake Pedal (Left) - 3D representation */}
      <group position={[-0.25, -0.15, -0.2]}>
        <mesh 
          ref={leftPedalRef} 
          position={[0, 0.06, 0]}
        >
          <boxGeometry args={[0.15, 0.04, 0.22]} />
          <meshStandardMaterial color="#cc0000" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, -0.12]}>
          <boxGeometry args={[0.025, 0.1, 0.025]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
      </group>
      
      {/* Accelerator Pedal (Right) - 3D representation */}
      <group position={[0.25, -0.15, -0.2]}>
        <mesh 
          ref={rightPedalRef} 
          position={[0, 0.06, 0]}
        >
          <boxGeometry args={[0.15, 0.04, 0.22]} />
          <meshStandardMaterial color="#00cc00" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, -0.12]}>
          <boxGeometry args={[0.025, 0.1, 0.025]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
