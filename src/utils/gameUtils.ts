// src/utils/gameUtils.ts

import { Level, GameState, Position, Direction } from '../game';
import { GRID_WIDTH, GRID_HEIGHT } from "@/config/Constants";

/**
 * Inizializza lo stato iniziale del gioco basato sui dati del livello.
 * @param level Il livello da cui leggere le posizioni iniziali.
 * @returns Lo stato del gioco inizializzato.
 */
export const getInitialGameState = (level: Level): GameState => {
  let startPos: Position = { x: 0, y: 0 };
  let endPos: Position | undefined;
  let keyPos: Position | undefined;
  let doorPos: Position | undefined;

  level.grid.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      if (char === 'P') startPos = { x, y };
      if (char === 'E') endPos = { x, y };
      if (char === 'K') keyPos = { x, y };
      if (char === 'D') doorPos = { x, y };
    });
  });

  // Nota: I dati nel livello originale dovrebbero già contenere queste posizioni
  // ma questo garantisce la compatibilità.
  level.startPosition = startPos;
  level.endPosition = endPos;
  level.keyPosition = keyPos;
  level.doorPosition = doorPos;

  return {
    playerPosition: startPos,
    playerDirection: 'right',
    lastMoveTime: Date.now(),
    gameWon: false,
    moveCount: 0,
    isMoving: false,
    hasKey: false,
    isPlayerDead: false,
    enemies: level.enemies?.map(e => ({
      id: e.id,
      position: e.startPosition,
      type: e.type,
      behavior: e.behavior,
      visionRange: e.visionRange,
      moveInterval: e.moveInterval,
      lastMoveTime: 0,
      direction: "left",
      isAlive: true,
    })) || [],
  };
};

/**
 * Trova il percorso più breve tra due punti in una griglia usando l'algoritmo Breadth-First Search.
 * @param start La posizione di partenza.
 * @param end La posizione di arrivo.
 * @param grid La griglia di gioco.
 * @returns Un array di posizioni che rappresenta il percorso, o un array vuoto se non trovato.
 */
export const findPath = (start: Position, end: Position, grid: string[]): Position[] => {
  const queue: { pos: Position, path: Position[] }[] = [{ pos: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;

    if (pos.x === end.x && pos.y === end.y) {
      return path;
    }

    const directions = [
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: -1, y: 0 }, { x: 1, y: 0 }
    ];

    for (const dir of directions) {
      const nextPos = { x: pos.x + dir.x, y: pos.y + dir.y };
      const posKey = `${nextPos.x},${nextPos.y}`;

      if (
        nextPos.x >= 0 && nextPos.x < GRID_WIDTH &&
        nextPos.y >= 0 && nextPos.y < GRID_HEIGHT &&
        grid[nextPos.y][nextPos.x] !== '#' &&
        !visited.has(posKey)
      ) {
        visited.add(posKey);
        queue.push({ pos: nextPos, path: [...path, nextPos] });
      }
    }
  }
  return [];
};