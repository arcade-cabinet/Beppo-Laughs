import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, type Group, type Mesh, type MeshStandardMaterial } from 'three';
import { useGameStore } from '../../game/store';

function BrainHemisphere({
  side,
  value,
  maxValue,
}: {
  side: 'left' | 'right';
  value: number;
  maxValue: number;
}) {
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
      const wobble =
        Math.sin(state.clock.elapsedTime * 5 + (isLeft ? 0 : Math.PI)) * 0.05 * meltFactor;
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
    <mesh ref={meshRef} position={[isLeft ? -0.25 : 0.25, 0, 0]} scale={[isLeft ? -1 : 1, 1, 1]}>
      <sphereGeometry args={[0.35, 24, 24]} />
      <meshStandardMaterial ref={materialRef} color={baseColor} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

function Brain3D() {
  const { fear, despair, maxSanity } = useGameStore();
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Left Hemisphere - FEAR (Red) */}
      <BrainHemisphere side="left" value={fear} maxValue={maxSanity} />

      {/* Right Hemisphere - DESPAIR (Blue) */}
      <BrainHemisphere side="right" value={despair} maxValue={maxSanity} />

      {/* Brain stem/connection */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.25, 8]} />
        <meshStandardMaterial color="#d4c4c4" roughness={0.8} />
      </mesh>

      {/* Brain folds texture via additional smaller spheres */}
      {[-0.15, 0.15].map((xOffset) => (
        <mesh key={`fold-${xOffset}`} position={[xOffset, 0.15, 0.2]} scale={0.15}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color="#dac8c8" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export function BrainMeter() {
  const { fear, despair, maxSanity } = useGameStore();

  // Calculate overall sanity for background effects
  const avgInsanity = (fear + despair) / 2 / maxSanity;

  return (
    <div
      className="absolute top-4 left-4 w-44 h-36 z-50 pointer-events-none"
      style={{
        filter: avgInsanity > 0.5 ? `blur(${avgInsanity}px)` : 'none',
      }}
    >
      {/* Labels above the canvas */}
      <div className="flex justify-between px-2 text-xs font-mono uppercase tracking-wider mb-1">
        <span className="text-red-700">FEAR</span>
        <span className="text-blue-700">DESPAIR</span>
      </div>

      <div className="h-24">
        <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[2, 2, 3]} intensity={0.8} />
          <pointLight position={[-2, -1, 2]} intensity={0.4} color="#ff6666" />
          <Brain3D />
        </Canvas>
      </div>

      {/* Percentage displays */}
      <div className="flex justify-between px-4 text-xs font-mono">
        <span className="text-white/70">{Math.floor(fear)}%</span>
        <span className="text-white/70">{Math.floor(despair)}%</span>
      </div>

      {/* Sanity label */}
      <div className="text-center text-white/40 font-mono text-xs uppercase tracking-widest mt-1">
        SANITY
      </div>
    </div>
  );
}
