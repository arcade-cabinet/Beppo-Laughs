import { Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../game/store';

const DOT_COLORS = [
  '#00ffff',
  '#ff00ff',
  '#ffff00',
  '#00ff00',
  '#0000ff',
  '#ff0066',
  '#66ff00',
  '#00ffaa',
  '#aa00ff',
];

const DOT_POSITIONS = [
  [-0.4, 0.09, 0.1],
  [0.4, 0.09, 0.1],
  [-0.2, 0.09, 0.35],
  [0.2, 0.09, 0.35],
  [0, 0.09, -0.15],
  [-0.5, 0.09, -0.2],
  [0.5, 0.09, -0.2],
  [-0.25, 0.09, -0.35],
  [0.25, 0.09, -0.35],
];

const RIVET_POSITIONS = [
  [-0.65, 0.08, -0.3],
  [0.65, 0.08, -0.3],
  [-0.55, 0.08, 0.25],
  [0.55, 0.08, 0.25],
  [-0.3, 0.08, -0.4],
  [0.3, 0.08, -0.4],
  [-0.7, 0.08, 0],
  [0.7, 0.08, 0],
];

const COLORS = {
  chrome: '#c0c0c0',
  gold: '#b8860b',
  redDark: '#4a0f0f',
  rust: '#7c3c21',
};

function ClownNose({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.06, 32, 32]} />
      <meshStandardMaterial
        color="#ff0000"
        emissive="#ff0000"
        emissiveIntensity={0.4}
        roughness={0.3}
        metalness={0.2}
      />
    </mesh>
  );
}

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

function SteeringWheel({ position }: { position: [number, number, number] }) {
  const wheelRef = useRef<THREE.Group>(null);
  const { carSpeed } = useGameStore();

  useFrame((state) => {
    if (wheelRef.current) {
      // Subtle vibration
      const baseVibration = 0.0005;
      const speedVibration = (carSpeed / 5) * 0.002;
      const vibration = Math.sin(state.clock.elapsedTime * 40) * (baseVibration + speedVibration);

      wheelRef.current.position.y = position[1] + vibration;
      wheelRef.current.position.x = position[0] + vibration * 0.5;

      // Rotate wheel
      const sway = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      wheelRef.current.rotation.z = sway;
    }
  });

  return (
    <group ref={wheelRef} position={position} rotation={[-0.4, 0, 0]}>
      {/* Wheel ring */}
      <mesh>
        <torusGeometry args={[0.15, 0.02, 16, 32]} />
        <meshStandardMaterial color="#1a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Chrome outer ring */}
      <mesh>
        <torusGeometry args={[0.15, 0.004, 16, 32]} />
        <meshStandardMaterial color={COLORS.chrome} metalness={0.98} roughness={0.02} />
      </mesh>

      {/* Spokes */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
          <boxGeometry args={[0.28, 0.015, 0.015]} />
          <meshStandardMaterial color={COLORS.chrome} metalness={0.95} roughness={0.1} />
        </mesh>
      ))}

      {/* Center hub */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color={COLORS.redDark} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Horn/Clown Nose Center */}
      <ClownNose position={[0, 0, 0.02]} />
    </group>
  );
}

function Lever({ position }: { position: [number, number, number] }) {
  const leverRef = useRef<THREE.Group>(null);
  const { accelerating, braking } = useGameStore();
  const [isHovered, setIsHovered] = useState(false);

  useFrame(() => {
    if (leverRef.current) {
      const targetRotation = accelerating ? -0.5 : braking ? 0.3 : 0;
      leverRef.current.rotation.x = THREE.MathUtils.lerp(
        leverRef.current.rotation.x,
        targetRotation,
        0.1,
      );
    }
  });

  return (
    <group
      ref={leverRef}
      position={position}
      onPointerOver={() => {
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setIsHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Lever base plate */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.04, 16]} />
        <meshStandardMaterial
          color={isHovered ? COLORS.gold : COLORS.chrome}
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
      <ClownNose position={[0, 0.26, 0]} />
    </group>
  );
}

