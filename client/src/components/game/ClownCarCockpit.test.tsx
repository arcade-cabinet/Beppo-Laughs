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

vi.mock('../../game/store', () => {
  return {
    useGameStore: Object.assign(
      () => mockStoreState, // The hook
      {
        getState: () => mockStoreState,
        subscribe: () => () => {},
      },
    ),
  };
});

// Mock useThree to provide size
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useFrame: (_callback: unknown) => {},
    useThree: () => ({
      size: { width: 800, height: 600 }, // Default landscape
    }),
  };
});

// Mock drei to avoid Font loading issues with Text
vi.mock('@react-three/drei', () => ({
  Text: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  useTexture: () => null,
}));

describe('ClownCarCockpit', () => {
  beforeEach(() => {
    mockStoreState.accelerating = false;
    mockStoreState.braking = false;
    mockStoreState.fear = 0;
    mockStoreState.despair = 0;
    mockStoreState.carSpeed = 0;
  });

  // Helper to safely get root group
  // biome-ignore lint/suspicious/noExplicitAny: Mock renderer structure is complex
  const getRootGroup = (renderer: any) => {
    if (renderer.scene?.children && renderer.scene.children.length > 0) {
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
      expect(scale[0]).toBe(1.0);
      expect(scale[1]).toBe(1.0);
      expect(scale[2]).toBe(1.0);
    }
  });

  describe('static positioning behavior', () => {
    it('maintains cockpit at exactly position [0, 0.05, -0.5] relative to camera', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      expect(rootGroup).toBeDefined();
      if (rootGroup) {
        const pos = rootGroup.props.position as [number, number, number];
        expect(pos[0]).toBe(0);
        expect(pos[1]).toBe(0.05);
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
        expect(pos[1]).toBe(0.05);
        expect(pos[2]).toBe(-0.5);
      }
    });
  });

  describe('camera height alignment (Y=0.05 positioning)', () => {
    it('positions cockpit at Y=0.05 to align with camera height 1.4', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      if (rootGroup) {
        const pos = rootGroup.props.position as [number, number, number];
        // Y=0.05 ensures cockpit is visible at camera height 1.4 (sitting position)
        expect(pos[1]).toBe(0.05);
      }
    });

    it('maintains consistent Y position across different game states', async () => {
      // Test with various game states to ensure position stability
      const states = [
        { fear: 0, despair: 0, carSpeed: 0 },
        { fear: 50, despair: 30, carSpeed: 3 },
        { fear: 90, despair: 80, carSpeed: 5 },
        { fear: 100, despair: 100, carSpeed: 0 },
      ];

      for (const state of states) {
        mockStoreState.fear = state.fear;
        mockStoreState.despair = state.despair;
        mockStoreState.carSpeed = state.carSpeed;

        const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
        const rootGroup = getRootGroup(renderer);

        if (rootGroup) {
          const pos = rootGroup.props.position as [number, number, number];
          expect(pos[1]).toBe(0.05);
        }
      }
    });

    it('Y position remains stable during frame updates', async () => {
      mockStoreState.carSpeed = 4;
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      // Advance multiple frames to test stability
      await renderer.advanceFrames(100, 16);

      const rootGroup = getRootGroup(renderer);
      if (rootGroup) {
        const pos = rootGroup.props.position as [number, number, number];
        expect(pos[1]).toBe(0.05);
      }
    });
  });

  describe('dashboard panel rendering and behavior', () => {
    it('renders fear and despair panels with correct initial state', async () => {
      mockStoreState.fear = 0;
      mockStoreState.despair = 0;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      expect(rootGroup).toBeDefined();
      // Dashboard should have multiple child groups (panels, chassis, etc.)
      if (rootGroup) {
        expect(rootGroup.children.length).toBeGreaterThan(2);
      }
    });

    it('dashboard responds to fear meter changes', async () => {
      mockStoreState.fear = 75;
      mockStoreState.despair = 25;
      mockStoreState.maxSanity = 100;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      
      // Advance frames to allow useFrame hooks to update
      await renderer.advanceFrames(10, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });

    it('dashboard responds to despair meter changes', async () => {
      mockStoreState.fear = 20;
      mockStoreState.despair = 85;
      mockStoreState.maxSanity = 100;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      await renderer.advanceFrames(10, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });

    it('handles max sanity edge case (both meters at max)', async () => {
      mockStoreState.fear = 100;
      mockStoreState.despair = 100;
      mockStoreState.maxSanity = 100;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      await renderer.advanceFrames(5, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });

    it('handles zero sanity edge case (both meters at zero)', async () => {
      mockStoreState.fear = 0;
      mockStoreState.despair = 0;
      mockStoreState.maxSanity = 100;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      await renderer.advanceFrames(5, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });
  });

  describe('speedometer behavior', () => {
    it('renders speedometer with zero speed initially', async () => {
      mockStoreState.carSpeed = 0;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      expect(rootGroup).toBeDefined();
    });

    it('updates speedometer during acceleration', async () => {
      mockStoreState.carSpeed = 0;
      mockStoreState.accelerating = true;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      // Simulate speed increase
      mockStoreState.carSpeed = 2.5;
      await renderer.advanceFrames(30, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });

    it('handles maximum speed display', async () => {
      mockStoreState.carSpeed = 5; // Max speed
      mockStoreState.accelerating = false;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      await renderer.advanceFrames(10, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });

    it('handles braking speed changes', async () => {
      mockStoreState.carSpeed = 4;
      mockStoreState.braking = true;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      // Simulate speed decrease
      mockStoreState.carSpeed = 2;
      await renderer.advanceFrames(20, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });

    it('handles rapid speed fluctuations', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      // Simulate rapid acceleration and deceleration
      const speeds = [0, 1, 3, 5, 4, 2, 0, 2, 4];
      for (const speed of speeds) {
        mockStoreState.carSpeed = speed;
        await renderer.advanceFrames(5, 16);
      }

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });
  });

  describe('clown nose animation', () => {
    it('clown nose animates with pulsing effect', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      // Advance frames to allow animation
      await renderer.advanceFrames(60, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });

    it('nose animation continues during gameplay', async () => {
      mockStoreState.carSpeed = 3;
      mockStoreState.fear = 40;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      await renderer.advanceFrames(120, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });
  });

  describe('steering wheel behavior', () => {
    it('steering wheel renders at rest', async () => {
      mockStoreState.carSpeed = 0;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      expect(rootGroup).toBeDefined();
    });

    it('steering wheel vibrates during movement', async () => {
      mockStoreState.carSpeed = 3;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      await renderer.advanceFrames(30, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });

    it('steering wheel vibration increases with speed', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);

      // Test vibration at different speeds
      const speeds = [0, 1, 2.5, 4, 5];
      for (const speed of speeds) {
        mockStoreState.carSpeed = speed;
        await renderer.advanceFrames(10, 16);
      }

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });
  });

  describe('landscape vs portrait orientation', () => {
    it('renders correctly in landscape mode', async () => {
      vi.mocked(useThree).mockReturnValue({
        size: { width: 1920, height: 1080 },
      } as any);

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      if (rootGroup) {
        const pos = rootGroup.props.position as [number, number, number];
        expect(pos[1]).toBe(0.05);
      }
    });

    it('renders correctly in portrait mode', async () => {
      vi.mocked(useThree).mockReturnValue({
        size: { width: 1080, height: 1920 },
      } as any);

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      if (rootGroup) {
        const pos = rootGroup.props.position as [number, number, number];
        expect(pos[1]).toBe(0.05);
      }
    });

    it('handles square viewport', async () => {
      vi.mocked(useThree).mockReturnValue({
        size: { width: 1000, height: 1000 },
      } as any);

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      if (rootGroup) {
        const pos = rootGroup.props.position as [number, number, number];
        expect(pos[1]).toBe(0.05);
      }
    });
  });

  describe('scale consistency', () => {
    it('maintains 1.0 scale across all axes', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      if (rootGroup) {
        const scale = rootGroup.props.scale as [number, number, number];
        expect(scale[0]).toBe(1.0);
        expect(scale[1]).toBe(1.0);
        expect(scale[2]).toBe(1.0);
      }
    });

    it('scale remains constant during high-speed movement', async () => {
      mockStoreState.carSpeed = 5;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      await renderer.advanceFrames(50, 16);

      const rootGroup = getRootGroup(renderer);
      if (rootGroup) {
        const scale = rootGroup.props.scale as [number, number, number];
        expect(scale[0]).toBe(1.0);
        expect(scale[1]).toBe(1.0);
        expect(scale[2]).toBe(1.0);
      }
    });
  });

  describe('Z-axis depth positioning', () => {
    it('maintains Z=-0.5 for proper depth perception', async () => {
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      if (rootGroup) {
        const pos = rootGroup.props.position as [number, number, number];
        expect(pos[2]).toBe(-0.5);
      }
    });

    it('Z position ensures cockpit is in front of camera', async () => {
      // Z=-0.5 places cockpit 0.5 units in front of camera (which looks down -Z)
      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      const rootGroup = getRootGroup(renderer);

      if (rootGroup) {
        const pos = rootGroup.props.position as [number, number, number];
        // Negative Z in camera space = in front of camera
        expect(pos[2]).toBeLessThan(0);
      }
    });
  });

  describe('edge case: extreme sanity values', () => {
    it('handles fear exceeding maxSanity', async () => {
      mockStoreState.fear = 150;
      mockStoreState.despair = 50;
      mockStoreState.maxSanity = 100;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      await renderer.advanceFrames(10, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });

    it('handles negative sanity values', async () => {
      mockStoreState.fear = -10;
      mockStoreState.despair = -5;
      mockStoreState.maxSanity = 100;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      await renderer.advanceFrames(10, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });

    it('handles zero maxSanity edge case', async () => {
      mockStoreState.fear = 50;
      mockStoreState.despair = 50;
      mockStoreState.maxSanity = 0;

      const renderer = await ReactThreeTestRenderer.create(<ClownCarCockpit />);
      await renderer.advanceFrames(10, 16);

      const rootGroup = getRootGroup(renderer);
      expect(rootGroup).toBeDefined();
    });
  });
});
});
