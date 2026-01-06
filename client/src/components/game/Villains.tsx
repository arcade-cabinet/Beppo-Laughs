import { Billboard, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import { Color, type Group, MathUtils, type Mesh, type ShaderMaterial, type Vector3 } from 'three';
import type { MazeGeometry } from '../../game/maze/geometry';
import { useGameStore } from '../../game/store';

interface VillainsProps {
  geometry: MazeGeometry;
}

const LAUGHS = [
  'HA HA HA',
  'HEE HEE',
  'HO HO HO',
  'YOU CANNOT LEAVE',
  'BEPPO SEES YOU',
  'JOIN THE CIRCUS',
  'FOREVER LOST',
  'HONK HONK',
  'TURN BACK',
  'NO ESCAPE',
];

function SDFVillainMesh({
  position,
  isVisible,
  fearLevel,
}: {
  position: [number, number, number];
  isVisible: boolean;
  fearLevel: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const currentScale = useRef(0);

  const fragmentShader = `
    uniform float uTime;
    uniform float uFear;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    
    varying vec2 vUv;
    
    float sdSphere(vec3 p, float r) {
      return length(p) - r;
    }
    
    float sdBox(vec3 p, vec3 b) {
      vec3 q = abs(p) - b;
      return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }
    
    float opSmoothUnion(float d1, float d2, float k) {
      float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
      return mix(d2, d1, h) - k * h * (1.0 - h);
    }
    
    float opSmoothSubtraction(float d1, float d2, float k) {
      float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
      return mix(d2, -d1, h) + k * h * (1.0 - h);
    }
    
    vec3 meltDistort(vec3 p, float t, float intensity) {
      p.x += sin(p.y * 4.0 + t * 2.0) * intensity * 0.15;
      p.z += cos(p.y * 3.0 + t * 1.5) * intensity * 0.1;
      return p;
    }
    
    float hash(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }
    
    float sdClownFace(vec3 p, float t, float fear) {
      p = meltDistort(p, t, fear);
      
      float head = sdSphere(p * vec3(1.0, 0.85, 1.0), 0.45);
      
      vec3 eyeL = p - vec3(-0.12, 0.08, 0.32);
      vec3 eyeR = p - vec3(0.12, 0.08, 0.32);
      head = opSmoothSubtraction(sdSphere(eyeL, 0.1), head, 0.04);
      head = opSmoothSubtraction(sdSphere(eyeR, 0.1), head, 0.04);
      
      float eyeScale = 0.06 + fear * 0.03;
      float eyes = min(sdSphere(eyeL, eyeScale), sdSphere(eyeR, eyeScale));
      
      vec3 noseP = p - vec3(0.0, -0.02, 0.4);
      float noseSize = 0.1 + sin(t * 6.0) * 0.015 * fear;
      float nose = sdSphere(noseP, noseSize);
      head = opSmoothUnion(head, nose, 0.06);
      
      vec3 mouthP = p - vec3(0.0, -0.18, 0.28);
      mouthP.x *= 0.5 + fear * 0.25;
      float mouth = sdBox(mouthP, vec3(0.22 + fear * 0.1, 0.04, 0.08));
      head = opSmoothSubtraction(mouth, head, 0.04);
      
      return opSmoothUnion(head, eyes * 0.5, 0.02);
    }
    
    float sdVillain(vec3 p, float t, float fear) {
      vec3 headP = p - vec3(0.0, 0.55, 0.0);
      float d = sdClownFace(headP, t, fear);
      
      vec3 bodyP = p - vec3(0.0, 0.0, 0.0);
      bodyP = meltDistort(bodyP, t * 0.5, fear * 0.4);
      float body = sdBox(bodyP * vec3(1.0, 0.6, 1.0), vec3(0.2, 0.4, 0.15));
      d = opSmoothUnion(d, body, 0.12);
      
      d += (hash(p * 15.0 + t) - 0.5) * 0.01 * (1.0 + fear);
      
      return d;
    }
    
    vec3 calcNormal(vec3 p, float t, float fear) {
      float h = 0.001;
      vec2 k = vec2(1.0, -1.0);
      return normalize(
        k.xyy * sdVillain(p + k.xyy * h, t, fear) +
        k.yyx * sdVillain(p + k.yyx * h, t, fear) +
        k.yxy * sdVillain(p + k.yxy * h, t, fear) +
        k.xxx * sdVillain(p + k.xxx * h, t, fear)
      );
    }
    
    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      vec3 ro = vec3(0.0, 0.3, 2.0);
      vec3 rd = normalize(vec3(uv * 0.7, -1.0));
      
      float t = 0.0;
      float d;
      vec3 p;
      
      for (int i = 0; i < 48; i++) {
        p = ro + rd * t;
        d = sdVillain(p, uTime, uFear);
        if (d < 0.002 || t > 8.0) break;
        t += d * 0.9;
      }
      
      if (t < 8.0) {
        vec3 normal = calcNormal(p, uTime, uFear);
        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
        
        float diff = max(dot(normal, lightDir), 0.0);
        float spec = pow(max(dot(reflect(-lightDir, normal), -rd), 0.0), 16.0);
        float rim = pow(1.0 - max(dot(normal, -rd), 0.0), 2.5);
        
        vec3 color = mix(uColor1, uColor2, p.y + 0.3);
        
        float pulse = sin(uTime * 4.0) * 0.5 + 0.5;
        
        vec3 finalColor = color * (0.25 + diff * 0.5);
        finalColor += vec3(1.0, 0.8, 0.6) * spec * 0.25;
        finalColor += uColor1 * rim * 0.5;
        finalColor += uColor1 * pulse * uFear * 0.2;
        
        if (p.y > 0.5 && abs(p.x) < 0.15 && p.z > 0.3) {
          finalColor += vec3(1.0, 0.0, 0.0) * 0.5;
        }
        
        gl_FragColor = vec4(finalColor, 1.0);
      } else {
        discard;
      }
    }
  `;

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFear: { value: 0 },
      uColor1: { value: new Color('#8b0000') },
      uColor2: { value: new Color('#ffcc00') },
    }),
    [],
  );

  useFrame((state) => {
    if (!materialRef.current || !meshRef.current) return;

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uFear.value = MathUtils.lerp(
      materialRef.current.uniforms.uFear.value,
      isVisible ? fearLevel : 0,
      0.05,
    );

    const targetScale = isVisible ? 1.8 + Math.sin(state.clock.elapsedTime * 6) * 0.1 : 0;
    currentScale.current = MathUtils.lerp(currentScale.current, targetScale, 0.08);

    meshRef.current.scale.set(currentScale.current, currentScale.current * 1.2, 1);

    meshRef.current.visible = currentScale.current > 0.05;
  });

  return (
    <Billboard follow={true}>
      <mesh ref={meshRef} position={position}>
        <planeGeometry args={[2, 2.5]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>
    </Billboard>
  );
}

