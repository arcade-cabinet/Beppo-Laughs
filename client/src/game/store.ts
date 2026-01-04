import { create } from 'zustand';

interface GameState {
  fear: number;
  maxFear: number;
  isInverted: boolean;
  seed: string;
  setSeed: (seed: string) => void;
  increaseFear: (amount: number) => void;
  decreaseFear: (amount: number) => void;
  resetFear: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  fear: 0,
  maxFear: 100,
  isInverted: false,
  seed: '',
  setSeed: (seed) => set({ seed }),
  increaseFear: (amount) => set((state) => {
    const newFear = Math.min(state.fear + amount, state.maxFear);
    // Invert controls randomly if fear is high (> 70)
    const shouldInvert = newFear > 70 && Math.random() > 0.9; 
    
    return { 
      fear: newFear,
      isInverted: shouldInvert ? true : state.isInverted
    };
  }),
  decreaseFear: (amount) => set((state) => {
    const newFear = Math.max(state.fear - amount, 0);
    // Clear inversion if fear drops below 50
    const shouldClearInversion = newFear < 50;
    
    return { 
      fear: newFear,
      isInverted: shouldClearInversion ? false : state.isInverted
    };
  }),
  resetFear: () => set({ fear: 0, isInverted: false }),
  resetGame: () => set({ fear: 0, isInverted: false, seed: '' }),
}));
