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
  
  // Game State
  seed: string;
  isGameOver: boolean;
  hasWon: boolean;
  gameOverReason: 'fear' | 'despair' | 'both' | null;
  
  // Blockades (villain-created obstacles)
  blockades: Set<string>;
  
  // Collected Items
  collectedItems: Set<string>;
  
  // Rail Navigation State
  currentNode: string;        // Current position node ID
  targetNode: string | null;  // Node we're moving toward
  isMoving: boolean;          // Currently in transit
  moveProgress: number;       // 0-1 progress along edge
  moveSpeed: number;          // Speed multiplier (1 = normal, 1.5 = run, 0.7 = slow)
  cameraRotation: number;     // Camera Y rotation in radians
  
  // Actions
  setSeed: (seed: string) => void;
  visitNode: (nodeId: string) => void;
  increaseFear: (amount: number) => void;
  increaseDespair: (amount: number) => void;
  decreaseFear: (amount: number) => void;
  decreaseDespair: (amount: number) => void;
  addBlockade: (cellKey: string) => void;
  removeBlockade: (cellKey: string) => void;
  collectItem: (itemId: string) => void;
  checkGameOver: () => void;
  triggerWin: () => void;
  resetGame: () => void;
  
  // Rail Navigation Actions
  setCurrentNode: (nodeId: string) => void;
  startMoveTo: (targetNodeId: string, speed?: number) => void;
  updateMoveProgress: (progress: number) => void;
  completeMove: () => void;
  setCameraRotation: (rotation: number) => void;
  
  // Computed
  getSanityLevel: () => number;
  isInverted: () => boolean;
}

const cellKey = (nodeId: string) => nodeId;

export const useGameStore = create<GameState>((set, get) => ({
  fear: 0,      // Start fully sane
  despair: 0,   // Start fully sane
  maxSanity: 100,
  
  visitedCells: new Map(),
  pathHistory: [],
  
  seed: '',
  isGameOver: false,
  hasWon: false,
  gameOverReason: null,
  
  blockades: new Set(),
  collectedItems: new Set(),
  
  // Rail navigation - initialized empty, set by maze
  currentNode: '',
  targetNode: null,
  isMoving: false,
  moveProgress: 0,
  moveSpeed: 1,
  cameraRotation: 0,
  
  setSeed: (seed) => set({ seed }),
  
  visitNode: (nodeId) => {
    const state = get();
    const now = Date.now();
    const [xStr, zStr] = nodeId.split(',');
    const x = parseInt(xStr);
    const z = parseInt(zStr);
    
    const existingCell = state.visitedCells.get(nodeId);
    
    if (!existingCell) {
      // NEW NODE - Exploring the unknown increases FEAR
      const newVisited = new Map(state.visitedCells);
      newVisited.set(nodeId, { 
        x, z, 
        visitCount: 1, 
        firstVisitTime: now 
      });
      
      set({ 
        visitedCells: newVisited,
        pathHistory: [...state.pathHistory, { x, z, timestamp: now }],
      });
      
      // Increase fear for exploring unknown
      get().increaseFear(1);
    } else {
      // REVISIT - Walking in circles increases DESPAIR
      const newVisited = new Map(state.visitedCells);
      const updatedCell = { ...existingCell, visitCount: existingCell.visitCount + 1 };
      newVisited.set(nodeId, updatedCell);
      
      set({ 
        visitedCells: newVisited,
        pathHistory: [...state.pathHistory, { x, z, timestamp: now }],
      });
      
      // Increase despair based on revisit count
      const despairIncrease = Math.min(updatedCell.visitCount * 0.5, 3);
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
  
  triggerWin: () => set({ hasWon: true }),
  
  resetGame: () => set({
    fear: 0,
    despair: 0,
    visitedCells: new Map(),
    pathHistory: [],
    isGameOver: false,
    hasWon: false,
    gameOverReason: null,
    blockades: new Set(),
    collectedItems: new Set(),
    currentNode: '',
    targetNode: null,
    isMoving: false,
    moveProgress: 0,
    moveSpeed: 1,
    cameraRotation: 0,
  }),
  
  // Rail Navigation Actions
  setCurrentNode: (nodeId) => set({ currentNode: nodeId }),
  
  startMoveTo: (targetNodeId, speed = 1) => set({
    targetNode: targetNodeId,
    isMoving: true,
    moveProgress: 0,
    moveSpeed: speed
  }),
  
  updateMoveProgress: (progress) => set({ moveProgress: Math.min(1, progress) }),
  
  completeMove: () => {
    const state = get();
    const targetNode = state.targetNode;
    
    if (targetNode) {
      set({
        currentNode: targetNode,
        targetNode: null,
        isMoving: false,
        moveProgress: 0
      });
      
      // Record visit to new node
      get().visitNode(targetNode);
    }
  },
  
  setCameraRotation: (rotation) => set({ cameraRotation: rotation }),
  
  getSanityLevel: () => {
    const state = get();
    const avgInsanity = (state.fear + state.despair) / 2;
    return 100 - avgInsanity; // 100 = sane, 0 = insane
  },
  
  isInverted: () => {
    const state = get();
    return (state.fear + state.despair) > 140;
  },
}));
