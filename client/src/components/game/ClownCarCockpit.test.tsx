import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClownCarCockpit } from './ClownCarCockpit';

// Type for scene graph node
type SceneNode = {
  type: string;
  props: Record<string, unknown>;
  children: SceneNode[];
};

// Mock the Text component from drei since it loads external fonts
vi.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => {
    // Return a group that simulates the Text component
    return <group {...props} name="MockText" userData={{ text: children }} />;
  },
}));

// Create a mock store with controllable state
let mockStoreState = {
  accelerating: false,
  braking: false,
  fear: 0,
  despair: 0,
  maxSanity: 100,
  carSpeed: 0,
};

vi.mock('../../game/store', () => ({
  useGameStore: {
    getState: () => mockStoreState,
  },
}));

// Helper to traverse scene graph
function traverseScene(
  children: SceneNode[],
  callback: (node: SceneNode) => void,
): void {
  for (const child of children) {
    callback(child);
    if (child.children && child.children.length > 0) {
      traverseScene(child.children, callback);
    }
  }
}

function getObjectByName<T extends THREE.Object3D>(scene: THREE.Scene, name: string): T {
  const object = scene.getObjectByName(name);
  expect(object, `Expected scene object named "${name}"`).toBeTruthy();
  return object as T;
}

function lerpValue(start: number, target: number, alpha: number, iterations: number): number {
  let value = start;
  for (let i = 0; i < iterations; i += 1) {
    value += (target - value) * alpha;
  }
  return value;
}

