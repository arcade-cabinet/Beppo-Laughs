import seedrandom from 'seedrandom';

export type Cell = {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
  isCenter: boolean;
  isExit: boolean;
};

// Rail graph types for tap-based navigation
export type RailNode = {
  id: string;
  x: number;
  y: number;
  worldX: number;
  worldZ: number;
  connections: string[]; // IDs of connected nodes
  isCenter: boolean;
  isExit: boolean;
  hasCollectible: boolean;
  hasVillain: boolean;
};

export type RailEdge = {
  from: string;
  to: string;
  distance: number;
  direction: 'north' | 'south' | 'east' | 'west';
};

export type RailGraph = {
  nodes: Map<string, RailNode>;
  edges: RailEdge[];
  centerNode: string;
  exitNodes: string[];
};

export class MazeGenerator {
  width: number;
  height: number;
  grid: Cell[][];
  rng: seedrandom.PRNG;
  centerX: number;
  centerY: number;
  exitCells: { x: number; y: number }[];
  railGraph: RailGraph;

  constructor(width: number, height: number, seed: string) {
    // Ensure odd dimensions for true center
    this.width = width % 2 === 0 ? width + 1 : width;
    this.height = height % 2 === 0 ? height + 1 : height;
    this.rng = seedrandom(seed);
    this.grid = [];
    this.centerX = Math.floor(this.width / 2);
    this.centerY = Math.floor(this.height / 2);
    this.exitCells = [];
    this.railGraph = { nodes: new Map(), edges: [], centerNode: '', exitNodes: [] };
    
    this.initGrid();
    this.generateReverseMiNotaur();
    this.createExits();
    this.buildRailGraph();
  }

