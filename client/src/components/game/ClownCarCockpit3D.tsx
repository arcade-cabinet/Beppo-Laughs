import { useFrame } from '@react-three/fiber';
import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../game/store';

// Horror color palette matching our style guide
const COLORS = {
  beige: '#c4a882',
  red: '#8b0000',
  redDark: '#4a0f0f',
  rust: '#7c3c21',
  gold: '#b8860b',
  chrome: '#c0c0c0',
  black: '#1a1510',
  tungsten: '#ffaa55',
};

// Clown nose component for lever - pulses when not engaged
function ClownNose({ position, isEngaged }: { position: [number, number, number]; isEngaged: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = isEngaged ? 1 : 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.06, 32, 32]} />
      <meshStandardMaterial
        color="#ff0000"
        emissive="#ff0000"
        emissiveIntensity={isEngaged ? 0.2 : 0.6}
        roughness={0.3}
        metalness={0.2}
      />
    </mesh>
  );
}

// Lever component - START/PAUSE control
function Lever({ isEngaged, onToggle }: { isEngaged: boolean; onToggle: () => void }) {
  const leverRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (leverRef.current) {
      const targetRotation = isEngaged ? -0.6 : 0.6;
      leverRef.current.rotation.x = THREE.MathUtils.lerp(
        leverRef.current.rotation.x,
        targetRotation,
        0.08
      );
    }
  });

  return (
    <group
      ref={leverRef}
      position={[0.35, -0.7, 0.2]}
      onClick={onToggle}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Lever base plate */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.04, 16]} />
        <meshStandardMaterial
          color={hovered ? COLORS.gold : COLORS.chrome}
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Lever shaft */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.22, 8]} />
        <meshStandardMaterial color={COLORS.rust} metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Clown nose on top */}
      <ClownNose position={[0, 0.26, 0]} isEngaged={isEngaged} />
    </group>
  );
}

// Gauge component for Fear/Despair
function SanityGauge({
  position,
  value,
  maxValue,
  color,
  label,
}: {
  position: [number, number, number];
  value: number;
  maxValue: number;
  color: string;
  label: string;
}) {
  const percent = maxValue > 0 ? value / maxValue : 0;
  const needleRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (needleRef.current) {
      // Needle rotation: -120deg (empty) to +120deg (full)
      const targetAngle = -2.1 + percent * 4.2;
      needleRef.current.rotation.z = THREE.MathUtils.lerp(
        needleRef.current.rotation.z,
        targetAngle,
        0.1
      );
    }
  });

  return (
    <group position={position} rotation={[-0.4, 0, 0]}>
      {/* Gauge face */}
      <mesh>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} />
      </mesh>

      {/* Gauge ring */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[0.07, 0.09, 32]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Danger zone arc */}
      <mesh position={[0, 0, 0.002]}>
        <ringGeometry args={[0.05, 0.065, 16, 1, 1.0, 1.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* Needle */}
      <mesh ref={needleRef} position={[0, 0, 0.003]}>
        <boxGeometry args={[0.008, 0.06, 0.002]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>

      {/* Center cap */}
      <mesh position={[0, 0, 0.004]}>
        <circleGeometry args={[0.015, 16]} />
        <meshStandardMaterial color={COLORS.chrome} metalness={0.95} />
      </mesh>
    </group>
  );
}

