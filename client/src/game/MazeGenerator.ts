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
};

export class MazeGenerator {
  width: number;
  height: number;
  grid: Cell[][];
  rng: seedrandom.PRNG;

  constructor(width: number, height: number, seed: string) {
    this.width = width;
    this.height = height;
    this.rng = seedrandom(seed);
    this.grid = [];
    this.initGrid();
    this.generate();
  }

  initGrid() {
    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false,
        });
      }
      this.grid.push(row);
    }
  }

  generate() {
    const stack: Cell[] = [];
    const startCell = this.grid[0][0];
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
}
