import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';

describe('GameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('initial state', () => {
    it('starts with zero fear and despair', () => {
      const state = useGameStore.getState();
      expect(state.fear).toBe(0);
      expect(state.despair).toBe(0);
    });

    it('starts with max sanity of 100', () => {
      expect(useGameStore.getState().maxSanity).toBe(100);
    });

    it('starts with no visited cells', () => {
      expect(useGameStore.getState().visitedCells.size).toBe(0);
    });

    it('starts with no blockades', () => {
      expect(useGameStore.getState().blockades.size).toBe(0);
    });

    it('starts not game over', () => {
      const state = useGameStore.getState();
      expect(state.isGameOver).toBe(false);
      expect(state.hasWon).toBe(false);
    });

    it('starts not moving', () => {
      const state = useGameStore.getState();
      expect(state.isMoving).toBe(false);
      expect(state.moveProgress).toBe(0);
    });
  });

  describe('fear mechanics', () => {
    it('increases fear correctly', () => {
      useGameStore.getState().increaseFear(10);
      expect(useGameStore.getState().fear).toBe(10);
    });

    it('clamps fear at max sanity', () => {
      useGameStore.getState().increaseFear(150);
      expect(useGameStore.getState().fear).toBe(100);
    });

    it('decreases fear correctly', () => {
      useGameStore.getState().increaseFear(50);
      useGameStore.getState().decreaseFear(20);
      expect(useGameStore.getState().fear).toBe(30);
    });

    it('clamps fear at zero', () => {
      useGameStore.getState().increaseFear(10);
      useGameStore.getState().decreaseFear(50);
      expect(useGameStore.getState().fear).toBe(0);
    });
  });

  describe('despair mechanics', () => {
    it('increases despair correctly', () => {
      useGameStore.getState().increaseDespair(15);
      expect(useGameStore.getState().despair).toBe(15);
    });

    it('clamps despair at max sanity', () => {
      useGameStore.getState().increaseDespair(200);
      expect(useGameStore.getState().despair).toBe(100);
    });

    it('decreases despair correctly', () => {
      useGameStore.getState().increaseDespair(40);
      useGameStore.getState().decreaseDespair(10);
      expect(useGameStore.getState().despair).toBe(30);
    });

    it('clamps despair at zero', () => {
      useGameStore.getState().decreaseDespair(100);
      expect(useGameStore.getState().despair).toBe(0);
    });
  });

  describe('node visiting', () => {
    it('records new node visit', () => {
      useGameStore.getState().visitNode('1,2');
      expect(useGameStore.getState().visitedCells.has('1,2')).toBe(true);
    });

    it('increases fear on first visit', () => {
      const initialFear = useGameStore.getState().fear;
      useGameStore.getState().visitNode('3,4');
      expect(useGameStore.getState().fear).toBeGreaterThan(initialFear);
    });

    it('increases despair on revisit', () => {
      useGameStore.getState().visitNode('5,6');
      const fearAfterFirst = useGameStore.getState().fear;
      const despairAfterFirst = useGameStore.getState().despair;
      
      useGameStore.getState().visitNode('5,6');
      expect(useGameStore.getState().despair).toBeGreaterThan(despairAfterFirst);
      expect(useGameStore.getState().fear).toBe(fearAfterFirst);
    });

    it('tracks visit count', () => {
      useGameStore.getState().visitNode('7,8');
      useGameStore.getState().visitNode('7,8');
      useGameStore.getState().visitNode('7,8');
      
      const cell = useGameStore.getState().visitedCells.get('7,8');
      expect(cell?.visitCount).toBe(3);
    });
  });

  describe('blockades', () => {
    it('adds blockades', () => {
      useGameStore.getState().addBlockade('1,1');
      expect(useGameStore.getState().blockades.has('1,1')).toBe(true);
    });

    it('removes blockades', () => {
      useGameStore.getState().addBlockade('2,2');
      useGameStore.getState().removeBlockade('2,2');
      expect(useGameStore.getState().blockades.has('2,2')).toBe(false);
    });

    it('removing non-existent blockade is safe', () => {
      expect(() => useGameStore.getState().removeBlockade('nonexistent')).not.toThrow();
    });
  });

  describe('collectibles', () => {
    it('collects items', () => {
      useGameStore.getState().collectItem('item-1');
      expect(useGameStore.getState().collectedItems.has('item-1')).toBe(true);
    });

    it('prevents duplicate collection', () => {
      useGameStore.getState().collectItem('item-2');
      useGameStore.getState().collectItem('item-2');
      expect(useGameStore.getState().collectedItems.size).toBe(1);
    });
  });

  describe('game over conditions', () => {
    it('triggers game over when fear reaches max', () => {
      useGameStore.getState().increaseFear(100);
      useGameStore.getState().checkGameOver();
      
      const state = useGameStore.getState();
      expect(state.isGameOver).toBe(true);
      expect(state.hasWon).toBe(false);
      expect(state.gameOverReason).toBe('fear');
    });

    it('triggers game over when despair reaches max', () => {
      useGameStore.getState().increaseDespair(100);
      useGameStore.getState().checkGameOver();
      
      const state = useGameStore.getState();
      expect(state.isGameOver).toBe(true);
      expect(state.hasWon).toBe(false);
      expect(state.gameOverReason).toBe('despair');
    });

    it('triggers game over with both at max', () => {
      useGameStore.getState().increaseFear(100);
      useGameStore.getState().increaseDespair(100);
      useGameStore.getState().checkGameOver();
      
      expect(useGameStore.getState().gameOverReason).toBe('both');
    });

    it('does not game over below threshold', () => {
      useGameStore.getState().increaseFear(99);
      useGameStore.getState().increaseDespair(99);
      useGameStore.getState().checkGameOver();
      
      expect(useGameStore.getState().isGameOver).toBe(false);
    });
  });

  describe('win condition', () => {
    it('triggers win state', () => {
      useGameStore.getState().triggerWin();
      
      const state = useGameStore.getState();
      expect(state.hasWon).toBe(true);
    });
  });

  describe('rail navigation', () => {
    it('sets current node', () => {
      useGameStore.getState().setCurrentNode('5,5');
      expect(useGameStore.getState().currentNode).toBe('5,5');
    });

    it('starts movement to target', () => {
      useGameStore.getState().setCurrentNode('0,0');
      useGameStore.getState().startMoveTo('1,0', 1.5);
      
      const state = useGameStore.getState();
      expect(state.isMoving).toBe(true);
      expect(state.targetNode).toBe('1,0');
      expect(state.moveSpeed).toBe(1.5);
      expect(state.moveProgress).toBe(0);
    });

    it('updates move progress', () => {
      useGameStore.getState().startMoveTo('1,1');
      useGameStore.getState().updateMoveProgress(0.5);
      expect(useGameStore.getState().moveProgress).toBe(0.5);
    });

    it('completes move correctly', () => {
      useGameStore.getState().setCurrentNode('0,0');
      useGameStore.getState().startMoveTo('1,0');
      useGameStore.getState().completeMove();
      
      const state = useGameStore.getState();
      expect(state.currentNode).toBe('1,0');
      expect(state.isMoving).toBe(false);
      expect(state.targetNode).toBeNull();
      expect(state.moveProgress).toBe(0);
    });

    it('sets camera rotation', () => {
      useGameStore.getState().setCameraRotation(Math.PI / 2);
      expect(useGameStore.getState().cameraRotation).toBe(Math.PI / 2);
    });
  });

  describe('computed values', () => {
    it('getSanityLevel returns remaining sanity (100 minus average insanity)', () => {
      useGameStore.getState().increaseFear(50);
      useGameStore.getState().increaseDespair(30);
      
      const level = useGameStore.getState().getSanityLevel();
      expect(level).toBe(60);
    });

    it('getSanityLevel is 100 at full sanity', () => {
      expect(useGameStore.getState().getSanityLevel()).toBe(100);
    });

    it('getSanityLevel is 0 at total insanity', () => {
      useGameStore.getState().increaseFear(100);
      useGameStore.getState().increaseDespair(100);
      expect(useGameStore.getState().getSanityLevel()).toBe(0);
    });

    it('isInverted returns true at high sanity loss', () => {
      useGameStore.getState().increaseFear(80);
      useGameStore.getState().increaseDespair(80);
      
      expect(useGameStore.getState().isInverted()).toBe(true);
    });

    it('isInverted returns false at low sanity loss', () => {
      useGameStore.getState().increaseFear(30);
      expect(useGameStore.getState().isInverted()).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets all state', () => {
      useGameStore.getState().increaseFear(50);
      useGameStore.getState().increaseDespair(30);
      useGameStore.getState().addBlockade('1,1');
      useGameStore.getState().collectItem('item-1');
      useGameStore.getState().visitNode('2,2');
      useGameStore.getState().triggerWin();
      
      useGameStore.getState().resetGame();
      
      const state = useGameStore.getState();
      expect(state.fear).toBe(0);
      expect(state.despair).toBe(0);
      expect(state.blockades.size).toBe(0);
      expect(state.collectedItems.size).toBe(0);
      expect(state.visitedCells.size).toBe(0);
      expect(state.isGameOver).toBe(false);
      expect(state.hasWon).toBe(false);
    });
  });

  describe('seed management', () => {
    it('sets seed', () => {
      useGameStore.getState().setSeed('my-seed');
      expect(useGameStore.getState().seed).toBe('my-seed');
    });
  });
});
