import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { ShaderMaterial, Color, Vector3, MathUtils } from 'three';
import { useGameStore } from '../../game/store';

// SDF Ray Marching Material
const SDFVillainMaterial = shaderMaterial(
  {
    uTime: 0,
    uFearLevel: 0,
    uColor1: new Color('#8b0000'),
    uColor2: new Color('#ffcc00'),
    uColor3: new Color('#1a1a1a'),
    uCameraPos: new Vector3(0, 0, 5),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform float uFearLevel;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uCameraPos;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Signed Distance Functions
    float sdSphere(vec3 p, float r) {
      return length(p) - r;
    }
    
    float sdBox(vec3 p, vec3 b) {
      vec3 q = abs(p) - b;
      return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }
    
    float sdCylinder(vec3 p, float h, float r) {
      vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
      return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
    }
    
    float opSmoothUnion(float d1, float d2, float k) {
      float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
      return mix(d2, d1, h) - k * h * (1.0 - h);
    }
    
    float opSmoothSubtraction(float d1, float d2, float k) {
      float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
      return mix(d2, -d1, h) + k * h * (1.0 - h);
    }
    
    // Melting distortion
    vec3 meltDistort(vec3 p, float time, float intensity) {
      float melt = sin(p.y * 3.0 + time) * intensity;
      melt += sin(p.x * 5.0 + time * 1.3) * intensity * 0.5;
      p.x += melt * 0.1;
      p.z += cos(p.y * 4.0 + time * 0.7) * intensity * 0.1;
      return p;
    }
    
    // Noise
    float hash(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }
    
    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
    }
    
    // Clown face
    float sdClownFace(vec3 p, float time, float fear) {
      float distortion = fear * 0.5;
      p = meltDistort(p, time, distortion);
      
      // Head
      float head = sdSphere(p * vec3(1.0, 0.85, 1.0), 0.5);
      
      // Eye sockets
      vec3 eyeL = p - vec3(-0.15, 0.1, 0.35);
      vec3 eyeR = p - vec3(0.15, 0.1, 0.35);
      head = opSmoothSubtraction(sdSphere(eyeL, 0.12), head, 0.05);
      head = opSmoothSubtraction(sdSphere(eyeR, 0.12), head, 0.05);
      
      // Bulging eyeballs
      float eyeScale = 0.08 + distortion * 0.04;
      float eyes = min(sdSphere(eyeL, eyeScale), sdSphere(eyeR, eyeScale));
      
      // Nose
      vec3 noseP = p - vec3(0.0, -0.05, 0.45);
      float nose = sdSphere(noseP, 0.12 + sin(time * 5.0) * 0.02 * distortion);
      head = opSmoothUnion(head, nose, 0.08);
      
      // Wide grin
      vec3 mouthP = p - vec3(0.0, -0.22, 0.3);
      mouthP.x *= 0.5 + distortion * 0.3;
      float mouth = sdBox(mouthP, vec3(0.28 + distortion * 0.12, 0.06, 0.12));
      head = opSmoothSubtraction(mouth, head, 0.06);
      
      return opSmoothUnion(head, eyes, 0.02);
    }
    
    // Full villain
    float sdVillain(vec3 p, float time, float fear) {
      float d = 1e10;
      
      // Head
      vec3 headP = p - vec3(0.0, 0.8, 0.0);
      d = sdClownFace(headP, time, fear);
      
      // Body
      vec3 bodyP = p - vec3(0.0, 0.2, 0.0);
      bodyP = meltDistort(bodyP, time * 0.5, fear * 0.3);
      float body = sdCylinder(bodyP, 0.4, 0.25);
      d = opSmoothUnion(d, body, 0.15);
      
      // Organic noise
      d += noise(p * 10.0 + time) * 0.015 * (1.0 + fear);
      
      return d;
    }
    
    vec3 calcNormal(vec3 p, float time, float fear) {
      const float h = 0.001;
      vec2 k = vec2(1.0, -1.0);
      return normalize(
        k.xyy * sdVillain(p + k.xyy * h, time, fear) +
        k.yyx * sdVillain(p + k.yyx * h, time, fear) +
        k.yxy * sdVillain(p + k.yxy * h, time, fear) +
        k.xxx * sdVillain(p + k.xxx * h, time, fear)
      );
    }
    
    void main() {
      // Ray setup
      vec2 uv = vUv * 2.0 - 1.0;
      vec3 ro = vec3(0.0, 0.5, 2.5);
      vec3 rd = normalize(vec3(uv * 0.8, -1.0));
      
      // Ray march
      float t = 0.0;
      float d;
      vec3 p;
      
      for (int i = 0; i < 64; i++) {
        p = ro + rd * t;
        d = sdVillain(p, uTime, uFearLevel);
        if (d < 0.001 || t > 10.0) break;
        t += d * 0.8;
      }
      
      if (t < 10.0) {
        vec3 normal = calcNormal(p, uTime, uFearLevel);
        
        // Lighting
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diff = max(dot(normal, lightDir), 0.0);
        float spec = pow(max(dot(reflect(-lightDir, normal), -rd), 0.0), 32.0);
        
        // Color based on position and fear
        vec3 color = mix(uColor1, uColor2, p.y * 0.5 + 0.5);
        color = mix(color, uColor3, uFearLevel * 0.3);
        
        // Rim lighting
        float rim = 1.0 - max(dot(normal, -rd), 0.0);
        rim = pow(rim, 3.0);
        
        vec3 finalColor = color * (0.2 + diff * 0.6) + vec3(1.0, 0.9, 0.8) * spec * 0.3;
        finalColor += uColor1 * rim * 0.4;
        
        // Pulsing glow at high fear
        finalColor += uColor1 * (sin(uTime * 5.0) * 0.5 + 0.5) * uFearLevel * 0.3;
        
        gl_FragColor = vec4(finalColor, 1.0);
      } else {
        discard;
      }
    }
  `
);

extend({ SDFVillainMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      sDFVillainMaterial: any;
    }
  }
}

interface SDFVillainProps {
  position: [number, number, number];
  isActive: boolean;
}

export function SDFVillain({ position, isActive }: SDFVillainProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const { fear, maxSanity } = useGameStore();
  const { camera } = useThree();
  
  const fearLevel = fear / maxSanity;
  
  useFrame((state) => {
    if (!materialRef.current) return;
    
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uFearLevel.value = MathUtils.lerp(
      materialRef.current.uniforms.uFearLevel.value,
      isActive ? fearLevel : 0,
      0.05
    );
    materialRef.current.uniforms.uCameraPos.value.copy(camera.position);
  });
  
  if (!isActive) return null;
  
  return (
    <mesh position={position}>
      <planeGeometry args={[3, 4]} />
      <sDFVillainMaterial ref={materialRef} transparent />
    </mesh>
  );
}

// Marching cubes for 3D blob effects
export function MarchingCubesBlob({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  const meshRef = useRef<any>(null);
  const { fear, maxSanity } = useGameStore();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Pulsing effect
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    meshRef.current.scale.setScalar(scale * pulse);
    
    // Wobble
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
    meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.7) * 0.1;
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.5, 3]} />
      <meshStandardMaterial 
        color="#8b0000"
        roughness={0.3}
        metalness={0.1}
        emissive="#ff0000"
        emissiveIntensity={fear / maxSanity * 0.3}
      />
    </mesh>
  );
}
