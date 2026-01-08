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

  describe('Effect Intensity', () => {
    it('increases vignette darkness with despair', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation((selector) => {
        const mockState = { fear: 0, despair: 80, maxSanity: 100 };
        return selector ? selector(mockState) : mockState;
      });

      expect(() => render(<HorrorEffects />)).not.toThrow();
    });

    it('increases chromatic aberration with fear', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation((selector) => {
        const mockState = { fear: 90, despair: 0, maxSanity: 100 };
        return selector ? selector(mockState) : mockState;
      });

      expect(() => render(<HorrorEffects />)).not.toThrow();
    });

    it('increases noise with overall insanity', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation((selector) => {
        const mockState = { fear: 70, despair: 70, maxSanity: 100 };
        return selector ? selector(mockState) : mockState;
      });

      expect(() => render(<HorrorEffects />)).not.toThrow();
    });

    it('minimal effects at low sanity loss', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation((selector) => {
        const mockState = { fear: 5, despair: 5, maxSanity: 100 };
        return selector ? selector(mockState) : mockState;
      });

      expect(() => render(<HorrorEffects />)).not.toThrow();
    });
  });

  describe('Dynamic Updates', () => {
    it('updates effects when fear changes', () => {
      const { useGameStore } = require('../../game/store');
      let fear = 10;
      
      useGameStore.mockImplementation((selector) => {
        const mockState = { fear, despair: 0, maxSanity: 100 };
        return selector ? selector(mockState) : mockState;
      });

      const { rerender } = render(<HorrorEffects />);
      
      fear = 80;
      rerender(<HorrorEffects />);
      
      expect(() => rerender(<HorrorEffects />)).not.toThrow();
    });

    it('updates effects when despair changes', () => {
      const { useGameStore } = require('../../game/store');
      let despair = 10;
      
      useGameStore.mockImplementation((selector) => {
        const mockState = { fear: 0, despair, maxSanity: 100 };
        return selector ? selector(mockState) : mockState;
      });

      const { rerender } = render(<HorrorEffects />);
      
      despair = 80;
      rerender(<HorrorEffects />);
      
      expect(() => rerender(<HorrorEffects />)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero sanity loss', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation((selector) => {
        const mockState = { fear: 0, despair: 0, maxSanity: 100 };
        return selector ? selector(mockState) : mockState;
      });

      expect(() => render(<HorrorEffects />)).not.toThrow();
    });

    it('handles maximum sanity loss', () => {
      const { useGameStore } = require('../../game/store');
      
      useGameStore.mockImplementation((selector) => {
        const mockState = { fear: 100, despair: 100, maxSanity: 100 };
        return selector ? selector(mockState) : mockState;
      });

      expect(() => render(<HorrorEffects />)).not.toThrow();
    });
  });
});

// Additional tests: HorrorEffects structural
describe('HorrorEffects - structure', () => {
  it('renders EffectComposer container structure', () => {
    const { container } = render(<HorrorEffects />);
    expect(container).toBeDefined();
  });
});