describe('ClownCarCockpit', () => {
  beforeEach(() => {
    // Reset store state before each test
    mockStoreState = {
      accelerating: false,
      braking: false,
      fear: 0,
      despair: 0,
      maxSanity: 100,
      carSpeed: 0,
    };
  });

  describe('component structure', () => {
    it('renders with correct root group structure', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const scene = renderer.scene;

      // The root group should exist
      expect(scene.children.length).toBeGreaterThan(0);

      // The root should be a group with specific position for cockpit placement
      const root = scene.children[0];
      expect(root.type).toBe('Group');
    });

    it('contains dashboard panels with correct labels via userData', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      let hasFearLabel = false;
      let hasDespairLabel = false;

      traverseScene(renderer.scene.children as unknown as SceneNode[], (node) => {
        const userData = node.props?.userData as { text?: string } | undefined;
        if (userData?.text === 'FEAR') hasFearLabel = true;
        if (userData?.text === 'DESPAIR') hasDespairLabel = true;
      });

      expect(hasFearLabel).toBe(true);
      expect(hasDespairLabel).toBe(true);
    });

    it('contains speedometer panel with SPEED label', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      let hasSpeedLabel = false;

      traverseScene(renderer.scene.children as unknown as SceneNode[], (node) => {
        const userData = node.props?.userData as { text?: string } | undefined;
        if (userData?.text === 'SPEED') hasSpeedLabel = true;
      });

      expect(hasSpeedLabel).toBe(true);
    });

    it('has multiple nested groups for cockpit structure', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      let groupCount = 0;

      traverseScene(renderer.scene.children as unknown as SceneNode[], (node) => {
        if (node.type === 'Group') groupCount++;
      });

      // Should have multiple groups: root, dashboard group, panel groups, hood group, lever group
      expect(groupCount).toBeGreaterThan(5);
    });

    it('has many meshes for detailed 3D cockpit', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      let meshCount = 0;

      traverseScene(renderer.scene.children as unknown as SceneNode[], (node) => {
        if (node.type === 'Mesh') meshCount++;
      });

      // Cockpit has many meshes: panels, bars, hood, dots, rivets, etc.
      expect(meshCount).toBeGreaterThan(30);
    });
  });

  describe('initial state rendering', () => {
    it('renders at correct initial position below camera', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      const rootGroup = renderer.scene.children[0];
      expect(rootGroup.props.position).toBeDefined();

      // Position should be [0, -0.6, -0.5]
      const pos = rootGroup.props.position as [number, number, number];
      expect(pos[0]).toBe(0); // centered horizontally
      expect(pos[1]).toBe(-0.6); // below camera
      expect(pos[2]).toBe(-0.5); // in front of camera
    });

    it('applies correct scale to cockpit', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      const rootGroup = renderer.scene.children[0];
      expect(rootGroup.props.scale).toBeDefined();

      // Scale should be [2.5, 2.5, 2.5]
      const scale = rootGroup.props.scale as [number, number, number];
      expect(scale[0]).toBe(2.5);
      expect(scale[1]).toBe(2.5);
      expect(scale[2]).toBe(2.5);
    });
  });

  describe('frame behavior with state changes', () => {
    it('processes frames without errors when accelerating', async () => {
      mockStoreState.accelerating = true;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const lever = getObjectByName<THREE.Group>(renderer.scene, 'driveLever');

      // Advance frames to allow animation to process
      await renderer.advanceFrames(10, 16);

      const expectedRotation = lerpValue(-0.1, -0.5, 0.15, 10);
      expect(lever.rotation.x).toBeCloseTo(expectedRotation, 4);
    });

    it('processes frames without errors when braking', async () => {
      mockStoreState.braking = true;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const lever = getObjectByName<THREE.Group>(renderer.scene, 'driveLever');

      await renderer.advanceFrames(10, 16);

      const expectedRotation = lerpValue(-0.1, 0.2, 0.15, 10);
      expect(lever.rotation.x).toBeCloseTo(expectedRotation, 4);
    });

    it('processes frames with fear value of 50', async () => {
      mockStoreState.fear = 50;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const fearFill = getObjectByName<THREE.Mesh>(renderer.scene, 'fearFill');

      await renderer.advanceFrames(10, 16);

      expect(fearFill.scale.x).toBeCloseTo(0.5, 4);
    });

    it('processes frames with despair value of 75', async () => {
      mockStoreState.despair = 75;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const despairFill = getObjectByName<THREE.Mesh>(renderer.scene, 'despairFill');

      await renderer.advanceFrames(10, 16);

      expect(despairFill.scale.x).toBeCloseTo(0.75, 4);
    });

    it('processes frames with carSpeed of 3.5', async () => {
      mockStoreState.carSpeed = 3.5;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const needle = getObjectByName<THREE.Mesh>(renderer.scene, 'speedometerNeedle');

      await renderer.advanceFrames(10, 16);

      const targetRotation = 0.8 - (3.5 / 5) * 1.6;
      const expectedRotation = lerpValue(0.8, targetRotation, 0.15, 10);
      expect(needle.rotation.z).toBeCloseTo(expectedRotation, 4);
    });

    it('maintains scene integrity across multiple frame advances', async () => {
      mockStoreState.accelerating = true;
      mockStoreState.fear = 30;
      mockStoreState.carSpeed = 2;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const lever = getObjectByName<THREE.Group>(renderer.scene, 'driveLever');
      const fearFill = getObjectByName<THREE.Mesh>(renderer.scene, 'fearFill');
      const needle = getObjectByName<THREE.Mesh>(renderer.scene, 'speedometerNeedle');

      // Advance multiple batches of frames
      await renderer.advanceFrames(5, 16);

      expect(lever.rotation.x).toBeLessThan(-0.1);
      expect(fearFill.scale.x).toBeCloseTo(0.3, 4);
      expect(needle.rotation.z).toBeLessThan(0.8);

      mockStoreState.accelerating = false;
      mockStoreState.braking = true;

      await renderer.advanceFrames(5, 16);

      expect(lever.rotation.x).toBeGreaterThan(-0.1);

      mockStoreState.braking = false;
      mockStoreState.fear = 60;

      await renderer.advanceFrames(5, 16);

      expect(fearFill.scale.x).toBeCloseTo(0.6, 4);
    });
  });

  describe('edge cases', () => {
    it('handles max fear value (100)', async () => {
      mockStoreState.fear = 100;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const fearFill = getObjectByName<THREE.Mesh>(renderer.scene, 'fearFill');
      await renderer.advanceFrames(5, 16);

      expect(fearFill.scale.x).toBeCloseTo(1, 4);
    });

    it('handles max despair value (100)', async () => {
      mockStoreState.despair = 100;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const despairFill = getObjectByName<THREE.Mesh>(renderer.scene, 'despairFill');
      await renderer.advanceFrames(5, 16);

      expect(despairFill.scale.x).toBeCloseTo(1, 4);
    });

    it('handles both fear and despair at max simultaneously', async () => {
      mockStoreState.fear = 100;
      mockStoreState.despair = 100;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const fearFill = getObjectByName<THREE.Mesh>(renderer.scene, 'fearFill');
      const despairFill = getObjectByName<THREE.Mesh>(renderer.scene, 'despairFill');
      await renderer.advanceFrames(5, 16);

      expect(fearFill.scale.x).toBeCloseTo(1, 4);
      expect(despairFill.scale.x).toBeCloseTo(1, 4);
    });

    it('handles max speed value (5)', async () => {
      mockStoreState.carSpeed = 5;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const needle = getObjectByName<THREE.Mesh>(renderer.scene, 'speedometerNeedle');
      await renderer.advanceFrames(5, 16);

      const targetRotation = 0.8 - (5 / 5) * 1.6;
      const expectedRotation = lerpValue(0.8, targetRotation, 0.15, 5);
      expect(needle.rotation.z).toBeCloseTo(expectedRotation, 4);
    });

    it('handles simultaneous accelerating and braking (priority test)', async () => {
      mockStoreState.accelerating = true;
      mockStoreState.braking = true;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const lever = getObjectByName<THREE.Group>(renderer.scene, 'driveLever');
      await renderer.advanceFrames(5, 16);

      // Component should handle this gracefully (accelerating takes priority in code)
      const expectedRotation = lerpValue(-0.1, -0.5, 0.15, 5);
      expect(lever.rotation.x).toBeCloseTo(expectedRotation, 4);
    });

    it('handles zero values for all metrics', async () => {
      mockStoreState.fear = 0;
      mockStoreState.despair = 0;
      mockStoreState.carSpeed = 0;
      mockStoreState.accelerating = false;
      mockStoreState.braking = false;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const fearFill = getObjectByName<THREE.Mesh>(renderer.scene, 'fearFill');
      const despairFill = getObjectByName<THREE.Mesh>(renderer.scene, 'despairFill');
      const needle = getObjectByName<THREE.Mesh>(renderer.scene, 'speedometerNeedle');
      await renderer.advanceFrames(5, 16);

      expect(fearFill.scale.x).toBeCloseTo(0.01, 4);
      expect(despairFill.scale.x).toBeCloseTo(0.01, 4);
      expect(needle.rotation.z).toBeCloseTo(0.8, 4);
    });

    it('handles very small fear values', async () => {
      mockStoreState.fear = 0.001;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const fearFill = getObjectByName<THREE.Mesh>(renderer.scene, 'fearFill');
      await renderer.advanceFrames(5, 16);

      expect(fearFill.scale.x).toBeCloseTo(0.01, 4);
    });

    it('handles very small despair values', async () => {
      mockStoreState.despair = 0.001;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const despairFill = getObjectByName<THREE.Mesh>(renderer.scene, 'despairFill');
      await renderer.advanceFrames(5, 16);

      expect(despairFill.scale.x).toBeCloseTo(0.01, 4);
    });
  });

  describe('unmounting', () => {
    it('cleanly unmounts without errors', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      await renderer.advanceFrames(3, 16);

      expect(() => renderer.unmount()).not.toThrow();
    });

    it('unmounts cleanly after multiple state changes', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      mockStoreState.accelerating = true;
      await renderer.advanceFrames(3, 16);

      mockStoreState.fear = 50;
      await renderer.advanceFrames(3, 16);

      mockStoreState.braking = true;
      await renderer.advanceFrames(3, 16);

      expect(() => renderer.unmount()).not.toThrow();
    });
  });
});
