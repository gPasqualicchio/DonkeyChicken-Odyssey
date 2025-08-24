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