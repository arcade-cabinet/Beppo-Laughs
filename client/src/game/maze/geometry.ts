import { MazeLayout } from './core';

export interface MazeConfig {
  cellSize: number;
  wallHeight: number;
  wallThickness: number;
}

export const DEFAULT_CONFIG: MazeConfig = {
  cellSize: 5,
  wallHeight: 3.5,
  wallThickness: 0.15,
};

export interface WallSegment {
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
}

export interface FloorTile {
  x: number;
  z: number;
  width: number;
  depth: number;
}

export interface RailNode {
  id: string;
  gridX: number;
  gridY: number;
  worldX: number;
  worldZ: number;
  connections: string[];
  isCenter: boolean;
  isExit: boolean;
}

export interface MazeGeometry {
  walls: WallSegment[];
  floor: FloorTile;
  railNodes: Map<string, RailNode>;
  centerNodeId: string;
  exitNodeIds: string[];
}

export function gridToWorld(gridX: number, gridY: number, config: MazeConfig): { x: number; z: number } {
  return {
    x: gridX * config.cellSize,
    z: gridY * config.cellSize,
  };
}

export function worldToGrid(worldX: number, worldZ: number, config: MazeConfig): { x: number; y: number } {
  return {
    x: Math.round(worldX / config.cellSize),
    y: Math.round(worldZ / config.cellSize),
  };
}

export function buildGeometry(layout: MazeLayout, config: MazeConfig = DEFAULT_CONFIG): MazeGeometry {
  const walls: WallSegment[] = [];
  const railNodes = new Map<string, RailNode>();
  
  const { cellSize, wallHeight, wallThickness } = config;
  const halfCell = cellSize / 2;
  
  for (let y = 0; y < layout.height; y++) {
    for (let x = 0; x < layout.width; x++) {
      const cell = layout.cells[y][x];
      const { x: worldX, z: worldZ } = gridToWorld(x, y, config);
      
      if (cell.walls.north) {
        walls.push({
          x: worldX,
          z: worldZ - halfCell,
          width: cellSize + wallThickness,
          height: wallHeight,
          depth: wallThickness,
          rotation: 0,
        });
      }
      
      if (cell.walls.west) {
        walls.push({
          x: worldX - halfCell,
          z: worldZ,
          width: wallThickness,
          height: wallHeight,
          depth: cellSize + wallThickness,
          rotation: 0,
        });
      }
      
      if (y === layout.height - 1 && cell.walls.south) {
        walls.push({
          x: worldX,
          z: worldZ + halfCell,
          width: cellSize + wallThickness,
          height: wallHeight,
          depth: wallThickness,
          rotation: 0,
        });
      }
      
      if (x === layout.width - 1 && cell.walls.east) {
        walls.push({
          x: worldX + halfCell,
          z: worldZ,
          width: wallThickness,
          height: wallHeight,
          depth: cellSize + wallThickness,
          rotation: 0,
        });
      }
      
      const nodeId = `${x},${y}`;
      const connections: string[] = [];
      
      if (!cell.walls.north && y > 0) connections.push(`${x},${y - 1}`);
      if (!cell.walls.south && y < layout.height - 1) connections.push(`${x},${y + 1}`);
      if (!cell.walls.west && x > 0) connections.push(`${x - 1},${y}`);
      if (!cell.walls.east && x < layout.width - 1) connections.push(`${x + 1},${y}`);
      
      railNodes.set(nodeId, {
        id: nodeId,
        gridX: x,
        gridY: y,
        worldX,
        worldZ,
        connections,
        isCenter: cell.isCenter,
        isExit: cell.isExit,
      });
    }
  }
  
  const floorWidth = layout.width * cellSize;
  const floorDepth = layout.height * cellSize;
  const floor: FloorTile = {
    x: (layout.width - 1) * cellSize / 2,
    z: (layout.height - 1) * cellSize / 2,
    width: floorWidth + cellSize,
    depth: floorDepth + cellSize,
  };
  
  const centerNodeId = `${layout.center.x},${layout.center.y}`;
  const exitNodeIds = layout.exits.map(e => `${e.x},${e.y}`);
  
  return {
    walls,
    floor,
    railNodes,
    centerNodeId,
    exitNodeIds,
  };
}

export function getNodeConnections(geometry: MazeGeometry, nodeId: string): RailNode[] {
  const node = geometry.railNodes.get(nodeId);
  if (!node) return [];
  
  return node.connections
    .map(id => geometry.railNodes.get(id))
    .filter((n): n is RailNode => n !== undefined);
}
