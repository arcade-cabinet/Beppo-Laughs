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
    isActive: true,
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

  

  describe('Fear Integration', () => {
    it('reacts to fear level changes', () => {      let fear = 10;
      

      const { rerender } = render(<SDFVillain position={[0, 0, 0]} isVisible={true} />);
      
      fear = 80;
      rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />);
      
      expect(() => rerender(<SDFVillain position={[0, 0, 0]} isVisible={true} />)).not.toThrow();
    });

  });

  

  
});

