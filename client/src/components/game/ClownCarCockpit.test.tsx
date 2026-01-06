import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ClownCarCockpit } from './ClownCarCockpit';

// Mock R3F and Drei
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Text: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: {
    getState: vi.fn(() => ({
      accelerating: false,
      braking: false,
      fear: 0,
      despair: 0,
      maxSanity: 100,
      carSpeed: 0,
    })),
  },
}));

describe('ClownCarCockpit', () => {
  it('renders without crashing', () => {
    // We expect this to render nothing in the DOM since it's all R3F components
    // but it should not throw.
    const { container } = render(<ClownCarCockpit />);
    expect(container).toBeDefined();
  });
});
