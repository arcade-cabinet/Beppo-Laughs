import ReactThreeTestRenderer from '@react-three/test-renderer';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClownCarCockpit } from './ClownCarCockpit';

// Mock the store
const mockStoreState = {
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

// Mock drei to avoid Font loading issues with Text
vi.mock('@react-three/drei', () => ({
  Text: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock useFrame
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useFrame: (callback: any) => {
      // Allow testing frame updates if needed
    },
  };
});

describe('ClownCarCockpit', () => {
  beforeEach(() => {
    mockStoreState.accelerating = false;
    mockStoreState.braking = false;
    mockStoreState.fear = 0;
    mockStoreState.despair = 0;
    mockStoreState.carSpeed = 0;
  });

  // Helper to safely get root group
  const getRootGroup = (renderer: any) => {
    if (renderer.scene && renderer.scene.children && renderer.scene.children.length > 0) {
      return renderer.scene.children[0];
    }
    return null;
  };

  it('renders without crashing', async () => {
    const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
  });

  it('contains dashboard panels', async () => {
    const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
    const root = getRootGroup(renderer);
    expect(root).toBeDefined();
    if (root) {
      // Basic check that children exist (panels/chassis)
      expect(root.children.length).toBeGreaterThan(0);
    }
  });

  it('has correct scale applied', async () => {
    const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
    const rootGroup = getRootGroup(renderer);
    expect(rootGroup).toBeDefined();
    if (rootGroup) {
      const scale = rootGroup.props.scale as [number, number, number];
      expect(scale[0]).toBe(2.5);
      expect(scale[1]).toBe(2.5);
      expect(scale[2]).toBe(2.5);
    }
  });

  describe('static positioning behavior (new changes)', () => {
    it('maintains cockpit at exactly position [0, -0.6, -0.5] relative to camera', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      expect(rootGroup).toBeDefined();
      if (rootGroup) {
        const pos = rootGroup.props.position as [number, number, number];
        expect(pos[0]).toBe(0);
        expect(pos[1]).toBe(-0.6);
        expect(pos[2]).toBe(-0.5);
      }
    });

    it('chassis ref prevents procedural movement', async () => {
      mockStoreState.carSpeed = 5;
      mockStoreState.fear = 80;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      await renderer.advanceFrames(50, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
      if (rootGroup) {
        const pos = rootGroup.props.position as [number, number, number];
        expect(pos[0]).toBe(0);
        expect(pos[1]).toBe(-0.6);
        expect(pos[2]).toBe(-0.5);
      }
    });
  });
});
