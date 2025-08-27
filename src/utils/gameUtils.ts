import { Level, GameState, Position, EnemyState } from '../game';
import { GRID_WIDTH, GRID_HEIGHT } from "@/config/Constants";

/**
 * Crea uno stato di gioco di BASE a partire da un file di livello.
 * Questa funzione ora cerca la 'P' per la posizione iniziale.
 */
export const getInitialGameState = (level: Level): Partial<GameState> => {
  let startPos: Position = { x: 0, y: 0 }; // Default a 0,0

  // Scansiona la griglia per trovare la posizione di partenza 'P'
  level.grid.forEach((row, y) => {
    const pIndex = row.indexOf('P');
    if (pIndex !== -1) {
      startPos = { x: pIndex, y: y };
    }
  });

  return {
    playerPosition: startPos,
    playerDirection: 'down',
    gameWon: false,
    isMoving: false,
    isPlayerDead: false,
    enemies: level.enemies?.map((e, index) => ({
      id: e.id || index,
      position: e.startPosition,
      type: e.type,
      behavior: e.behavior,
      visionRange: e.visionRange || 5,
      moveInterval: e.moveInterval || 1000,
      lastMoveTime: 0,
      direction: "down",
      isAlive: true,
    })) || [],
  };
};

/**
 * Trova il percorso più breve tra due punti in una griglia.
 */
export const findPath = (start: Position, end: Position, grid: string[]): Position[] => {
  if (!grid || grid.length === 0 || grid[0].length === 0) {
    return [];
  }
  const queue: { pos: Position, path: Position[] }[] = [{ pos: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;
    if (pos.x === end.x && pos.y === end.y) return path;
    const directions = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    for (const dir of directions) {
      const nextPos = { x: pos.x + dir.x, y: pos.y + dir.y };
      const posKey = `${nextPos.x},${nextPos.y}`;
      if (
        nextPos.x >= 0 && nextPos.x < grid[0].length &&
        nextPos.y >= 0 && nextPos.y < grid.length &&
        grid[nextPos.y]?.[nextPos.x] !== '#' &&
        !visited.has(posKey)
      ) {
        visited.add(posKey);
        queue.push({ pos: nextPos, path: [...path, nextPos] });
      }
    }
  }
  return [];
};

/**
 * Controlla se c'è una linea di vista sgombra tra due punti.
 */
export const hasLineOfSight = (start: Position, end: Position, grid: string[], maxRange: number): boolean => {
    if (!grid || grid.length === 0 || grid[0].length === 0) return false;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRange) return false;
    const steps = Math.ceil(distance);
    if (steps === 0) return true;
    const xIncrement = dx / steps;
    const yIncrement = dy / steps;
    for (let i = 1; i <= steps; i++) {
        const gridX = Math.round(start.x + xIncrement * i);
        const gridY = Math.round(start.y + yIncrement * i);
        if (grid[gridY]?.[gridX] === '#') return false;
        if (gridX === end.x && gridY === end.y) return true;
    }
    return true;
};