export function ClownCarCockpit() {
  const { size } = useThree();
  const isPortrait = size.height > size.width;

  const fearFillRef = useRef<THREE.Mesh>(null);
  const despairFillRef = useRef<THREE.Mesh>(null);
  const cockpitRef = useRef<THREE.Group>(null);

  // InstancedMesh refs for Hood
  const dotsRef = useRef<THREE.InstancedMesh>(null);
  const rivetsRef = useRef<THREE.InstancedMesh>(null);

  // Setup instanced meshes
  useLayoutEffect(() => {
    // Setup dots
    if (dotsRef.current && typeof dotsRef.current.setMatrixAt === 'function') {
      const tempObj = new THREE.Object3D();
      DOT_POSITIONS.forEach((pos, i) => {
        tempObj.position.set(pos[0], pos[1], pos[2]);
        tempObj.updateMatrix();
        dotsRef.current?.setMatrixAt(i, tempObj.matrix);

        const dotColor = new THREE.Color(DOT_COLORS[i % DOT_COLORS.length]);
        dotsRef.current?.setColorAt(i, dotColor);
      });
      dotsRef.current.instanceMatrix.needsUpdate = true;
      if (dotsRef.current.instanceColor) dotsRef.current.instanceColor.needsUpdate = true;
    }

    // Setup rivets
    if (rivetsRef.current && typeof rivetsRef.current.setMatrixAt === 'function') {
      const tempObj = new THREE.Object3D();
      RIVET_POSITIONS.forEach((pos, i) => {
        tempObj.position.set(pos[0], pos[1], pos[2]);
        tempObj.rotation.set(0, 0, 0); // Rivets are simple cylinders
        tempObj.updateMatrix();
        rivetsRef.current?.setMatrixAt(i, tempObj.matrix);
      });
      rivetsRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  useFrame((_state) => {
    const gameState = useGameStore.getState();
    const { fear, despair, maxSanity } = gameState;

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

  const scale = 1.0;

  // Position relative to camera: Center and Bottom
  // Modified to [0, 0.05, -0.5] to fit with Camera Height 1.4 (restored from pre-PR#100)
  return (
    <group ref={cockpitRef} position={[0, 0.05, -0.5]} scale={[scale, scale, scale]}>
      {/* === DASHBOARD BASE (From Prototype Aesthetic) === */}
      <group position={[0, 0.3, -0.3]} rotation={[0.4, 0, 0]}>
        {/* Main Dashboard Block */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.15, 0.4]} />
          <meshStandardMaterial color="#2a1a1a" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Chrome Trim */}
        <mesh position={[0, 0.08, -0.05]}>
          <boxGeometry args={[1.22, 0.02, 0.42]} />
          <meshStandardMaterial color={COLORS.chrome} metalness={0.95} roughness={0.05} />
        </mesh>

        {/* Rivets along the dash */}
        {[-0.5, -0.3, -0.1, 0.1, 0.3, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.08, 0.18]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color={COLORS.chrome} metalness={0.95} roughness={0.15} />
          </mesh>
        ))}
      </group>

      {/* === METERS (From PR, embedded in dashboard) === */}
      <group position={[0, 0.32, -0.28]} rotation={[0.4, 0, 0]}>
        {/* Left Panel - FEAR Meter */}
        <DashboardPanel
          position={[-0.35, 0, 0]}
          color="#cc0000"
          label="FEAR"
          valueRef={fearFillRef}
        />

        {/* Center Panel - SPEEDOMETER */}
        <SpeedometerPanel position={[0, 0.05, -0.05]} />

        {/* Right Panel - DESPAIR Meter */}
        <DashboardPanel
          position={[0.35, 0, 0]}
          color="#0000cc"
          label="DESPAIR"
          valueRef={despairFillRef}
        />
      </group>

      {/* === STEERING WHEEL (From Prototype, Centered) === */}
      <SteeringWheel position={[0, 0.1, -0.1]} />

      {/* === LEVER (From Prototype, Right Side) === */}
      <Lever position={[0.4, -0.1, 0]} />

      {/* === HOOD (From PR, "Metal Clown Car Hood") === */}
      {/* Hidden in portrait mode for "center slice" view */}
      {!isPortrait && (
        <group position={[0, 0.0, -0.8]}>
          {/* Main hood body - curved and extended */}
          <mesh rotation={[-0.12, 0, 0]}>
            <boxGeometry args={[1.5, 0.12, 1.2]} />
            <meshStandardMaterial color="#ff4400" roughness={0.6} metalness={0.4} />
          </mesh>

          {/* Hood curve front */}
          <mesh position={[0, -0.06, 0.55]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[1.4, 0.1, 0.4]} />
            <meshStandardMaterial color="#ff3300" roughness={0.7} metalness={0.3} />
          </mesh>

          {/* Hood curve back (near player) */}
          <mesh position={[0, 0.06, -0.55]} rotation={[0.25, 0, 0]}>
            <boxGeometry args={[1.45, 0.08, 0.3]} />
            <meshStandardMaterial color="#ff5500" roughness={0.5} metalness={0.4} />
          </mesh>

          {/* Left fender */}
          <mesh position={[-0.7, 0.04, 0.2]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.3, 0.15, 1.0]} />
            <meshStandardMaterial color="#ffcc00" roughness={0.5} metalness={0.3} />
          </mesh>

          {/* Right fender */}
          <mesh position={[0.7, 0.04, 0.2]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.3, 0.15, 1.0]} />
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

          {/* Polka dots on hood - Instanced */}
          <instancedMesh ref={dotsRef} args={[undefined, undefined, DOT_POSITIONS.length]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff" // Base color, overridden by instanceColor
              roughness={0.3}
              emissive="#ffffff"
              emissiveIntensity={0.1}
            />
          </instancedMesh>

          {/* Metal blemishes/rivets - Instanced */}
          <instancedMesh ref={rivetsRef} args={[undefined, undefined, RIVET_POSITIONS.length]}>
            <cylinderGeometry args={[0.025, 0.025, 0.03, 8]} />
            <meshStandardMaterial color="#888866" roughness={0.8} metalness={0.6} />
          </instancedMesh>
        </group>
      )}

      {/* Side panels */}
      <mesh position={[-0.7, 0.15, -0.45]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.15, 0.55, 0.7]} />
        <meshStandardMaterial color="#ff6600" roughness={0.6} />
      </mesh>
      <mesh position={[0.7, 0.15, -0.45]} rotation={[0, -0.15, 0]}>
        <boxGeometry args={[0.15, 0.55, 0.7]} />
        <meshStandardMaterial color="#ff6600" roughness={0.6} />
      </mesh>

      {/* Floor / footwell */}
      <mesh position={[0, -0.2, -0.35]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[1.1, 0.06, 0.7]} />
        <meshStandardMaterial color="#1a1510" roughness={0.9} />
      </mesh>
    </group>
  );
}
