import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AudioManager } from './AudioManager';

// Mock audioSystem
vi.mock('../../game/audio', () => ({
  audioSystem: {
    init: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
    startAmbientDrone: vi.fn(),
    updateDroneIntensity: vi.fn(),
    playJumpScare: vi.fn(),
    playCreepyLaugh: vi.fn(),
    playSanityDistortion: vi.fn(),
    cleanup: vi.fn(),
  },
}));

// Mock useGameStore
vi.mock('../../game/store', () => ({
  useGameStore: vi.fn((selector) => {
    const mockState = {
      fear: 0,
      despair: 0,
      isGameOver: false,
      hasWon: false,
      getSanityLevel: () => 100,
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

describe('AudioManager', () => {
  it('renders without crashing', () => {
    const { container } = render(<AudioManager />);
    // AudioManager returns null, so container should have no direct children
    expect(container.firstChild).toBeNull();
  });

  it('renders null as expected', () => {
    const { container } = render(<AudioManager />);
    expect(container.innerHTML).toBe('');
  });

  it('can be mounted and unmounted without errors', () => {
    const { unmount } = render(<AudioManager />);
    expect(() => unmount()).not.toThrow();
  });
});
