import { Vector3 } from 'three';
import { MazeGenerator } from './MazeGenerator';

const CELL_SIZE = 2;
const PLAYER_RADIUS = 0.3;
const WALL_THICKNESS = 0.2;

export function checkCollision(
  position: Vector3, 
  maze: MazeGenerator
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

  return false;
}

export function resolveCollision(
  currentPos: Vector3,
  targetPos: Vector3,
  maze: MazeGenerator
): Vector3 {
  // Try X movement only
  const xOnly = new Vector3(targetPos.x, currentPos.y, currentPos.z);
  const canMoveX = !checkCollision(xOnly, maze);

  // Try Z movement only
  const zOnly = new Vector3(currentPos.x, currentPos.y, targetPos.z);
  const canMoveZ = !checkCollision(zOnly, maze);

  // Try full movement
  if (!checkCollision(targetPos, maze)) {
    return targetPos;
  }

  // Slide along walls
  if (canMoveX && canMoveZ) {
    // Both directions allowed separately but not together - corner case
    // Pick the direction with more movement
    const xDist = Math.abs(targetPos.x - currentPos.x);
    const zDist = Math.abs(targetPos.z - currentPos.z);
    return xDist > zDist ? xOnly : zOnly;
  } else if (canMoveX) {
    return xOnly;
  } else if (canMoveZ) {
    return zOnly;
  }

  // Can't move at all
  return currentPos;
}
