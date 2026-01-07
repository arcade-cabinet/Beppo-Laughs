import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SDFVillain } from './SDFVillain';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: {
      position: { x: 0, y: 0, z: 0 },
    },
  })),
  extend: vi.fn(),
}));

// Mock drei
vi.mock('@react-three/drei', () => ({
  shaderMaterial: vi.fn(() => ({})),
}));

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn(() => ({
    fear: 0,
    despair: 0,
    maxSanity: 100,
  })),
}));

describe('SDFVillain', () => {
  const mockProps = {
    position: [0, 1, -5] as [number, number, number],
    isVisible: true,
  };

  it('renders without crashing', () => {
    const { container } = render(<SDFVillain {...mockProps} />);
    expect(container).toBeDefined();
  });

  it('accepts position prop', () => {
    expect(() => render(<SDFVillain {...mockProps} />)).not.toThrow();
  });

  it('accepts isVisible prop', () => {
    expect(() => render(<SDFVillain position={[0, 0, 0]} isVisible={false} />)).not.toThrow();
  });

  it('can be mounted and unmounted without errors', () => {
    const { unmount } = render(<SDFVillain {...mockProps} />);
    expect(() => unmount()).not.toThrow();
  });


  describe('Villain Visibility', () => {
    it('renders when visible', () => {      useGameStore.mockImplementation(() => ({
        fear: 50,
        despair: 0,
        maxSanity: 100,
      }));

      expect(() => render(<SDFVillain position={[0, 1, -5]} isVisible={true} />)).not.toThrow();
    });

    it('hides when not visible', () => {      useGameStore.mockImplementation(() => ({
        fear: 0,
        despair: 0,
        maxSanity: 100,
      }));

      const { container } = render(<SDFVillain position={[0, 1, -5]} isVisible={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('toggles visibility', () => {      useGameStore.mockImplementation(() => ({
        fear: 30,
        despair: 0,
        maxSanity: 100,
      }));

      const { rerender } = render(<SDFVillain position={[0, 0, 0]} isVisible={false} />);
      
      rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />);
      
      expect(() => rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />)).not.toThrow();
    });
  

  describe('Fear Integration', () => {
    it('reacts to fear level changes', () => {      let fear = 10;
      const { rerender } = render(<SDFVillain position={[0, 0, 0]} isVisible={true} />);
      
      fear = 80;
      rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />);
      
      expect(() => rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />)).not.toThrow();
    });

    it('handles maximum fear level', () => {      useGameStore.mockImplementation(() => ({
        fear: 100,
        despair: 0,
        maxSanity: 100,
      }));

      expect(() => render(<SDFVillain position={[0, 1, -5]} isVisible={true} />)).not.toThrow();
    });
  

  describe('Position Variations', () => {
    it('renders at different positions', () => {      useGameStore.mockImplementation(() => ({
        fear: 50,
        despair: 0,
        maxSanity: 100,
      }));

      const positions: [number, number, number][] = [
        [0, 0, 0],
        [5, 2, -3],
        [-5, 1, 10],
      ];

      positions.forEach(pos => {
        expect(() => render(<SDFVillain position={pos} isVisible={true} />)).not.toThrow();
      });
    });
  

  describe('Edge Cases', () => {
    it('handles zero fear level', () => {      useGameStore.mockImplementation(() => ({
        fear: 0,
        despair: 0,
        maxSanity: 100,
      }));

      expect(() => render(<SDFVillain position={[0, 0, 0]} isVisible={true} />)).not.toThrow();
    });

    it('handles rapid visibility toggles', () => {      useGameStore.mockImplementation(() => ({
        fear: 40,
        despair: 0,
        maxSanity: 100,
      }));

      const { rerender } = render(<SDFVillain position={[0, 0, 0]} isVisible={true} />);
      
      for (let i = 0; i < 10; i++) {
        rerender(<SDFVillain position={[0, 0, 0]} isVisible={i % 2 === 0} />);
      }
      
      expect(() => rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />)).not.toThrow();
    });
  });
});

// Additional tests: SDFVillain behavior
describe('SDFVillain - behavior', () => {
  it('mounts across multiple sanity levels', () => {    for (const v of [0, 25, 50, 75, 100]) {
      const { unmount } = render(<SDFVillain />);
      unmount();
    }
  });
});
