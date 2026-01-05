import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping, DoubleSide } from 'three';
import { MazeGeometry, WallSegment, DEFAULT_CONFIG } from '../../game/maze/geometry';
import canvasTextureUrl from '@assets/generated_images/vintage_circus_tent_canvas_texture.png';
import sawdustTextureUrl from '@assets/generated_images/circus_sawdust_floor_texture.png';
import React from 'react';

interface MazeProps {
  geometry: MazeGeometry;
}

interface TrackSegment {
  x: number;
  z: number;
  width: number;
  depth: number;
  rotation: number;
}

export function Maze({ geometry }: MazeProps) {
  const canvasTexture = useTexture(canvasTextureUrl);
  const sawdustTexture = useTexture(sawdustTextureUrl);
  const sawdustTextureDark = useTexture(sawdustTextureUrl);

  useMemo(() => {
    [canvasTexture, sawdustTexture, sawdustTextureDark].forEach(t => {
      t.wrapS = t.wrapT = RepeatWrapping;
    });
    canvasTexture.repeat.set(1, 2);
    sawdustTexture.repeat.set(16, 16);
    sawdustTextureDark.repeat.set(16, 16);
  }, [canvasTexture, sawdustTexture, sawdustTextureDark]);

  const { wallHeight } = DEFAULT_CONFIG;

  const wallMeshes = useMemo(() => {
    return geometry.walls.map((wall: WallSegment, idx: number) => (
      <mesh 
        key={`wall-${idx}`} 
        position={[wall.x, wall.height / 2, wall.z]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[wall.width, wall.height, wall.depth]} />
        <meshStandardMaterial 
          map={canvasTexture} 
          color="#c4a882"
          roughness={0.9}
          side={DoubleSide}
        />
      </mesh>
    ));
  }, [geometry, canvasTexture]);

  const tentPoles = useMemo(() => {
    const poles: React.ReactNode[] = [];
    const nodes = Array.from(geometry.railNodes.values());
    const poleSpacing = 3;
    
    nodes.forEach((node, idx) => {
      if (node.gridX % poleSpacing === 0 && node.gridY % poleSpacing === 0) {
        poles.push(
          <mesh key={`pole-${idx}`} position={[node.worldX, wallHeight / 2 + 1, node.worldZ]} castShadow>
            <cylinderGeometry args={[0.1, 0.15, wallHeight + 2, 8]} />
            <meshStandardMaterial color="#3a2718" roughness={0.8} metalness={0.05} />
          </mesh>
        );
      }
    });
    return poles;
  }, [geometry, wallHeight]);

  const { cellSize } = DEFAULT_CONFIG;
  const trackWidth = cellSize * 0.35;
  
  const trackSegments = useMemo(() => {
    const segments: TrackSegment[] = [];
    const nodes = Array.from(geometry.railNodes.values());
    
    nodes.forEach((node) => {
      node.connections.forEach((connId) => {
        const connNode = geometry.railNodes.get(connId);
        if (!connNode) return;
        if (connNode.gridX < node.gridX || connNode.gridY < node.gridY) return;
        
        const midX = (node.worldX + connNode.worldX) / 2;
        const midZ = (node.worldZ + connNode.worldZ) / 2;
        const dx = connNode.worldX - node.worldX;
        const dz = connNode.worldZ - node.worldZ;
        const length = Math.sqrt(dx * dx + dz * dz);
        const rotation = Math.atan2(dx, dz);
        
        segments.push({
          x: midX,
          z: midZ,
          width: trackWidth,
          depth: length + trackWidth,
          rotation,
        });
      });
    });
    
    return segments;
  }, [geometry, trackWidth]);

  return (
    <group>
      {/* Dark sawdust floor (sides) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[geometry.floor.x, -0.02, geometry.floor.z]} 
        receiveShadow
      >
        <planeGeometry args={[geometry.floor.width, geometry.floor.depth]} />
        <meshStandardMaterial 
          map={sawdustTextureDark} 
          color="#5a4030"
          roughness={1}
        />
      </mesh>
      
      {/* Light sawdust track (center paths) */}
      {trackSegments.map((seg, idx) => (
        <mesh 
          key={`track-${idx}`}
          rotation={[-Math.PI / 2, seg.rotation, 0]} 
          position={[seg.x, -0.01, seg.z]} 
          receiveShadow
        >
          <planeGeometry args={[seg.width, seg.depth]} />
          <meshStandardMaterial 
            map={sawdustTexture} 
            color="#c4a878"
            roughness={0.95}
          />
        </mesh>
      ))}
      
      {/* Peaked tent ceiling - main canvas */}
      <mesh 
        position={[geometry.floor.x, wallHeight + 4, geometry.floor.z]}
      >
        <coneGeometry args={[geometry.floor.width * 0.9, 8, 8, 1, true]} />
        <meshStandardMaterial 
          map={canvasTexture}
          color="#8a7a6a"
          roughness={0.95}
          side={DoubleSide}
        />
      </mesh>
      
      {/* Inner ceiling dark layer for depth */}
      <mesh 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[geometry.floor.x, wallHeight + 0.5, geometry.floor.z]}
      >
        <planeGeometry args={[geometry.floor.width * 1.2, geometry.floor.depth * 1.2]} />
        <meshStandardMaterial 
          color="#0a0805"
          roughness={1}
          side={DoubleSide}
        />
      </mesh>
      
      {wallMeshes}
      {tentPoles}
    </group>
  );
}
