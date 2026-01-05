import { Vector3 } from 'three';
import type { MazeGenerator } from './MazeGenerator';

const CELL_SIZE = 2;
const PLAYER_RADIUS = 0.3;
const WALL_THICKNESS = 0.2;

// Helper to get cell key
const cellKey = (gridX: number, gridZ: number) => `${gridX},${gridZ}`;

export function checkCollision(
  position: Vector3,
  maze: MazeGenerator,
  blockades?: Set<string>,
): boolean {
  // Convert world position to grid coordinates
  const gridX = Math.floor((position.x + CELL_SIZE / 2) / CELL_SIZE);
  const gridZ = Math.floor((position.z + CELL_SIZE / 2) / CELL_SIZE);

  // Check bounds
  if (gridX < 0 || gridX >= maze.width || gridZ < 0 || gridZ >= maze.height) {
    return true; // Collision with boundary
  }

  const cell = maze.grid[gridZ]?.[gridX];
  if (!cell) return true;

  // Local position within cell
  const localX = position.x - gridX * CELL_SIZE;
  const localZ = position.z - gridZ * CELL_SIZE;

  const halfCell = CELL_SIZE / 2;
  const wallOffset = halfCell - WALL_THICKNESS / 2;

  // Check collision with each wall
  if (cell.walls.top && localZ < -wallOffset + PLAYER_RADIUS) {
    return true;
  }
  if (cell.walls.bottom && localZ > wallOffset - PLAYER_RADIUS) {
    return true;
  }
  if (cell.walls.left && localX < -wallOffset + PLAYER_RADIUS) {
    return true;
  }
  if (cell.walls.right && localX > wallOffset - PLAYER_RADIUS) {
    return true;
  }

  // Check blockades - villain-created obstacles
  if (blockades && blockades.size > 0) {
    const key = cellKey(gridX, gridZ);
    if (blockades.has(key)) {
      return true;
    }

    // Check adjacent cells for blockades
    const adjacentKeys = [
      cellKey(gridX + 1, gridZ),
      cellKey(gridX - 1, gridZ),
      cellKey(gridX, gridZ + 1),
      cellKey(gridX, gridZ - 1),
    ];

    for (const adjKey of adjacentKeys) {
      if (blockades.has(adjKey)) {
        const [adjX, adjZ] = adjKey.split(',').map(Number);
        const dx = adjX - gridX;
        const dz = adjZ - gridZ;

        if (dx === 1 && localX > halfCell - PLAYER_RADIUS - 0.1) return true;
        if (dx === -1 && localX < -halfCell + PLAYER_RADIUS + 0.1) return true;
        if (dz === 1 && localZ > halfCell - PLAYER_RADIUS - 0.1) return true;
        if (dz === -1 && localZ < -halfCell + PLAYER_RADIUS + 0.1) return true;
      }
    }
  }

  return false;
}

export function resolveCollision(
  currentPos: Vector3,
  targetPos: Vector3,
  maze: MazeGenerator,
  blockades?: Set<string>,
): Vector3 {
  if (!checkCollision(targetPos, maze, blockades)) {
    return targetPos;
  }

  const xOnly = new Vector3(targetPos.x, currentPos.y, currentPos.z);
  const canMoveX = !checkCollision(xOnly, maze, blockades);

  const zOnly = new Vector3(currentPos.x, currentPos.y, targetPos.z);
  const canMoveZ = !checkCollision(zOnly, maze, blockades);

  if (canMoveX && canMoveZ) {
    const xDist = Math.abs(targetPos.x - currentPos.x);
    const zDist = Math.abs(targetPos.z - currentPos.z);
    return xDist > zDist ? xOnly : zOnly;
  } else if (canMoveX) {
    return xOnly;
  } else if (canMoveZ) {
    return zOnly;
  }

  return currentPos;
}
