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
  
  return (
    <group position={[0, -0.3, 0.1]}>
      {/* Clown Car Hood - Garish curved metal with blemishes */}
      <group position={[0, 0.1, -0.7]}>
        {/* Main hood body - curved */}
        <mesh rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[1.4, 0.08, 0.8]} />
          <meshStandardMaterial 
            color="#ff4400" 
            roughness={0.6} 
            metalness={0.4}
          />
        </mesh>
        
        {/* Hood curve front */}
        <mesh position={[0, -0.04, 0.35]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[1.3, 0.08, 0.3]} />
          <meshStandardMaterial 
            color="#ff3300" 
            roughness={0.7} 
            metalness={0.3}
          />
        </mesh>
        
        {/* Hood curve back (near player) */}
        <mesh position={[0, 0.04, -0.35]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[1.35, 0.06, 0.2]} />
          <meshStandardMaterial 
            color="#ff5500" 
            roughness={0.5} 
            metalness={0.4}
          />
        </mesh>
        
        {/* Left fender */}
        <mesh position={[-0.6, 0.02, 0.1]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.25, 0.1, 0.7]} />
          <meshStandardMaterial 
            color="#ffcc00" 
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
        
        {/* Right fender */}
        <mesh position={[0.6, 0.02, 0.1]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.25, 0.1, 0.7]} />
          <meshStandardMaterial 
            color="#ffcc00" 
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
        
        {/* Hood ornament - Clown face */}
        <mesh position={[0, 0.08, 0.3]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color="#ffddcc" 
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 0.14, 0.3]}>
          <coneGeometry args={[0.05, 0.1, 8]} />
          <meshStandardMaterial 
            color="#ff00ff" 
            emissive="#ff00ff"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, 0.04, 0.35]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000"
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {/* Polka dots on hood - blemishes/decorations */}
        {[
          [-0.3, 0.06, 0], [0.3, 0.06, 0],
          [-0.15, 0.06, 0.2], [0.15, 0.06, 0.2],
          [0, 0.06, -0.1],
        ].map((pos, i) => (
          <mesh key={`dot-${i}`} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial 
              color={['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#0000ff'][i]}
              roughness={0.3}
            />
          </mesh>
        ))}
        
        {/* Metal blemishes/rivets */}
        {[
          [-0.5, 0.05, -0.2], [0.5, 0.05, -0.2],
          [-0.4, 0.05, 0.15], [0.4, 0.05, 0.15],
          [-0.2, 0.05, -0.25], [0.2, 0.05, -0.25],
        ].map((pos, i) => (
          <mesh key={`rivet-${i}`} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
            <meshStandardMaterial 
              color="#888866"
              roughness={0.8}
              metalness={0.6}
            />
          </mesh>
        ))}
      </group>
      
      {/* Dashboard behind hood */}
      <mesh position={[0, 0.25, -0.4]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[1.2, 0.12, 0.15]} />
        <meshStandardMaterial color="#2a1608" roughness={0.85} />
      </mesh>
      
      {/* Side panels */}
      <mesh position={[-0.65, 0.1, -0.3]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.5]} />
        <meshStandardMaterial color="#ff6600" roughness={0.6} />
      </mesh>
      <mesh position={[0.65, 0.1, -0.3]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.5]} />
        <meshStandardMaterial color="#ff6600" roughness={0.6} />
      </mesh>
      
      {/* Floor / footwell */}
      <mesh position={[0, -0.15, -0.25]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.8, 0.04, 0.5]} />
        <meshStandardMaterial color="#1a1510" roughness={0.9} />
      </mesh>
      
      {/* Brake Pedal (Left) - 3D representation */}
      <group position={[-0.2, -0.12, -0.15]}>
        <mesh 
          ref={leftPedalRef} 
          position={[0, 0.05, 0]}
        >
          <boxGeometry args={[0.12, 0.03, 0.18]} />
          <meshStandardMaterial color="#cc0000" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[0.02, 0.08, 0.02]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
      </group>
      
      {/* Accelerator Pedal (Right) - 3D representation */}
      <group position={[0.2, -0.12, -0.15]}>
        <mesh 
          ref={rightPedalRef} 
          position={[0, 0.05, 0]}
        >
          <boxGeometry args={[0.12, 0.03, 0.18]} />
          <meshStandardMaterial color="#00cc00" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[0.02, 0.08, 0.02]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
