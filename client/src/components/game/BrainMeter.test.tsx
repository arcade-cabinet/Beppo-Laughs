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
});
