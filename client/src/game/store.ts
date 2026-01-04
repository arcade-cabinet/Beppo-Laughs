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
    const shouldInvert = newFear > 70 && Math.random() > 0.95; 
    // Revert randomly if fear drops or just chaos
    const shouldRevert = state.isInverted && Math.random() > 0.9;
    
    return { 
      fear: newFear,
      isInverted: shouldInvert ? true : (shouldRevert ? false : state.isInverted)
    };
  }),
  decreaseFear: (amount) => set((state) => ({ 
    fear: Math.max(state.fear - amount, 0),
    isInverted: state.fear < 50 ? false : state.isInverted // Clear inversion if fear drops enough
  })),
  resetFear: () => set({ fear: 0, isInverted: false }),
}));
