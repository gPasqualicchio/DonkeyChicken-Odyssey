// src/game/game.ts

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface EnemyData {
  id: number;
  startPosition: Position;
  type: EnemyType;
  behavior: EnemyBehavior;
  visionRange?: number;
  moveInterval?: number;
}

export interface EnemyState {
  id: number;
  position: Position;
  type: EnemyType;
  direction: Direction;
  visionRange?: number;
  moveInterval?: number;
  lastMoveTime: number;
  isAlive: boolean;
}

export interface Key {
  position: Position;
  id: number;
}

export interface Door {
  position: Position;
  id: number;
  type: 'key' | 'lever';
}

export interface Lever {
  position: Position;
  id: number;
  isPressed: boolean;
}

export interface SpittingTotem {
    id: number;
    position: Position;
    direction: Direction;
    isAlive: boolean;
}

export interface Projectile {
    id: number;
    // MODIFICATO: La posizione ora usa coordinate a punto flottante per il movimento fluido
    position: {
        x: number;
        y: number;
    };
    direction: Direction;
    type: 'totem';
}

export interface Level {
  id: number;
  name: string;
  grid: string[];
  startPosition?: Position;
  endPosition?: Position;
  enemies?: EnemyData[];
  keys: Key[];
  doors: Door[];
  levers: Lever[];
  spittingTotems?: SpittingTotem[];
}

export type EnemyType = 'bruco';
export type EnemyBehavior = 'static' | 'sentinella' | 'active' | 'smart_active';

export interface GameState {
  playerPosition: Position;
    // 👇 NUOVE PROPRIETÀ 👇
    playerPixelPosition: Position; // La posizione esatta in PIXEL del giocatore, aggiornata ad ogni frame
  playerDirection: Direction;
  isMoving: boolean;
  isPlayerDead: boolean;
  gameWon: boolean;
  moveCount: number;
  hasKeyCollected: number[];
  isDoorUnlocked: number[];
  isLeverPressed: number | null;
  enemies: EnemyState[];
  projectiles: Projectile[];
  spittingTotems: SpittingTotem[];
  lastMoveTime: number;
}