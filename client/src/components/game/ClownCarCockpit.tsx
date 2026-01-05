import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/store';

export function ClownCarCockpit() {
  const wheelRef = useRef<THREE.Group>(null);
  const leftPedalRef = useRef<THREE.Mesh>(null);
  const rightPedalRef = useRef<THREE.Mesh>(null);
  const dashboardRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    const state = useGameStore.getState();
    const { steeringAngle, accelerating, braking } = state;
    
    if (wheelRef.current) {
      wheelRef.current.rotation.z = -steeringAngle * 1.5;
    }
    
    if (rightPedalRef.current) {
      rightPedalRef.current.rotation.x = accelerating ? 0.3 : 0;
    }
    
    if (leftPedalRef.current) {
      leftPedalRef.current.rotation.x = braking ? 0.3 : 0;
    }
  });
  
  return (
    <group position={[0, -0.3, 0.2]}>
      {/* Dashboard */}
      <group ref={dashboardRef} position={[0, 0.4, -0.5]}>
        {/* Main dashboard body - curved vintage shape */}
        <mesh position={[0, 0, 0]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[1.2, 0.15, 0.4]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
        
        {/* Dashboard top trim */}
        <mesh position={[0, 0.08, 0.15]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[1.3, 0.05, 0.2]} />
          <meshStandardMaterial color="#CD853F" roughness={0.6} />
        </mesh>
        
        {/* Colorful circus dots on dashboard */}
        {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
          <mesh key={i} position={[x, 0.02, 0.1]} rotation={[-0.3, 0, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial 
              color={['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#ff00ff'][i]} 
              emissive={['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#ff00ff'][i]}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>
      
      {/* Steering Column */}
      <mesh position={[0, 0.35, -0.35]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.3, 16]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Steering Wheel */}
      <group ref={wheelRef} position={[0, 0.5, -0.25]} rotation={[0.6, 0, 0]}>
        {/* Wheel rim - torus */}
        <mesh>
          <torusGeometry args={[0.18, 0.025, 16, 32]} />
          <meshStandardMaterial color="#ff4444" roughness={0.4} />
        </mesh>
        
        {/* Wheel spokes */}
        {[0, Math.PI/2, Math.PI, Math.PI * 1.5].map((angle, i) => (
          <mesh key={i} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.35, 0.02, 0.02]} />
            <meshStandardMaterial color="#ffcc00" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        
        {/* Center hub - clown nose! */}
        <mesh>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000"
            emissiveIntensity={0.2}
            roughness={0.3}
          />
        </mesh>
      </group>
      
      {/* Floor/Pedal Area */}
      <mesh position={[0, -0.1, -0.3]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.4]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>
      
      {/* Brake Pedal (Left) */}
      <mesh 
        ref={leftPedalRef} 
        position={[-0.15, -0.05, -0.2]}
      >
        <boxGeometry args={[0.12, 0.02, 0.15]} />
        <meshStandardMaterial color="#cc0000" roughness={0.5} />
      </mesh>
      
      {/* Accelerator Pedal (Right) */}
      <mesh 
        ref={rightPedalRef} 
        position={[0.15, -0.05, -0.2]}
      >
        <boxGeometry args={[0.12, 0.02, 0.15]} />
        <meshStandardMaterial color="#00cc00" roughness={0.5} />
      </mesh>
      
      {/* Side panels - create enclosed feel */}
      <mesh position={[-0.55, 0.1, -0.2]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.6]} />
        <meshStandardMaterial color="#ff6600" roughness={0.6} />
      </mesh>
      <mesh position={[0.55, 0.1, -0.2]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.6]} />
        <meshStandardMaterial color="#ff6600" roughness={0.6} />
      </mesh>
      
      {/* Decorative polka dots on side panels */}
      {[-0.52, 0.52].map((x, side) => (
        [0, 0.15, -0.15].map((y, i) => (
          <mesh key={`${side}-${i}`} position={[x, 0.1 + y * 0.5, -0.2]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? '#ffffff' : '#ffff00'} 
            />
          </mesh>
        ))
      ))}
      
      {/* Hood/front of car visible at bottom of view */}
      <mesh position={[0, -0.15, -0.6]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[1.0, 0.2, 0.3]} />
        <meshStandardMaterial color="#ff4400" roughness={0.5} />
      </mesh>
      
      {/* Hood ornament - tiny clown */}
      <mesh position={[0, -0.02, -0.75]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#ffddcc" />
      </mesh>
      <mesh position={[0, 0.02, -0.75]}>
        <coneGeometry args={[0.03, 0.06, 8]} />
        <meshStandardMaterial color="#ff00ff" />
      </mesh>
    </group>
  );
}
