import { create } from 'zustand';

interface VisitedCell {
  x: number;
  z: number;
  visitCount: number;
  firstVisitTime: number;
}

interface GameState {
  // Dual Sanity Meters
  fear: number;           // Red - exploring the unknown
  despair: number;        // Blue - retreading known ground
  maxSanity: number;
  
  // Path Tracking
  visitedCells: Map<string, VisitedCell>;
  pathHistory: Array<{ x: number, z: number, timestamp: number }>;
  currentCell: { x: number, z: number } | null;
  
  // Game State
  seed: string;
  isGameOver: boolean;
  gameOverReason: 'fear' | 'despair' | 'both' | null;
  
  // Blockades (villain-created obstacles)
  blockades: Set<string>;
  
  // Collected Items
  collectedItems: Set<string>;
  
  // Actions
  setSeed: (seed: string) => void;
  updatePlayerPosition: (x: number, z: number) => void;
  increaseFear: (amount: number) => void;
  increaseDespair: (amount: number) => void;
  decreaseFear: (amount: number) => void;
  decreaseDespair: (amount: number) => void;
  addBlockade: (cellKey: string) => void;
  removeBlockade: (cellKey: string) => void;
  collectItem: (itemId: string) => void;
  checkGameOver: () => void;
  resetGame: () => void;
  
  // Computed
  getSanityLevel: () => number;
  isInverted: () => boolean;
}

const cellKey = (x: number, z: number) => `${Math.floor(x / 2)},${Math.floor(z / 2)}`;

export const useGameStore = create<GameState>((set, get) => ({
  fear: 0,
  despair: 0,
  maxSanity: 100,
  
  visitedCells: new Map(),
  pathHistory: [],
  currentCell: null,
  
  seed: '',
  isGameOver: false,
  gameOverReason: null,
  
  blockades: new Set(),
  collectedItems: new Set(),
  
  setSeed: (seed) => set({ seed }),
  
  updatePlayerPosition: (x, z) => {
    const key = cellKey(x, z);
    const state = get();
    const now = Date.now();
    
    // Check if this is a new cell or retread
    const existingCell = state.visitedCells.get(key);
    
    if (!existingCell) {
      // NEW CELL - Exploring the unknown increases FEAR
      const newVisited = new Map(state.visitedCells);
      newVisited.set(key, { 
        x: Math.floor(x / 2), 
        z: Math.floor(z / 2), 
        visitCount: 1, 
        firstVisitTime: now 
      });
      
      set({ 
        visitedCells: newVisited,
        pathHistory: [...state.pathHistory, { x, z, timestamp: now }],
        currentCell: { x: Math.floor(x / 2), z: Math.floor(z / 2) }
      });
      
      // Increase fear for exploring unknown
      get().increaseFear(0.5);
    } else {
      // RETREAD - Walking in circles increases DESPAIR
      const newVisited = new Map(state.visitedCells);
      const updatedCell = { ...existingCell, visitCount: existingCell.visitCount + 1 };
      newVisited.set(key, updatedCell);
      
      set({ 
        visitedCells: newVisited,
        pathHistory: [...state.pathHistory, { x, z, timestamp: now }],
        currentCell: { x: Math.floor(x / 2), z: Math.floor(z / 2) }
      });
      
      // Increase despair based on how many times visited
      const despairIncrease = Math.min(updatedCell.visitCount * 0.3, 2);
      get().increaseDespair(despairIncrease);
    }
    
    get().checkGameOver();
  },
  
  increaseFear: (amount) => set((state) => ({
    fear: Math.min(state.fear + amount, state.maxSanity)
  })),
  
  increaseDespair: (amount) => set((state) => ({
    despair: Math.min(state.despair + amount, state.maxSanity)
  })),
  
  decreaseFear: (amount) => set((state) => ({
    fear: Math.max(state.fear - amount, 0)
  })),
  
  decreaseDespair: (amount) => set((state) => ({
    despair: Math.max(state.despair - amount, 0)
  })),
  
  addBlockade: (cellKey) => set((state) => {
    const newBlockades = new Set(state.blockades);
    newBlockades.add(cellKey);
    return { blockades: newBlockades };
  }),
  
  removeBlockade: (cellKey) => set((state) => {
    const newBlockades = new Set(state.blockades);
    newBlockades.delete(cellKey);
    return { blockades: newBlockades };
  }),
  
  collectItem: (itemId) => set((state) => {
    const newItems = new Set(state.collectedItems);
    newItems.add(itemId);
    // Collecting items reduces both meters slightly
    return { 
      collectedItems: newItems,
      fear: Math.max(state.fear - 5, 0),
      despair: Math.max(state.despair - 5, 0)
    };
  }),
  
  checkGameOver: () => {
    const state = get();
    if (state.fear >= state.maxSanity && state.despair >= state.maxSanity) {
      set({ isGameOver: true, gameOverReason: 'both' });
    } else if (state.fear >= state.maxSanity) {
      set({ isGameOver: true, gameOverReason: 'fear' });
    } else if (state.despair >= state.maxSanity) {
      set({ isGameOver: true, gameOverReason: 'despair' });
    }
  },
  
  resetGame: () => set({
    fear: 0,
    despair: 0,
    visitedCells: new Map(),
    pathHistory: [],
    currentCell: null,
    isGameOver: false,
    gameOverReason: null,
    blockades: new Set(),
    collectedItems: new Set(),
  }),
  
  getSanityLevel: () => {
    const state = get();
    const avgSanity = (state.fear + state.despair) / 2;
    return 100 - avgSanity; // 100 = sane, 0 = insane
  },
  
  isInverted: () => {
    const state = get();
    // Controls invert at high combined sanity loss
    return (state.fear + state.despair) > 120 && Math.random() > 0.7;
  },
}));
