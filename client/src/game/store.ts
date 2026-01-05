import { create } from 'zustand';
import seedrandom from 'seedrandom';

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
  availableMoves: { direction: 'north' | 'south' | 'east' | 'west'; nodeId: string; isExit: boolean }[];
  
  // Hint System
  hintActive: boolean;        // Whether hint overlays are visible
  
  // Clown Car Driving State
  carSpeed: number;           // Current speed (0-5)
  accelerating: boolean;      // Is accelerator pressed
  braking: boolean;           // Is brake pressed
  
  // Fork Choice State (when at junction with multiple paths)
  pendingFork: {
    nodeId: string;
    options: { direction: 'north' | 'south' | 'east' | 'west'; nodeId: string; isExit: boolean }[];
  } | null;
  
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
  setTargetNode: (nodeId: string | null) => void;
  startMoveTo: (targetNodeId: string, speed?: number) => void;
  updateMoveProgress: (progress: number) => void;
  completeMove: () => void;
  setCameraRotation: (rotation: number) => void;
  setAvailableMoves: (moves: { direction: 'north' | 'south' | 'east' | 'west'; nodeId: string; isExit: boolean }[]) => void;
  
  // Hint Actions
  toggleHint: () => void;
  setHintActive: (active: boolean) => void;
  
  // Clown Car Driving Actions
  setAccelerating: (value: boolean) => void;
  setBraking: (value: boolean) => void;
  setCarSpeed: (speed: number) => void;
  updateDriving: (delta: number) => void;
  
  // Fork Choice Actions
  setPendingFork: (fork: { nodeId: string; options: { direction: 'north' | 'south' | 'east' | 'west'; nodeId: string; isExit: boolean }[] } | null) => void;
  selectForkDirection: (nodeId: string) => void;
  
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
  availableMoves: [],
  
  // Hint system
  hintActive: false,
  
  // Clown car driving
  carSpeed: 0,
  accelerating: false,
  braking: false,
  
  // Fork choice
  pendingFork: null,
  
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
    availableMoves: [],
    hintActive: false,
    carSpeed: 0,
    accelerating: false,
    braking: false,
    pendingFork: null,
  }),
  
  // Rail Navigation Actions
  setCurrentNode: (nodeId) => set({ currentNode: nodeId }),
  setTargetNode: (nodeId) => set({ targetNode: nodeId }),
  
  startMoveTo: (targetNodeId, speed = 1) => {
    const state = get();
    const fearRatio = state.fear / state.maxSanity;
    
    let actualTarget = targetNodeId;
    
    if (fearRatio > 0.3 && state.availableMoves.length > 1) {
      const rng = seedrandom(`fear-${Date.now()}`);
      const confusionChance = (fearRatio - 0.3) * 0.8;
      
      if (rng() < confusionChance) {
        const otherMoves = state.availableMoves.filter(m => m.nodeId !== targetNodeId);
        if (otherMoves.length > 0) {
          const randomMove = otherMoves[Math.floor(rng() * otherMoves.length)];
          actualTarget = randomMove.nodeId;
          console.log('FEAR confusion! Intended:', targetNodeId, 'Actual:', actualTarget);
        }
      }
    }
    
    set({
      targetNode: actualTarget,
      isMoving: true,
      moveProgress: 0,
      moveSpeed: speed
    });
  },
  
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
  
  setAvailableMoves: (moves) => set({ availableMoves: moves }),
  
  // Hint actions
  toggleHint: () => set(state => ({ hintActive: !state.hintActive })),
  setHintActive: (active) => set({ hintActive: active }),
  
  // Clown car driving actions
  setAccelerating: (value) => set({ accelerating: value }),
  setBraking: (value) => set({ braking: value }),
  setPendingFork: (fork) => set({ pendingFork: fork }),
  
  selectForkDirection: (targetNodeId) => set({ 
    pendingFork: null,
    targetNode: targetNodeId 
  }),
  setCarSpeed: (speed) => set({ carSpeed: Math.max(0, Math.min(5, speed)) }),
  
  updateDriving: (delta) => {
    const state = get();
    const { accelerating, braking, carSpeed } = state;
    
    let newSpeed = carSpeed;
    
    if (accelerating) {
      newSpeed = Math.min(5, carSpeed + delta * 3);
    } else if (braking) {
      newSpeed = Math.max(0, carSpeed - delta * 5);
    } else {
      newSpeed = Math.max(0, carSpeed - delta * 1);
    }
    
    set({ carSpeed: newSpeed });
  },
  
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
