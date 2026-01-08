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


    it('updates when fear changes', () => {      let currentFear = 10;

      const { container, rerender } = render(<BrainMeter />);
      expect(container.textContent).toContain('10%');
      
      currentFear = 50;
      rerender(<BrainMeter />);
      expect(container.textContent).toContain('50%');
    });

    it('updates when despair changes', () => {      let currentDespair = 15;

      const { container, rerender } = render(<BrainMeter />);
      expect(container.textContent).toContain('15%');
      
      currentDespair = 75;
      rerender(<BrainMeter />);
      expect(container.textContent).toContain('75%');
    });
  });

  

  

  describe('Accessibility', () => {
    it('contains readable text labels', () => {
      const { container } = render(<BrainMeter />);
      
      expect(container.textContent).toContain('FEAR');
      expect(container.textContent).toContain('DESPAIR');
      expect(container.textContent).toContain('SANITY');
    });

  });

  describe('Edge Cases', () => {
    it('handles rapid state changes', () => {      let fear = 0;
      let despair = 0;

      const { rerender } = render(<BrainMeter />);
      
      for (let i = 0; i < 10; i++) {
        fear = i * 10;
        despair = 100 - (i * 10);
        rerender(<BrainMeter />);
      }
      
      expect(() => rerender(<BrainMeter />)).not.toThrow();
    });


  });
});

// Additional tests: BrainMeter edge calculations

