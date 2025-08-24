// src/components/game.ts

export interface Position {
  x: number;
  y: number;
}

export interface Level {
  id: number;
  name: string;
  obstacles: Position[];
  startPosition: Position;
  endPosition: Position;
  keyPosition?: Position;   // Opzionale: non tutti i livelli hanno una chiave
  doorPosition?: Position;  // Opzionale: non tutti i livelli hanno una porta
  enemies?: EnemyData[];    // Opzionale: per i nemici
}

// Tipi specifici per i nemici
export type EnemyType = 'bruco'; // Aggiungeremo altri tipi qui

export interface EnemyData {
  id: number;
  startPosition: Position;
  type: EnemyType;
}

export interface EnemyState {
  id: number;
  position: Position;
  type: EnemyType;
}

// Tipo per lo stato completo del gioco
export interface GameState {
  playerPosition: Position;
  gameWon: boolean;
  moveCount: number;
  isMoving: boolean;
  hasKey: boolean;
  enemies: EnemyState[];
}