import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../game/store';

function DashboardPanel({
  position,
  color,
  label,
  valueRef,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  valueRef: React.MutableRefObject<THREE.Mesh | null>;
}) {
  return (
    <group position={position}>
      {/* Panel backing */}
      <mesh rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.35, 0.25, 0.02]} />
        <meshStandardMaterial color="#1a1510" roughness={0.9} />
      </mesh>

      {/* Panel glass/screen */}
      <mesh position={[0, 0, 0.012]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.32, 0.22, 0.005]} />
        <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Fill bar background */}
      <mesh position={[0, -0.02, 0.018]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.28, 0.12, 0.003]} />
        <meshStandardMaterial color="#222222" roughness={0.8} />
      </mesh>

      {/* Fill bar (dynamic) */}
      <mesh ref={valueRef} position={[0, -0.02, 0.022]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.28, 0.12, 0.003]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.08, 0.02]}
        rotation={[-0.3, 0, 0]}
        fontSize={0.035}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Creepster-Regular.ttf"
      >
        {label}
      </Text>
    </group>
  );
}

function SpeedometerPanel({ position }: { position: [number, number, number] }) {
  type SpeedText = THREE.Mesh & { text: string };
  const speedTextRef = useRef<SpeedText>(null);
  const needleRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const { carSpeed } = useGameStore.getState();

    // Update speed text
    if (speedTextRef.current) {
      speedTextRef.current.text = Math.round(carSpeed * 20).toString();
    }

    // Update needle rotation (0-5 speed maps to 0.8 to -0.8 radians)
    if (needleRef.current) {
      const targetRotation = 0.8 - (carSpeed / 5) * 1.6;
      needleRef.current.rotation.z = THREE.MathUtils.lerp(
        needleRef.current.rotation.z,
        targetRotation,
        0.15,
      );
    }
  });

  return (
    <group position={position}>
      {/* Panel backing */}
      <mesh rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.02]} />
        <meshStandardMaterial color="#1a1510" roughness={0.9} />
      </mesh>

      {/* Speedometer face */}
      <mesh position={[0, 0, 0.012]} rotation={[-0.3, 0, 0]}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.3} />
      </mesh>

      {/* Speed arc marks */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = 0.8 - (i / 5) * 1.6;
        const x = Math.sin(angle) * 0.1;
        const y = Math.cos(angle) * 0.1;
        return (
          <mesh key={`mark-${i}`} position={[x, y, 0.02]} rotation={[-0.3, 0, angle]}>
            <boxGeometry args={[0.008, 0.025, 0.002]} />
            <meshStandardMaterial
              color={i < 3 ? '#00ff00' : i < 4 ? '#ffff00' : '#ff0000'}
              emissive={i < 3 ? '#00ff00' : i < 4 ? '#ffff00' : '#ff0000'}
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}

      {/* Needle */}
      <mesh ref={needleRef} position={[0, 0, 0.025]} rotation={[-0.3, 0, 0.8]}>
        <boxGeometry args={[0.01, 0.09, 0.003]} />
        <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={0.5} />
      </mesh>

      {/* Center cap */}
      <mesh position={[0, 0, 0.03]} rotation={[-0.3, 0, 0]}>
        <circleGeometry args={[0.015, 16]} />
        <meshStandardMaterial color="#ffcc00" metalness={0.8} />
      </mesh>

      {/* Digital speed display */}
      <Text
        ref={speedTextRef}
        position={[0, -0.1, 0.02]}
        rotation={[-0.3, 0, 0]}
        fontSize={0.045}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
      >
        0
      </Text>

      {/* SPEED label */}
      <Text
        position={[0, 0.12, 0.02]}
        rotation={[-0.3, 0, 0]}
        fontSize={0.025}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        SPEED
      </Text>
    </group>
  );
}