  initGrid() {
    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < this.width; x++) {
        const isCenter = x === this.centerX && y === this.centerY;
        row.push({
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false,
          isCenter,
          isExit: false,
        });
      }
      this.grid.push(row);
    }
  }

  // Reverse Minotaur: Start from CENTER and carve outward
  generateReverseMiNotaur() {
    const stack: Cell[] = [];
    const startCell = this.grid[this.centerY][this.centerX];
    startCell.visited = true;
    stack.push(startCell);

    while (stack.length > 0) {
      const current = stack.pop()!;
      const neighbors = this.getUnvisitedNeighbors(current);

      if (neighbors.length > 0) {
        stack.push(current);
        
        // Randomly select a neighbor
        const randomIndex = Math.floor(this.rng() * neighbors.length);
        const next = neighbors[randomIndex];

        this.removeWalls(current, next);
        next.visited = true;
        stack.push(next);
      }
    }
  }

  // Create exits on the perimeter
  createExits() {
    // Find all perimeter cells and pick random exits
    const perimeterCells: Cell[] = [];
    
    for (let x = 0; x < this.width; x++) {
      perimeterCells.push(this.grid[0][x]); // Top edge
      perimeterCells.push(this.grid[this.height - 1][x]); // Bottom edge
    }
    for (let y = 1; y < this.height - 1; y++) {
      perimeterCells.push(this.grid[y][0]); // Left edge
      perimeterCells.push(this.grid[y][this.width - 1]); // Right edge
    }

    // Pick 1-3 random exits
    const numExits = 1 + Math.floor(this.rng() * 3);
    const shuffled = perimeterCells.sort(() => this.rng() - 0.5);
    
    for (let i = 0; i < Math.min(numExits, shuffled.length); i++) {
      const exitCell = shuffled[i];
      exitCell.isExit = true;
      this.exitCells.push({ x: exitCell.x, y: exitCell.y });
      
      // Open the outer wall for this exit
      if (exitCell.y === 0) exitCell.walls.top = false;
      if (exitCell.y === this.height - 1) exitCell.walls.bottom = false;
      if (exitCell.x === 0) exitCell.walls.left = false;
      if (exitCell.x === this.width - 1) exitCell.walls.right = false;
    }
  }

  getUnvisitedNeighbors(cell: Cell): Cell[] {
    const neighbors: Cell[] = [];
    const { x, y } = cell;

    if (y > 0 && !this.grid[y - 1][x].visited) neighbors.push(this.grid[y - 1][x]);
    if (x < this.width - 1 && !this.grid[y][x + 1].visited) neighbors.push(this.grid[y][x + 1]);
    if (y < this.height - 1 && !this.grid[y + 1][x].visited) neighbors.push(this.grid[y + 1][x]);
    if (x > 0 && !this.grid[y][x - 1].visited) neighbors.push(this.grid[y][x - 1]);

    return neighbors;
  }

  removeWalls(a: Cell, b: Cell) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    if (dx === 1) {
      a.walls.left = false;
      b.walls.right = false;
    } else if (dx === -1) {
      a.walls.right = false;
      b.walls.left = false;
    }

    if (dy === 1) {
      a.walls.top = false;
      b.walls.bottom = false;
    } else if (dy === -1) {
      a.walls.bottom = false;
      b.walls.top = false;
    }
  }

  // Build rail graph for tap-based navigation
  buildRailGraph() {
    const CELL_SIZE = 3;
    const nodes = new Map<string, RailNode>();
    const edges: RailEdge[] = [];

    // Create a node for every cell
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        const nodeId = `${x},${y}`;
        
        nodes.set(nodeId, {
          id: nodeId,
          x,
          y,
          worldX: x * CELL_SIZE,
          worldZ: y * CELL_SIZE,
          connections: [],
          isCenter: cell.isCenter,
          isExit: cell.isExit,
          hasCollectible: false,
          hasVillain: false,
        });
      }
    }

    // Build connections based on open walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        const nodeId = `${x},${y}`;
        const node = nodes.get(nodeId)!;

        // Check each direction for open passages
        if (!cell.walls.top && y > 0) {
          const neighborId = `${x},${y - 1}`;
          node.connections.push(neighborId);
          edges.push({
            from: nodeId,
            to: neighborId,
            distance: CELL_SIZE,
            direction: 'north'
          });
        }
        if (!cell.walls.bottom && y < this.height - 1) {
          const neighborId = `${x},${y + 1}`;
          node.connections.push(neighborId);
          edges.push({
            from: nodeId,
            to: neighborId,
            distance: CELL_SIZE,
            direction: 'south'
          });
        }
        if (!cell.walls.left && x > 0) {
          const neighborId = `${x - 1},${y}`;
          node.connections.push(neighborId);
          edges.push({
            from: nodeId,
            to: neighborId,
            distance: CELL_SIZE,
            direction: 'west'
          });
        }
        if (!cell.walls.right && x < this.width - 1) {
          const neighborId = `${x + 1},${y}`;
          node.connections.push(neighborId);
          edges.push({
            from: nodeId,
            to: neighborId,
            distance: CELL_SIZE,
            direction: 'east'
          });
        }
      }
    }

    this.railGraph = {
      nodes,
      edges,
      centerNode: `${this.centerX},${this.centerY}`,
      exitNodes: this.exitCells.map(c => `${c.x},${c.y}`)
    };
  }

  // Get center cell world position
  getCenterPosition(): { x: number; z: number } {
    return {
      x: this.centerX * 2,
      z: this.centerY * 2
    };
  }

  // Get available moves from a node (for tap zones)
  getAvailableMoves(nodeId: string): RailNode[] {
    const node = this.railGraph.nodes.get(nodeId);
    if (!node) return [];
    
    return node.connections
      .map(id => this.railGraph.nodes.get(id))
      .filter((n): n is RailNode => n !== undefined);
  }

  // Get direction between two nodes
  getDirection(fromId: string, toId: string): 'north' | 'south' | 'east' | 'west' | null {
    const from = this.railGraph.nodes.get(fromId);
    const to = this.railGraph.nodes.get(toId);
    if (!from || !to) return null;

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (dy < 0) return 'north';
    if (dy > 0) return 'south';
    if (dx < 0) return 'west';
    if (dx > 0) return 'east';
    return null;
  }
}
