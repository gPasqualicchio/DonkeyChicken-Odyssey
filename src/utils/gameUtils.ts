import { Level, Position, EnemyState } from '../game';

// Questa funzione non è più usata, può essere rimossa se vuoi.
export const getInitialGameState = (level: Level): Partial<GameState> => { /* ... */ };

/**
 * Trova il percorso più breve, tenendo conto di muri, porte CHIUSE e altri nemici.
 */
export const findPath = (
    start: Position,
    end: Position,
    level: Level,
    isDoorUnlocked: number[],
    otherEnemies: EnemyState[],
    enemyId: number
): Position[] => {

  if (!level.grid || level.grid.length === 0 || level.grid[0].length === 0) {
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
        nextPos.x >= 0 && nextPos.x < level.grid[0].length &&
        nextPos.y >= 0 && nextPos.y < level.grid.length &&
        !visited.has(posKey)
      ) {
        // --- LOGICA DI CONTROLLO DEFINITIVA ---

        // 1. Controlla i muri (dalla griglia)
        if (level.grid[nextPos.y][nextPos.x] === '#') {
          continue;
        }

        // 2. Controlla le porte (dall'array degli oggetti, ignorando la griglia)
        const door = level.doors.find(d => d.position.x === nextPos.x && d.position.y === nextPos.y);
        if (door && !isDoorUnlocked.includes(door.id)) {
            // Se c'è una porta in questa posizione ED è chiusa, blocca il percorso.
            console.log(`%c[Pathfinding] Enemy ${enemyId} found a CLOSED door at (${nextPos.x}, ${nextPos.y}). Path blocked.`, 'color: yellow;');
            continue;
        }

        // 3. Controlla gli altri nemici
        const isOccupiedByOtherEnemy = otherEnemies.some(
            enemy => !enemy.isMoving && enemy.position.x === nextPos.x && enemy.position.y === nextPos.y
        );
        if (isOccupiedByOtherEnemy) {
            continue;
        }

        visited.add(posKey);
        queue.push({ pos: nextPos, path: [...path, nextPos] });
      }
    }
  }
  return [];
};

// hasLineOfSight rimane invariata
export const hasLineOfSight = (start: Position, end: Position, grid: string[], maxRange: number): boolean => { /* ... */ };