function Villain({
  worldX,
  worldZ,
  playerPos,
}: {
  worldX: number;
  worldZ: number;
  playerPos: Vector3;
}) {
  const groupRef = useRef<Group>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasPopped, setHasPopped] = useState(false);
  const { fear, maxSanity, increaseFear } = useGameStore();

  const laughText = useMemo(() => LAUGHS[Math.floor(Math.random() * LAUGHS.length)], []);
  const fearLevel = fear / maxSanity;

  useFrame((state) => {
    if (!groupRef.current) return;

    const dist = groupRef.current.position.distanceTo(playerPos);

    if (dist < 5 && !hasPopped) {
      setHasPopped(true);
      setIsVisible(true);
      increaseFear(15);

      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 200]);
      }
    }

    if (isVisible) {
      groupRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 20) * 0.06;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 15) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[worldX, 1.5, worldZ]}>
      <SDFVillainMesh position={[0, 0, 0]} isVisible={isVisible} fearLevel={fearLevel} />

      {isVisible && (
        <Billboard>
          <Text
            position={[0.8, 2.2, 0]}
            fontSize={0.45}
            color={isBlocked ? '#ff0000' : '#8b0000'}
            anchorX="center"
          >
            {laughText}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

export function Villains({ geometry }: VillainsProps) {
  const { camera } = useThree();

  const villains = useMemo(() => {
    const spawned: { worldX: number; worldZ: number; cellKey: string }[] = [];
    const nodes = Array.from(geometry.railNodes.values());
    const count = Math.floor(nodes.length / 8);

    const avoidNodes = new Set([geometry.centerNodeId, ...geometry.exitNodeIds]);

    for (let i = 0; i < count; i++) {
      let selectedNode: (typeof nodes)[0] | null = null;
      let attempts = 0;
      do {
        const idx = Math.floor(Math.random() * nodes.length);
        selectedNode = nodes[idx];
        attempts++;
      } while (
        selectedNode &&
        (avoidNodes.has(selectedNode.id) || spawned.some((v) => v.cellKey === selectedNode?.id)) &&
        attempts < 50
      );

      if (attempts < 50 && selectedNode) {
        spawned.push({
          worldX: selectedNode.worldX,
          worldZ: selectedNode.worldZ,
          cellKey: selectedNode.id,
        });
      }
    }
    return spawned;
  }, [geometry]);

  return (
    <group>
      {villains.map((v) => (
        <Villain key={v.cellKey} worldX={v.worldX} worldZ={v.worldZ} playerPos={camera.position} />
      ))}
    </group>
  );
}
