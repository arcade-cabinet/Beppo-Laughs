import { Billboard, Text, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group, Texture } from 'three';
import { useGameStore } from '../../game/store';
import type { BlockadePlan } from '../../game/spawnPlan';

interface BlockadesProps {
  blockades: BlockadePlan[];
}

const LABEL_DISTANCE = 5.5;
const BLOCKADE_HEIGHT = 1.4;
const BLOCKADE_SIZE = 2.2;
const LABEL_OFFSET = -1.6;

function BlockadeCutout({
  blockade,
  texture,
}: {
  blockade: BlockadePlan;
  texture?: Texture;
}) {
  const groupRef = useRef<Group>(null);
  const labelRef = useRef<Group>(null);

  useFrame((state) => {
    if (!labelRef.current || !groupRef.current) return;
    const distance = Math.hypot(
      state.camera.position.x - groupRef.current.position.x,
      state.camera.position.y - (BLOCKADE_HEIGHT + 0.1),
      state.camera.position.z - groupRef.current.position.z,
    );
    labelRef.current.visible = distance < LABEL_DISTANCE;
  });

  return (
    <group ref={groupRef} position={[blockade.worldX, BLOCKADE_HEIGHT, blockade.worldZ]}>
      <Billboard follow={true}>
        <mesh>
          <planeGeometry args={[BLOCKADE_SIZE, BLOCKADE_SIZE]} />
          <meshStandardMaterial
            map={texture}
            transparent
            opacity={0.95}
            emissive="#ff3b1a"
            emissiveIntensity={0.35}
          />
        </mesh>
      </Billboard>

      <group ref={labelRef} visible={false}>
        <Billboard>
          <Text position={[0, LABEL_OFFSET, 0]} fontSize={0.2} color="#ffcc66" anchorX="center">
            Requires: {blockade.requiredItemName}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

export function Blockades({ blockades }: BlockadesProps) {
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

        return (
          <BlockadeCutout key={blockade.nodeId} blockade={blockade} texture={texture} />
        );
      })}
    </group>
  );
}
