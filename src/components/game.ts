// src/components/game.ts

export interface Position {
  x: number;
  y: number;
}

export interface Level {
  id: number;
  name: string;
  grid: string[]; // <-- SOSTITUISCE 'obstacles' E LE POSIZIONI
  // Le posizioni di start, end, etc. ora sono opzionali perché le leggiamo dalla griglia
  startPosition?: Position;
  endPosition?: Position;
  keyPosition?: Position;
  doorPosition?: Position;
  enemies?: EnemyData[];
}

// Tipi specifici per i nemici
export type EnemyType = 'bruco'; // Aggiungeremo altri tipi qui

export type EnemyBehavior = 'static' | 'sentinella' | 'attivo';

export interface EnemyData {
  id: number;
  startPosition: Position;
  type: EnemyType;
  behavior: EnemyBehavior; // <-- NUOVO: Che tipo di IA ha?
  visionRange?: number;   // <-- NUOVO: Raggio visivo (opzionale)
  moveInterval?: number;  // <-- NUOVO: Millisecondi tra una mossa e l'altra (opzionale)
}

export interface EnemyState {
  id: number;
  position: Position;
  type: EnemyType;
  visionRange?: number;
  moveInterval?: number;
  lastMoveTime: number; // <-- NUOVO: Per tracciare quando si è mosso l'ultima volta
}

// Tipo per lo stato completo del gioco
export interface GameState {
  playerPosition: Position;
  gameWon: boolean;
  moveCount: number;
  isMoving: boolean;
  hasKey: boolean;
  isPlayerDead: boolean;
  enemies: EnemyState[];
}