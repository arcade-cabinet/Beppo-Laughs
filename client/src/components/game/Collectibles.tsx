import { Billboard, Text, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { COLLECTIBLE_NAMES, COLLECTIBLE_TEXTURE_URLS } from '../../game/textures';
import type { MazeGeometry } from '../../game/maze/geometry';
import { useGameStore } from '../../game/store';

interface CollectiblesProps {
  geometry: MazeGeometry;
}

interface CollectibleItem {
  id: string;
  worldX: number;
  worldZ: number;
  nodeId: string;
  textureIndex: number;
  name: string;
}

function Collectible({ item }: { item: CollectibleItem }) {
  const texture = useTexture(COLLECTIBLE_TEXTURE_URLS[item.textureIndex]);
  const groupRef = useRef<Group>(null);
  const { blockades, currentNode, collectedItems, setNearbyItem, nearbyItem } = useGameStore();
  const mountTimeRef = useRef(performance.now());
  const collectionTimeRef = useRef<number | null>(null);

  const hasBlockades = blockades.size > 0;
  const isCollected = collectedItems.has(item.id);

  useEffect(() => {
    if (isCollected && !collectionTimeRef.current) {
      collectionTimeRef.current = performance.now();
    }
  }, [isCollected]);

  useEffect(() => {
    if (isCollected && nearbyItem?.id === item.id) {
      setNearbyItem(null);
    }
  }, [isCollected, nearbyItem, item.id, setNearbyItem]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const now = performance.now();
    const elapsedSinceMount = (now - mountTimeRef.current) / 1000;

    // Pop-up animation on spawn (0-0.6 seconds)
    const popupDuration = 0.6;
    const popupProgress = Math.min(elapsedSinceMount, popupDuration) / popupDuration;
    const popupScale = popupProgress * popupProgress; // Easing: ease-out-quad

    // Pop-down animation on collection (0-0.5 seconds)
    let popdownScale = 1;
    let popdownY = 0;
    let popdownOpacity = 1;
    if (collectionTimeRef.current) {
      const elapsedSinceCollection = (now - collectionTimeRef.current) / 1000;
      const popdownDuration = 0.5;
      const popdownProgress = Math.min(elapsedSinceCollection, popdownDuration) / popdownDuration;
      // Shrink and slide up while disappearing
      popdownScale = Math.max(0, 1 - popdownProgress * 1.2);
      popdownY = popdownProgress * 1.5; // Slide up
      popdownOpacity = Math.max(0, 1 - popdownProgress);
    }

    if (isCollected) {
      groupRef.current.position.y = 0.8 + popdownY;
      groupRef.current.scale.setScalar(popdownScale);
      if (groupRef.current.children[0]) {
        const billboard = groupRef.current.children[0] as any;
        if (billboard.children[0]) {
          billboard.children[0].traverse((child: any) => {
            if (child.material) {
              child.material.opacity = popdownOpacity;
            }
          });
        }
      }
      return;
    }

    const gameState = useGameStore.getState();

    if (gameState.currentNode === item.nodeId && !gameState.collectedItems.has(item.id)) {
      if (!gameState.nearbyItem || gameState.nearbyItem.id !== item.id) {
        setNearbyItem({ id: item.id, name: item.name, nodeId: item.nodeId });
      }
    } else if (gameState.nearbyItem?.id === item.id && gameState.currentNode !== item.nodeId) {
      setNearbyItem(null);
    }

    groupRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 2 + item.worldX) * 0.15;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;

    const isNearby = gameState.nearbyItem?.id === item.id;
    const pulseIntensity = isNearby ? 0.3 : hasBlockades ? 0.2 : 0.1;
    const baseScale = isNearby ? 1.0 : 0.8;
    const floatingPulse =
      baseScale + Math.sin(state.clock.elapsedTime * (isNearby ? 5 : 3)) * pulseIntensity;

    // Combine popup scale with floating pulse animation
    const finalScale = popupProgress < 1 ? popupScale : floatingPulse;
    groupRef.current.scale.setScalar(finalScale);
  });

  if (isCollected && collectionTimeRef.current && (performance.now() - collectionTimeRef.current) > 500) {
    return null;
  }

  const isNearby = nearbyItem?.id === item.id;

  return (
    <group ref={groupRef} position={[item.worldX, 0.8, item.worldZ]}>
      <Billboard>
        <group>
          <mesh>
            <planeGeometry args={[0.7, 0.9]} />
            <meshStandardMaterial
              map={texture}
              transparent
              alphaTest={0.5}
              emissive={isNearby ? '#ffff00' : hasBlockades ? '#ffcc00' : '#ffaa00'}
              emissiveIntensity={isNearby ? 0.8 : hasBlockades ? 0.5 : 0.3}
            />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <ringGeometry args={[0.35, 0.45, 16]} />
            <meshBasicMaterial
              color={isNearby ? '#ffff00' : '#ffcc00'}
              transparent
              opacity={isNearby ? 0.8 : hasBlockades ? 0.5 : 0.3}
            />
          </mesh>
        </group>
      </Billboard>

      <Text
        position={[0, 0.9, 0]}
        fontSize={0.15}
        color={isNearby ? '#ffff00' : '#ffcc00'}
        anchorX="center"
      >
        {item.name}
      </Text>

      {isNearby && (
        <Text position={[0, 0.6, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
          TAP TO COLLECT
        </Text>
      )}

      {hasBlockades && !isNearby && (
        <Text position={[0, 0.6, 0]} fontSize={0.1} color="#ffffff" anchorX="center">
          Clears a path
        </Text>
      )}
    </group>
  );
}

export function Collectibles({ geometry }: CollectiblesProps) {
  const { collectedItems } = useGameStore();

  const items = useMemo(() => {
    const generated: CollectibleItem[] = [];
    const nodes = Array.from(geometry.railNodes.values());
    const itemCount = Math.floor(nodes.length / 8);

    const avoidNodes = new Set([geometry.centerNodeId, ...geometry.exitNodeIds]);

    for (let i = 0; i < itemCount; i++) {
      let selectedNode: (typeof nodes)[0] | null = null;
      let attempts = 0;

      do {
        const idx = Math.floor(Math.random() * nodes.length);
        selectedNode = nodes[idx];
        attempts++;
      } while (
        selectedNode &&
        (avoidNodes.has(selectedNode.id) ||
          generated.some((it) => it.nodeId === selectedNode?.id)) &&
        attempts < 50
      );

      if (attempts < 50 && selectedNode) {
        const textureIndex = Math.floor(Math.random() * COLLECTIBLE_TEXTURE_URLS.length);
        generated.push({
          id: `item-${selectedNode.id}`,
          worldX: selectedNode.worldX,
          worldZ: selectedNode.worldZ,
          nodeId: selectedNode.id,
          textureIndex,
          name: COLLECTIBLE_NAMES[textureIndex],
        });
      }
    }

    return generated;
  }, [geometry]);

  return (
    <group>
      {items
        .filter((item) => !collectedItems.has(item.id))
        .map((item) => (
          <Collectible key={item.id} item={item} />
        ))}
    </group>
  );
}
