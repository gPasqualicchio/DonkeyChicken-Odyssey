// src/game/game.ts

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export type TreeTileType =
  | 'FOREST_tree_full'           // Circondato da alberi
  | 'FOREST_tree_up'             // Strada sopra, alberi ai lati/sotto
  | 'FOREST_tree_down'           // Strada sotto, alberi ai lati/sopra
  | 'FOREST_tree_left'           // Strada a sinistra, alberi ai lati/destra
  | 'FOREST_tree_right'          // Strada a destra, alberi ai lati/sinistra
  | 'FOREST_tree_corner_up_left' // Strada sopra e a sinistra
  | 'FOREST_tree_corner_up_right'// Strada sopra e a destra
  | 'FOREST_tree_corner_down_left' // Strada sotto e a sinistra
  | 'FOREST_tree_corner_down_right'// Strada sotto e a destra
  | 'FOREST_tree_solo'           // Completamente circondato da strada
  | 'FOREST_tree_edge_top'       // Bordo superiore della mappa
  | 'FOREST_tree_edge_bottom'    // Bordo inferiore della mappa
  | 'FOREST_tree_edge_left'      // Bordo sinistro della mappa
  | 'FOREST_tree_edge_right'     // Bordo destro della mappa
  | 'FOREST_tree_default';

export interface EnemyData {
  id: number;
  startPosition: Position;
  type: string;
  behavior: string;
  visionRange?: number;
  moveInterval?: number;
}

export interface EnemyState {
  id: number;
  position: Position;
  type: string;
  direction: Direction;
  visionRange?: number;
  moveInterval?: number;
  lastMoveTime: number;
  isAlive: boolean;
  pixelPosition: Position;
  startPosition: Position;
  isMoving: boolean;
  moveStartTime: number;
  behavior: string;
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
    lastShotTime: number;
}

export interface Projectile {
    id: number;
    position: { x: number; y: number; };
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

export interface GameState {
  // --- AGGIUNTO QUI ---
  level: Level; // Lo stato ora contiene un riferimento diretto al livello attuale

  playerPosition: Position;
  playerPixelPosition: Position;
  startPosition: Position; // <-- Aggiunto per coerenza
  playerDirection: Direction;
  isMoving: boolean;
  isPlayerDead: boolean;
  gameWon: boolean;
  moveCount: number;
  hasKeyCollected: number[];
  isDoorUnlocked: number[];
   // --- MODIFICATO QUI ---
    // Sostituiamo `isLeverPressed` con un array di ID
    pressedLeverIds: number[];
  enemies: EnemyState[];
  projectiles: Projectile[];
  spittingTotems: SpittingTotem[];
  lastMoveTime: number;
}