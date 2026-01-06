import { Billboard, Text, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group, Texture } from 'three';
import { useGameStore } from '../../game/store';
import type { BlockadePlan } from '../../game/spawnPlan';

interface BlockadesProps {
  blockades: BlockadePlan[];
}

export function Blockades({ blockades }: BlockadesProps) {
  const { camera } = useThree();
  const groupRef = useRef<Group>(null);
  const { blockades: blockedCells } = useGameStore();

  const textureUrls = useMemo(
    () => blockades.map((blockade) => blockade.textureUrl),
    [blockades],
  );
  const textures = useTexture(textureUrls) as Texture[] | Texture;

  const textureByNodeId = useMemo(() => {
    const map = new Map<string, Texture>();
    if (Array.isArray(textures)) {
      textures.forEach((texture, index) => {
        const blockade = blockades[index];
        if (blockade) map.set(blockade.nodeId, texture);
      });
    } else if (blockades[0] && textures) {
      map.set(blockades[0].nodeId, textures);
    }
    return map;
  }, [blockades, textures]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.02;
  });

  return (
    <group ref={groupRef}>
      {blockades.map((blockade) => {
        const texture = textureByNodeId.get(blockade.nodeId);
        if (!blockedCells.has(blockade.nodeId)) return null;

        const distance = Math.hypot(
          camera.position.x - blockade.worldX,
          camera.position.y - 1.5,
          camera.position.z - blockade.worldZ,
        );
        const showLabel = distance < 5.5;

        return (
          <group key={blockade.nodeId} position={[blockade.worldX, 1.4, blockade.worldZ]}>
            <Billboard follow={true}>
              <mesh>
                <planeGeometry args={[2.2, 2.2]} />
                <meshStandardMaterial
                  map={texture}
                  transparent
                  opacity={0.95}
                  emissive="#ff3b1a"
                  emissiveIntensity={0.35}
                />
              </mesh>
            </Billboard>

            {showLabel && (
              <Billboard>
                <Text position={[0, -1.6, 0]} fontSize={0.2} color="#ffcc66" anchorX="center">
                  Requires: {blockade.requiredItemName}
                </Text>
              </Billboard>
            )}
          </group>
        );
      })}
    </group>
  );
}
