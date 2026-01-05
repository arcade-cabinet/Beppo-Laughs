import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/store';
import { MazeGeometry } from '../../game/maze/geometry';

interface HintOverlayProps {
  geometry: MazeGeometry;
}

function ClownFootprint({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.9;
      meshRef.current.scale.setScalar(pulse);
    }
    if (glowRef.current) {
      glowRef.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
    }
  });
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <pointLight ref={glowRef} position={[0, 0.3, 0]} color="#ff4488" intensity={0.5} distance={3} />
      
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.8, 1.2]} />
        <meshBasicMaterial 
          color="#ff2266"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.15, 0.01, -0.7]}>
        <circleGeometry args={[0.15, 16]} />
        <meshBasicMaterial color="#ff4488" transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -0.75]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#ff4488" transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.15, 0.01, -0.7]}>
        <circleGeometry args={[0.15, 16]} />
        <meshBasicMaterial color="#ff4488" transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.01, -0.55]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#ff4488" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.3, 0.01, -0.55]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#ff4488" transparent opacity={0.6} />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.6, 0.9, 32]} />
        <meshBasicMaterial 
          color="#ff66aa"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function HandprintOnWall({ position, rotation, side }: { 
  position: [number, number, number]; 
  rotation: number;
  side: 'left' | 'right';
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05 + 0.95;
      meshRef.current.scale.set(pulse * (side === 'left' ? -1 : 1), pulse, 1);
    }
    if (glowRef.current) {
      glowRef.current.intensity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <pointLight ref={glowRef} position={[0, 0, 0.2]} color="#ffaa00" intensity={0.3} distance={2} />
      
      <mesh ref={meshRef} position={[0, 0, 0.02]}>
        <planeGeometry args={[0.5, 0.7]} />
        <meshBasicMaterial 
          color="#ffcc00"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {[0, 1, 2, 3, 4].map((i) => {
        const fingerX = (i - 2) * 0.08;
        const fingerY = 0.35 + (i === 2 ? 0.1 : i === 1 || i === 3 ? 0.05 : 0);
        const fingerLength = i === 2 ? 0.2 : i === 1 || i === 3 ? 0.18 : i === 0 ? 0.12 : 0.15;
        return (
          <mesh key={i} position={[fingerX, fingerY, 0.02]}>
            <planeGeometry args={[0.06, fingerLength]} />
            <meshBasicMaterial color="#ffdd44" transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

export function HintOverlay({ geometry }: HintOverlayProps) {
  const { hintActive, currentNode, availableMoves, blockades } = useGameStore();
  
  const hints = useMemo(() => {
    if (!hintActive || !currentNode) return { footprints: [], handprints: [] };
    
    const current = geometry.railNodes.get(currentNode);
    if (!current) return { footprints: [], handprints: [] };
    
    const footprints: Array<{ position: [number, number, number]; rotation: number; nodeId: string }> = [];
    const handprints: Array<{ position: [number, number, number]; rotation: number; side: 'left' | 'right' }> = [];
    
    for (const move of availableMoves) {
      const targetNode = geometry.railNodes.get(move.nodeId);
      if (!targetNode || blockades.has(move.nodeId)) continue;
      
      const dx = targetNode.worldX - current.worldX;
      const dz = targetNode.worldZ - current.worldZ;
      const midX = current.worldX + dx * 0.4;
      const midZ = current.worldZ + dz * 0.4;
      const rotation = Math.atan2(dx, -dz);
      
      footprints.push({
        position: [midX, 0.05, midZ],
        rotation,
        nodeId: move.nodeId
      });
      
      const perpX = -dz * 0.3;
      const perpZ = dx * 0.3;
      
      handprints.push({
        position: [midX + perpX, 1.2, midZ + perpZ],
        rotation: rotation + Math.PI / 2,
        side: 'right'
      });
      handprints.push({
        position: [midX - perpX, 1.0, midZ - perpZ],
        rotation: rotation - Math.PI / 2,
        side: 'left'
      });
    }
    
    return { footprints, handprints };
  }, [hintActive, currentNode, availableMoves, geometry, blockades]);
  
  if (!hintActive) return null;
  
  return (
    <group>
      {hints.footprints.map((fp, idx) => (
        <ClownFootprint 
          key={`fp-${idx}`} 
          position={fp.position} 
          rotation={fp.rotation} 
        />
      ))}
      
      {hints.handprints.map((hp, idx) => (
        <HandprintOnWall 
          key={`hp-${idx}`} 
          position={hp.position} 
          rotation={hp.rotation}
          side={hp.side}
        />
      ))}
    </group>
  );
}