export function ClownCarCockpit() {
  const leverRef = useRef<THREE.Group>(null);
  const fearFillRef = useRef<THREE.Mesh>(null);
  const despairFillRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const state = useGameStore.getState();
    const { accelerating, braking, fear, despair, maxSanity } = state;

    if (leverRef.current) {
      const targetRotation = accelerating ? -0.5 : braking ? 0.2 : -0.1;
      leverRef.current.rotation.x = THREE.MathUtils.lerp(
        leverRef.current.rotation.x,
        targetRotation,
        0.15,
      );
    }

    // Update fear meter fill (scale X based on percentage)
    if (fearFillRef.current) {
      const fearPercent = fear / maxSanity;
      fearFillRef.current.scale.x = Math.max(0.01, fearPercent);
      fearFillRef.current.position.x = -0.14 * (1 - fearPercent);
    }

    // Update despair meter fill
    if (despairFillRef.current) {
      const despairPercent = despair / maxSanity;
      despairFillRef.current.scale.x = Math.max(0.01, despairPercent);
      despairFillRef.current.position.x = -0.14 * (1 - despairPercent);
    }
  });

  const scale = 2.5;

  // Position relative to camera: Y=-0.6 (below), Z=-0.5 (in front, camera looks -Z)
  return (
    <group position={[0, -0.6, -0.5]} scale={[scale, scale, scale]}>
      {/* === 3D DASHBOARD PANELS === */}
      <group position={[0, 0.45, -0.35]}>
        {/* Left Panel - FEAR Meter */}
        <DashboardPanel
          position={[-0.42, 0, 0]}
          color="#cc0000"
          label="FEAR"
          valueRef={fearFillRef}
        />

        {/* Center Panel - SPEEDOMETER */}
        <SpeedometerPanel position={[0, 0.02, 0]} />

        {/* Right Panel - DESPAIR Meter */}
        <DashboardPanel
          position={[0.42, 0, 0]}
          color="#0000cc"
          label="DESPAIR"
          valueRef={despairFillRef}
        />
      </group>

      {/* Clown Car Hood - Garish curved metal with blemishes */}
      <group position={[0, 0.15, -0.9]}>
        {/* Main hood body - curved and extended */}
        <mesh rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[1.8, 0.12, 1.2]} />
          <meshStandardMaterial color="#ff4400" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Hood curve front */}
        <mesh position={[0, -0.06, 0.55]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[1.7, 0.1, 0.4]} />
          <meshStandardMaterial color="#ff3300" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* Hood curve back (near player) */}
        <mesh position={[0, 0.06, -0.55]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[1.75, 0.08, 0.3]} />
          <meshStandardMaterial color="#ff5500" roughness={0.5} metalness={0.4} />
        </mesh>

        {/* Left fender - larger */}
        <mesh position={[-0.8, 0.04, 0.2]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.35, 0.15, 1.0]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.5} metalness={0.3} />
        </mesh>

        {/* Right fender - larger */}
        <mesh position={[0.8, 0.04, 0.2]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.35, 0.15, 1.0]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.5} metalness={0.3} />
        </mesh>

        {/* Hood ornament - Larger Clown face */}
        <mesh position={[0, 0.12, 0.5]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffddcc" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.22, 0.5]}>
          <coneGeometry args={[0.08, 0.15, 8]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.06, 0.58]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>

        {/* Polka dots on hood - larger and more visible */}
        {[
          [-0.4, 0.09, 0.1],
          [0.4, 0.09, 0.1],
          [-0.2, 0.09, 0.35],
          [0.2, 0.09, 0.35],
          [0, 0.09, -0.15],
          [-0.5, 0.09, -0.2],
          [0.5, 0.09, -0.2],
          [-0.25, 0.09, -0.35],
          [0.25, 0.09, -0.35],
        ].map((pos) => (
          <mesh key={`dot-${pos.join('-')}`} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color={
                [
                  '#00ffff',
                  '#ff00ff',
                  '#ffff00',
                  '#00ff00',
                  '#0000ff',
                  '#ff0066',
                  '#66ff00',
                  '#00ffaa',
                  '#aa00ff',
                ][i]
              }
              roughness={0.3}
              emissive={
                [
                  '#00ffff',
                  '#ff00ff',
                  '#ffff00',
                  '#00ff00',
                  '#0000ff',
                  '#ff0066',
                  '#66ff00',
                  '#00ffaa',
                  '#aa00ff',
                ][i]
              }
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}

        {/* Metal blemishes/rivets - larger */}
        {[
          [-0.65, 0.08, -0.3],
          [0.65, 0.08, -0.3],
          [-0.55, 0.08, 0.25],
          [0.55, 0.08, 0.25],
          [-0.3, 0.08, -0.4],
          [0.3, 0.08, -0.4],
          [-0.7, 0.08, 0],
          [0.7, 0.08, 0],
        ].map((pos) => (
          <mesh key={`rivet-${pos.join('-')}`} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.025, 0.025, 0.03, 8]} />
            <meshStandardMaterial color="#888866" roughness={0.8} metalness={0.6} />
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

      {/* Central drive lever */}
      <group ref={leverRef} position={[0, -0.05, -0.25]} rotation={[-0.1, 0, 0]}>
        {/* Base plate */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 24]} />
          <meshStandardMaterial color="#3b1c0a" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Lever shaft */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.03, 0.35, 12]} />
          <meshStandardMaterial color="#d45b00" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Accent rings */}
        {[0.04, 0.12, 0.2].map((y) => (
          <mesh key={`ring-${y}`} position={[0, y, 0]}>
            <torusGeometry args={[0.05, 0.01, 8, 24]} />
            <meshStandardMaterial color="#f5c400" emissive="#f5c400" emissiveIntensity={0.25} />
          </mesh>
        ))}
        {/* Clown nose topper */}
        <mesh position={[0, 0.24, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#dd0000" emissive="#dd0000" emissiveIntensity={0.45} />
        </mesh>
      </group>
    </group>
  );
}
