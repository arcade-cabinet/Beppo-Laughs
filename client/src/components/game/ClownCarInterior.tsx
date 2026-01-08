import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../game/store';

// Horror clown car color palette
const COLORS = {
  dashboard: '#2a1a1a',
  rustyRed: '#7c3c21',
  hoodRed: '#8b0000',
  chrome: '#c0c0c0',
  gold: '#b8860b',
  black: '#0a0a0a',
};

/**
 * First-person car interior - positioned relative to camera.
 * This creates the feeling of sitting in a driver's seat.
 */
/**
 * GPS/Map display - renders minimap as a texture on the dashboard
 */
function GPSDisplay({ position }: { position: [number, number, number] }) {
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const { pathHistory, currentNode, visitedCells, fear, despair, maxSanity } = useGameStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 256;
    canvas.height = 256;

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    textureRef.current = texture;

    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).map = texture;
      (meshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
  }, []);

  useFrame(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !textureRef.current) return;

    const size = 256;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size, size);

    if (pathHistory.length === 0) return;

    // Calculate bounds
    const xs = pathHistory.map((p) => p.x);
    const zs = pathHistory.map((p) => p.z);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);

    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const maxRange = Math.max(rangeX, rangeZ);
    const padding = 20;
    const scale = (size - padding * 2) / maxRange;

    const toCanvas = (x: number, z: number) => ({
      x: ((x - minX) * scale) + padding,
      y: ((z - minZ) * scale) + padding,
    });

    // Memory fade
    const avgInsanity = maxSanity > 0 ? (fear + despair) / (2 * maxSanity) : 0;
    const baseOpacity = Math.max(0.3, 1 - avgInsanity * 0.6);

    // Draw path segments
    for (let i = 1; i < pathHistory.length; i++) {
      const from = pathHistory[i - 1];
      const to = pathHistory[i];
      const fromCanvas = toCanvas(from.x, from.z);
      const toCanvas = toCanvas(to.x, to.z);

      const toNodeId = `${to.x},${to.z}`;
      const visitCount = visitedCells.get(toNodeId)?.visitCount || 1;
      const lineWidth = Math.min(2 + visitCount * 0.8, 6);

      const ageFactor = i / pathHistory.length;
      const opacity = baseOpacity * (0.4 + ageFactor * 0.6);

      ctx.strokeStyle = `rgba(255, 80, 80, ${opacity})`;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(fromCanvas.x, fromCanvas.y);
      ctx.lineTo(toCanvas.x, toCanvas.y);
      ctx.stroke();
    }

    // Draw current position - blinking red nose
    if (currentNode) {
      const [xStr, zStr] = currentNode.split(',');
      const x = parseInt(xStr, 10);
      const z = parseInt(zStr, 10);
      const currentPos = toCanvas(x, z);

      const blink = Math.sin(Date.now() / 200) * 0.5 + 0.5;

      // Glow
      const gradient = ctx.createRadialGradient(
        currentPos.x, currentPos.y, 0,
        currentPos.x, currentPos.y, 12
      );
      gradient.addColorStop(0, `rgba(255, 0, 0, ${blink * 0.8})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(currentPos.x, currentPos.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Red nose
      ctx.fillStyle = `rgba(255, 0, 0, ${0.9 + blink * 0.1})`;
      ctx.beginPath();
      ctx.arc(currentPos.x, currentPos.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${blink * 0.7})`;
      ctx.beginPath();
      ctx.arc(currentPos.x - 3, currentPos.y - 3, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    textureRef.current.needsUpdate = true;
  });

  return (
    <group position={position}>
      {/* Screen bezel */}
      <mesh rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.36, 0.36, 0.03]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Screen display */}
      <mesh ref={meshRef} position={[0, 0, 0.016]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[0.32, 0.32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ff4400"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

export function ClownCarInterior() {
  const steeringWheelRef = useRef<THREE.Group>(null);
  const leftGaugeNeedleRef = useRef<THREE.Mesh>(null);
  const rightGaugeNeedleRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const { fear, despair, maxSanity } = useGameStore.getState();

    // Subtle steering wheel idle animation
    if (steeringWheelRef.current) {
      steeringWheelRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }

    // Fear gauge needle (left)
    if (leftGaugeNeedleRef.current) {
      const fearPercent = maxSanity > 0 ? fear / maxSanity : 0;
      const targetAngle = -2.1 + fearPercent * 4.2; // -120deg to +120deg
      leftGaugeNeedleRef.current.rotation.z = THREE.MathUtils.lerp(
        leftGaugeNeedleRef.current.rotation.z,
        targetAngle,
        0.1
      );
    }

    // Despair gauge needle (right)
    if (rightGaugeNeedleRef.current) {
      const despairPercent = maxSanity > 0 ? despair / maxSanity : 0;
      const targetAngle = -2.1 + despairPercent * 4.2;
      rightGaugeNeedleRef.current.rotation.z = THREE.MathUtils.lerp(
        rightGaugeNeedleRef.current.rotation.z,
        targetAngle,
        0.1
      );
    }
  });

  return (
    <group>
      {/* === DASHBOARD (below eye level, close to camera) === */}
      <group position={[0, -0.4, -0.6]}>
        {/* Main dashboard panel */}
        <mesh position={[0, 0, 0]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[2.2, 0.35, 0.15]} />
          <meshStandardMaterial color={COLORS.dashboard} roughness={0.7} />
        </mesh>

        {/* Left gauge (FEAR) */}
        <group position={[-0.5, 0.15, 0.08]}>
          {/* Gauge face */}
          <mesh rotation={[-0.3, 0, 0]}>
            <circleGeometry args={[0.12, 32]} />
            <meshStandardMaterial color={COLORS.black} roughness={0.3} />
          </mesh>
          {/* Gold ring */}
          <mesh position={[0, 0, 0.001]} rotation={[-0.3, 0, 0]}>
            <ringGeometry args={[0.11, 0.13, 32]} />
            <meshStandardMaterial color={COLORS.gold} metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Red danger zone arc */}
          <mesh position={[0, 0, 0.002]} rotation={[-0.3, 0, Math.PI + 0.6]}>
            <ringGeometry args={[0.08, 0.1, 16, 1, 0, 1.2]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Needle */}
          <mesh
            ref={leftGaugeNeedleRef}
            position={[0, 0, 0.003]}
            rotation={[-0.3, 0, -2.1]}
          >
            <boxGeometry args={[0.008, 0.09, 0.002]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>
          {/* Center cap */}
          <mesh position={[0, 0, 0.004]} rotation={[-0.3, 0, 0]}>
            <circleGeometry args={[0.015, 16]} />
            <meshStandardMaterial color={COLORS.chrome} metalness={0.95} />
          </mesh>
        </group>

        {/* Right gauge (DESPAIR) */}
        <group position={[0.5, 0.15, 0.08]}>
          {/* Gauge face */}
          <mesh rotation={[-0.3, 0, 0]}>
            <circleGeometry args={[0.12, 32]} />
            <meshStandardMaterial color={COLORS.black} roughness={0.3} />
          </mesh>
          {/* Gold ring */}
          <mesh position={[0, 0, 0.001]} rotation={[-0.3, 0, 0]}>
            <ringGeometry args={[0.11, 0.13, 32]} />
            <meshStandardMaterial color={COLORS.gold} metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Blue danger zone arc */}
          <mesh position={[0, 0, 0.002]} rotation={[-0.3, 0, Math.PI + 0.6]}>
            <ringGeometry args={[0.08, 0.1, 16, 1, 0, 1.2]} />
            <meshStandardMaterial
              color="#0000ff"
              emissive="#0000ff"
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Needle */}
          <mesh
            ref={rightGaugeNeedleRef}
            position={[0, 0, 0.003]}
            rotation={[-0.3, 0, -2.1]}
          >
            <boxGeometry args={[0.008, 0.09, 0.002]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>
          {/* Center cap */}
          <mesh position={[0, 0, 0.004]} rotation={[-0.3, 0, 0]}>
            <circleGeometry args={[0.015, 16]} />
            <meshStandardMaterial color={COLORS.chrome} metalness={0.95} />
          </mesh>
        </group>

        {/* Center GPS/Map Display */}
        <GPSDisplay position={[0, 0.15, 0.08]} />

        {/* Dashboard top trim */}
        <mesh position={[0, 0.19, 0]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[2.2, 0.02, 0.16]} />
          <meshStandardMaterial color={COLORS.chrome} metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* === STEERING WHEEL (lower center, at arm's reach) === */}
      <group ref={steeringWheelRef} position={[0, -0.5, -0.75]} rotation={[-0.5, 0, 0]}>
        {/* Wheel rim - textured for grip */}
        <mesh>
          <torusGeometry args={[0.25, 0.025, 16, 32]} />
          <meshStandardMaterial color="#1a0a0a" roughness={0.8} />
        </mesh>

        {/* Chrome outer ring */}
        <mesh>
          <torusGeometry args={[0.25, 0.005, 16, 32]} />
          <meshStandardMaterial color={COLORS.chrome} metalness={0.98} roughness={0.02} />
        </mesh>

        {/* Three spokes */}
        {[0, 120, 240].map((angle) => (
          <mesh
            key={angle}
            rotation={[0, 0, (angle * Math.PI) / 180]}
          >
            <boxGeometry args={[0.5, 0.02, 0.015]} />
            <meshStandardMaterial color={COLORS.chrome} metalness={0.95} roughness={0.1} />
          </mesh>
        ))}

        {/* Center hub with clown nose */}
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
          <meshStandardMaterial color={COLORS.rustyRed} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Clown nose on hub */}
        <mesh position={[0, 0, 0.03]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* === HOOD (extending forward from bottom of view) === */}
      <group position={[0, -0.55, -1.2]}>
        {/* Main hood surface - curves down naturally */}
        <mesh rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[1.8, 0.3, 1.8]} />
          <meshStandardMaterial color={COLORS.hoodRed} roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Hood curve (front edge) */}
        <mesh position={[0, -0.12, 0.85]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[1.7, 0.15, 0.3]} />
          <meshStandardMaterial color="#6a0000" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Center hood bulge (engine) */}
        <mesh position={[0, 0.08, 0]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[0.6, 0.15, 1.5]} />
          <meshStandardMaterial color="#8b0000" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Hood ornament - Sinister clown head */}
        <group position={[0, 0.2, 0.7]}>
          {/* Head */}
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffccaa" roughness={0.7} />
          </mesh>
          {/* Red nose */}
          <mesh position={[0, -0.02, 0.1]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Evil eyes */}
          <mesh position={[-0.03, 0.02, 0.09]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial
              color="#000000"
              emissive="#ffff00"
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0.03, 0.02, 0.09]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial
              color="#000000"
              emissive="#ffff00"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>

        {/* Chrome hood trim (front edge) */}
        <mesh position={[0, -0.05, 0.9]}>
          <boxGeometry args={[1.6, 0.03, 0.03]} />
          <meshStandardMaterial color={COLORS.chrome} metalness={0.98} roughness={0.02} />
        </mesh>
      </group>

      {/* === LEFT A-PILLAR & SIDE PANEL (peripheral vision) === */}
      <group position={[-1.2, 0, -0.4]}>
        {/* A-pillar */}
        <mesh rotation={[0, -0.2, 0]}>
          <boxGeometry args={[0.15, 1.8, 0.1]} />
          <meshStandardMaterial color={COLORS.rustyRed} roughness={0.6} />
        </mesh>
        {/* Side panel */}
        <mesh position={[0.05, -0.4, -0.3]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[0.08, 0.8, 0.6]} />
          <meshStandardMaterial color="#ff5500" roughness={0.5} />
        </mesh>
      </group>

      {/* === RIGHT A-PILLAR & SIDE PANEL === */}
      <group position={[1.2, 0, -0.4]}>
        {/* A-pillar */}
        <mesh rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.15, 1.8, 0.1]} />
          <meshStandardMaterial color={COLORS.rustyRed} roughness={0.6} />
        </mesh>
        {/* Side panel */}
        <mesh position={[-0.05, -0.4, -0.3]} rotation={[0, 0.15, 0]}>
          <boxGeometry args={[0.08, 0.8, 0.6]} />
          <meshStandardMaterial color="#ff5500" roughness={0.5} />
        </mesh>
      </group>

      {/* === SUBTLE AMBIENT LIGHT for interior === */}
      <pointLight
        position={[0, -0.3, -0.5]}
        intensity={0.3}
        distance={2}
        color="#ff8844"
      />
    </group>
  );
}
