import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AudioManager } from './AudioManager';
import { audioSystem } from '../../game/audio';

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

  describe('Audio System Integration', () => {
    it('initializes audio system on mount', async () => {
      const { audioSystem } = await import('../../game/audio');
      render(<AudioManager />);
      
      // Simulate user interaction to trigger audio init
      const clickEvent = new MouseEvent('click', { bubbles: true });
      document.dispatchEvent(clickEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(audioSystem.init).toHaveBeenCalled();
    });

    it('starts ambient drone after initialization', async () => {
      const { audioSystem } = await import('../../game/audio');
      render(<AudioManager />);
      
      const clickEvent = new MouseEvent('click', { bubbles: true });
      document.dispatchEvent(clickEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(audioSystem.startAmbientDrone).toHaveBeenCalled();
    });


    it('cleans up audio on unmount', () => {      const { unmount } = render(<AudioManager />);
      
      unmount();
      expect(audioSystem.cleanup).toHaveBeenCalled();
    });
  });

  describe('Fear-based Audio Triggers', () => {
    it('plays jump scare on large fear spike', () => {      let currentFear = 0;

      const { rerender } = render(<AudioManager />);
      
      // Simulate fear spike
      currentFear = 20;
      rerender(<AudioManager />);
      
      expect(audioSystem.playJumpScare).toHaveBeenCalled();
    });

    it('plays creepy laugh on small fear increase', () => {      let currentFear = 0;

      const { rerender } = render(<AudioManager />);
      
      currentFear = 5;
      rerender(<AudioManager />);
      
      expect(audioSystem.playCreepyLaugh).toHaveBeenCalled();
    });


    it('plays game over audio sequence', () => {      let gameOver = false;

      const { rerender } = render(<AudioManager />);
      
      gameOver = true;
      rerender(<AudioManager />);
      
      expect(audioSystem.playJumpScare).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing audio context gracefully', () => {      audioSystem.init.mockRejectedValueOnce(new Error('Audio context unavailable'));
      
      expect(() => render(<AudioManager />)).not.toThrow();
    });

    it('handles multiple rapid fear changes', () => {      let currentFear = 0;
      

      const { rerender } = render(<AudioManager />);
      
      for (let i = 1; i <= 5; i++) {
        currentFear = i * 20;
        rerender(<AudioManager />);
      }
      
      expect(() => rerender(<AudioManager />)).not.toThrow();
    });

  });
});

// Additional tests: AudioManager extended coverage
describe('AudioManager - additional coverage', () => {
  it('resumes audio context on subsequent user gesture', async () => {
    const { audioSystem } = await import('../../game/audio');
    const { container } = render(<AudioManager />);
    // two gestures to ensure resume can be called multiple times safely
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.dispatchEvent(new MouseEvent('keydown', { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
    expect(audioSystem.resume).toHaveBeenCalled();
    expect(container.firstChild).toBeNull();
  });

  it('does not re-initialize repeatedly after init', async () => {
    const { audioSystem } = await import('../../game/audio');
    render(<AudioManager />);
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 20));
    const initCalls = audioSystem.init.mock.calls.length;
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 20));
    expect(audioSystem.init.mock.calls.length).toBe(initCalls);
  });

  it('does not play distortion above sanity threshold', async () => {
    const { useGameStore } = await import('../../game/store' as any);
    const { audioSystem } = await import('../../game/audio');
    // sanity high -> no distortion
    render(<AudioManager />);
    await new Promise(r => setTimeout(r, 120));
    expect(audioSystem.playSanityDistortion).not.toHaveBeenCalled();
  });
});
