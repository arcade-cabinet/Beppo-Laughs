import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HorrorEffects } from './HorrorEffects';

// Mock postprocessing components
vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Vignette: () => null,
  ChromaticAberration: () => null,
  Noise: () => null,
}));

// Mock BlendFunction
vi.mock('postprocessing', () => ({
  BlendFunction: {
    NORMAL: 0,
    OVERLAY: 1,
  },
}));

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn((selector) => {
    const mockState = {
      fear: 0,
      despair: 0,
      maxSanity: 100,
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

describe('HorrorEffects', () => {
  it('renders without crashing', () => {
    const { container } = render(<HorrorEffects />);
    expect(container).toBeDefined();
  });

  it('renders with default sanity levels', () => {
    expect(() => render(<HorrorEffects />)).not.toThrow();
  });

  it('can be mounted and unmounted without errors', () => {
    const { unmount } = render(<HorrorEffects />);
    expect(() => unmount()).not.toThrow();
  });
});