// Dashboard component
function Dashboard({ isEngaged }: { isEngaged: boolean }) {
  const { fear, despair, maxSanity } = useGameStore();
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = isEngaged
        ? 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.2
        : 0.3;
    }
  });

  return (
    <group position={[0, -0.85, 0.1]}>
      {/* Main dashboard panel */}
      <mesh position={[0, 0, 0]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[1.0, 0.08, 0.5]} />
        <meshStandardMaterial color="#2a1a1a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Dashboard top trim */}
      <mesh position={[0, 0.05, -0.15]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[1.02, 0.02, 0.52]} />
        <meshStandardMaterial color={COLORS.chrome} metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Fear Gauge - Left */}
      <SanityGauge
        position={[-0.3, 0.06, 0.05]}
        value={fear}
        maxValue={maxSanity}
        color={COLORS.red}
        label="FEAR"
      />

      {/* Despair Gauge - Right */}
      <SanityGauge
        position={[0.3, 0.06, 0.05]}
        value={despair}
        maxValue={maxSanity}
        color="#0000cc"
        label="DESPAIR"
      />

      {/* Status indicator light - center */}
      <mesh position={[0, 0.06, 0.08]} rotation={[-0.4, 0, 0]}>
        <circleGeometry args={[0.025, 16]} />
        <meshStandardMaterial
          color={isEngaged ? '#00ff00' : '#ff0000'}
          emissive={isEngaged ? '#00ff00' : '#ff0000'}
          emissiveIntensity={0.8}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.1, 0.1]}
        color={isEngaged ? '#00ff00' : '#ff0000'}
        intensity={0.3}
        distance={0.5}
      />

      {/* Rivets */}
      {[-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.045, -0.18]} rotation={[-0.4, 0, 0]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color={COLORS.chrome} metalness={0.95} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

// Hood component - the rusty clown car hood
function Hood() {
  return (
    <group position={[0, -0.95, 0.8]}>
      {/* Main hood shape */}
      <mesh>
        <boxGeometry args={[1.2, 0.25, 1.2]} />
        <meshStandardMaterial color={COLORS.redDark} metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Hood center bulge */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.4, 0.1, 1.0]} />
        <meshStandardMaterial color={COLORS.red} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Hood ornament - menacing clown head */}
      <group position={[0, 0.25, 0.55]}>
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffccaa" roughness={0.8} />
        </mesh>
        {/* Red nose */}
        <mesh position={[0, -0.01, 0.08]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
        {/* Sinister eyes */}
        <mesh position={[-0.025, 0.02, 0.07]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#000000" emissive="#ffff00" emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0.025, 0.02, 0.07]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#000000" emissive="#ffff00" emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* Chrome front trim */}
      <mesh position={[0, 0.14, 0.61]}>
        <boxGeometry args={[1.1, 0.03, 0.02]} />
        <meshStandardMaterial color={COLORS.chrome} metalness={0.98} roughness={0.02} />
      </mesh>

      {/* Side trim lines */}
      {[-0.35, 0, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.14, 0]}>
          <boxGeometry args={[0.03, 0.06, 1.1]} />
          <meshStandardMaterial
            color={i === 1 ? COLORS.gold : COLORS.chrome}
            metalness={0.95}
            roughness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

// Steering wheel
function SteeringWheel() {
  const wheelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
    }
  });

  return (
    <group ref={wheelRef} position={[-0.4, -0.6, 0.25]} rotation={[-0.6, 0, 0]}>
      {/* Wheel ring */}
      <mesh>
        <torusGeometry args={[0.12, 0.018, 16, 32]} />
        <meshStandardMaterial color="#1a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Chrome outer ring */}
      <mesh>
        <torusGeometry args={[0.12, 0.003, 16, 32]} />
        <meshStandardMaterial color={COLORS.chrome} metalness={0.98} roughness={0.02} />
      </mesh>

      {/* Spokes */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
          <boxGeometry args={[0.24, 0.012, 0.012]} />
          <meshStandardMaterial color={COLORS.chrome} metalness={0.95} roughness={0.1} />
        </mesh>
      ))}

      {/* Center hub */}
      <mesh>
        <cylinderGeometry args={[0.035, 0.035, 0.025, 16]} />
        <meshStandardMaterial color={COLORS.redDark} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Complete 3D Clown Car Cockpit
 *
 * This is positioned at the origin and stays fixed while the world moves past.
 * The camera is positioned behind/above looking forward at this cockpit.
 */
export function ClownCarCockpit3D() {
  const { pendingFork } = useGameStore();
  // Game is "engaged" (moving) when there's no fork choice pending
  const isEngaged = !pendingFork;

  const handleLeverToggle = useCallback(() => {
    // For now, lever just shows state - actual game control happens via fork selection
    console.log('Lever toggled, current state:', isEngaged);
  }, [isEngaged]);

  return (
    <group position={[0, 0, 0]}>
      <Dashboard isEngaged={isEngaged} />
      <Hood />
      <SteeringWheel />
      <Lever isEngaged={isEngaged} onToggle={handleLeverToggle} />
    </group>
  );
}
