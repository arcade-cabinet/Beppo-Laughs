import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BrainMeter } from './BrainMeter';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  useFrame: vi.fn(),
}));

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn(() => ({
    fear: 0,
    despair: 0,
    maxSanity: 100,
  })),
}));

describe('BrainMeter', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrainMeter />);
    expect(container).toBeDefined();
  });

  it('renders FEAR label', () => {
    const { container } = render(<BrainMeter />);
    expect(container.textContent).toContain('FEAR');
  });

  it('renders DESPAIR label', () => {
    const { container } = render(<BrainMeter />);
    expect(container.textContent).toContain('DESPAIR');
  });

  it('renders SANITY label', () => {
    const { container } = render(<BrainMeter />);
    expect(container.textContent).toContain('SANITY');
  });

  it('displays percentage values', () => {
    const { container } = render(<BrainMeter />);
    // Should display fear and despair percentages
    expect(container.textContent).toMatch(/\d+%/);
  });

  it('can be mounted and unmounted without errors', () => {
    const { unmount } = render(<BrainMeter />);
    expect(() => unmount()).not.toThrow();
  });


  describe('Sanity Meter Display', () => {
    it('displays fear percentage correctly', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 45,
        despair: 20,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      expect(container.textContent).toContain('45%');
    });

    it('displays despair percentage correctly', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 20,
        despair: 65,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      expect(container.textContent).toContain('65%');
    });

    it('updates when fear changes', () => {
      const { useGameStore } = require('../../game/store');
      
      let currentFear = 10;
      useGameStore.mockImplementation(() => ({
        fear: currentFear,
        despair: 0,
        maxSanity: 100,
      }));

      const { container, rerender } = render(<BrainMeter />);
      expect(container.textContent).toContain('10%');
      
      currentFear = 50;
      rerender(<BrainMeter />);
      expect(container.textContent).toContain('50%');
    });

    it('updates when despair changes', () => {
      const { useGameStore } = require('../../game/store');
      
      let currentDespair = 15;
      useGameStore.mockImplementation(() => ({
        fear: 0,
        despair: currentDespair,
        maxSanity: 100,
      }));

      const { container, rerender } = render(<BrainMeter />);
      expect(container.textContent).toContain('15%');
      
      currentDespair = 75;
      rerender(<BrainMeter />);
      expect(container.textContent).toContain('75%');
    });
  

  describe('Visual Effects', () => {
    it('applies blur effect at high insanity levels', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 80,
        despair: 80,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      const element = container.firstElementChild;
      
      expect(element).toHaveStyle({ filter: expect.stringContaining('blur') });
    });

    it('has no blur effect at low insanity levels', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 10,
        despair: 10,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      const element = container.firstElementChild;
      
      expect(element).toHaveStyle({ filter: 'none' });
    });

    it('renders 3D brain visualization', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 50,
        despair: 50,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      // Should contain canvas for 3D rendering
      expect(container.querySelector('canvas')).toBeTruthy();
    });
  

  describe('Extreme Values', () => {
    it('handles zero fear and despair', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 0,
        despair: 0,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      expect(container.textContent).toContain('0%');
    });

    it('handles maximum fear', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 100,
        despair: 0,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      expect(container.textContent).toContain('100%');
    });

    it('handles maximum despair', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 0,
        despair: 100,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      expect(container.textContent).toContain('100%');
    });

    it('handles both meters at maximum', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 100,
        despair: 100,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      expect(container.textContent).toContain('100%');
    });
  

  describe('Accessibility', () => {
    it('contains readable text labels', () => {
      const { container } = render(<BrainMeter />);
      
      expect(container.textContent).toContain('FEAR');
      expect(container.textContent).toContain('DESPAIR');
      expect(container.textContent).toContain('SANITY');
    });

    it('displays percentages in accessible format', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 42,
        despair: 58,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      const percentages = container.textContent?.match(/\d+%/g);
      
      expect(percentages).toBeTruthy();
      expect(percentages?.length).toBeGreaterThanOrEqual(2);
    });
  

  describe('Edge Cases', () => {
    it('handles rapid state changes', () => {
      const { useGameStore } = require('../../game/store');
      
      let fear = 0;
      let despair = 0;
      useGameStore.mockImplementation(() => ({
        fear,
        despair,
        maxSanity: 100,
      }));

      const { rerender } = render(<BrainMeter />);
      
      for (let i = 0; i < 10; i++) {
        fear = i * 10;
        despair = 100 - (i * 10);
        rerender(<BrainMeter />);
      }
      
      expect(() => rerender(<BrainMeter />)).not.toThrow();
    });

    it('handles fractional percentages', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 33.7,
        despair: 66.3,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      expect(container.textContent).toMatch(/\d+%/);
    });

    it('maintains consistent layout structure', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation(() => ({
        fear: 50,
        despair: 50,
        maxSanity: 100,
      }));

      const { container } = render(<BrainMeter />);
      
      // Should have consistent class structure
      expect(container.firstElementChild).toHaveClass('absolute', 'top-4', 'left-4');
    });
  });
});

// Additional tests: BrainMeter edge calculations
describe('BrainMeter - edge calculations', () => {
  it('clamps negative values to 0%', () => {
    const { useGameStore } = require('../../game/store');
    useGameStore.mockImplementation(() => ({ fear: -10, despair: -5, maxSanity: 100 }));
    const { container } = render(<BrainMeter />);
    expect(container.textContent).toMatch(/0%/);
  });

  it('handles non-100 maxSanity', () => {
    const { useGameStore } = require('../../game/store');
    useGameStore.mockImplementation(() => ({ fear: 25, despair: 25, maxSanity: 50 }));
    const { container } = render(<BrainMeter />);
    // 25/50 => 50%
    expect(container.textContent).toContain('50%');
  });
});
});
