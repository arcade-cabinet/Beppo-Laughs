import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Billboard, Text } from '@react-three/drei';
import { Mesh, MeshStandardMaterial, Color, Vector3 } from 'three';
import { useGameStore } from '../../game/store';
import brainTextureUrl from '@assets/generated_images/pale_brain_3d_asset.png';

function BrainHemisphere({ side, value, maxValue }: { side: 'left' | 'right', value: number, maxValue: number }) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  
  const percentage = value / maxValue;
  const isLeft = side === 'left';
  
  // Colors: pale pink -> dark red (fear/left) or pale pink -> dark blue (despair/right)
  const baseColor = new Color('#e8d4d4'); // Pale brain
  const dangerColor = isLeft ? new Color('#8b0000') : new Color('#00008b');
  
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    
    // Interpolate color based on meter value
    const currentColor = baseColor.clone().lerp(dangerColor, percentage);
    materialRef.current.color = currentColor;
    
    // Melting effect at high values (> 80%)
    if (percentage > 0.8) {
      const meltFactor = (percentage - 0.8) * 5; // 0-1 as percentage goes 80-100
      meshRef.current.scale.y = 1 - meltFactor * 0.3;
      meshRef.current.position.y = -meltFactor * 0.2;
      
      // Drip/wobble effect
      const wobble = Math.sin(state.clock.elapsedTime * 5 + (isLeft ? 0 : Math.PI)) * 0.05 * meltFactor;
      meshRef.current.rotation.z = wobble;
    } else {
      meshRef.current.scale.y = 1;
      meshRef.current.position.y = 0;
      meshRef.current.rotation.z = 0;
    }
    
    // Pulsing at high values
    if (percentage > 0.5) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.02 * percentage;
      meshRef.current.scale.x = pulse;
      meshRef.current.scale.z = pulse;
    }
  });
  
  return (
    <mesh 
      ref={meshRef} 
      position={[isLeft ? -0.3 : 0.3, 0, 0]}
    >
      <sphereGeometry args={[0.4, 16, 16, isLeft ? Math.PI : 0, Math.PI]} />
      <meshStandardMaterial 
        ref={materialRef}
        color={baseColor}
        roughness={0.7}
        metalness={0.1}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function Brain3D() {
  const { fear, despair, maxSanity } = useGameStore();
  const brainTexture = useTexture(brainTextureUrl);
  
  return (
    <group>
      {/* Left Hemisphere - FEAR (Red) */}
      <BrainHemisphere side="left" value={fear} maxValue={maxSanity} />
      
      {/* Right Hemisphere - DESPAIR (Blue) */}
      <BrainHemisphere side="right" value={despair} maxValue={maxSanity} />
      
      {/* Brain stem/connection */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.3, 8]} />
        <meshStandardMaterial color="#d4c4c4" roughness={0.8} />
      </mesh>
      
      {/* Labels */}
      <Text
        position={[-0.5, 0.6, 0]}
        fontSize={0.15}
        color="#8b0000"
        anchorX="center"
      >
        FEAR
      </Text>
      <Text
        position={[0.5, 0.6, 0]}
        fontSize={0.15}
        color="#00008b"
        anchorX="center"
      >
        DESPAIR
      </Text>
      
      {/* Percentage displays */}
      <Text
        position={[-0.3, -0.6, 0]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
      >
        {Math.floor(fear)}%
      </Text>
      <Text
        position={[0.3, -0.6, 0]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
      >
        {Math.floor(despair)}%
      </Text>
    </group>
  );
}

export function BrainMeter() {
  const { fear, despair, maxSanity } = useGameStore();
  
  // Calculate overall sanity for background effects
  const avgInsanity = (fear + despair) / 2 / maxSanity;
  
  return (
    <div 
      className="absolute top-4 left-4 w-40 h-32 z-50 pointer-events-none"
      style={{
        filter: avgInsanity > 0.5 ? `blur(${avgInsanity * 2}px)` : 'none'
      }}
    >
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }} >
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={0.5} />
        <pointLight position={[-2, -2, 2]} intensity={0.3} color="#ff6666" />
        <Brain3D />
      </Canvas>
      
      {/* Sanity label */}
      <div className="absolute bottom-0 left-0 right-0 text-center text-white/50 font-mono text-xs uppercase tracking-widest">
        SANITY
      </div>
    </div>
  );
}
