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
    keys: Key[];           // Aggiorna a un array di chiavi
    doors: Door[];         // Aggiorna a un array di porte
    levers: Lever[];       // Aggiungi le leve
    grid: string[];
}

// Tipi specifici per i nemici
export type EnemyType = 'bruco'; // Aggiungeremo altri tipi qui

export type EnemyBehavior = 'static' | 'sentinella' | 'active' | 'smart_active';

export type MovementDirection = 'up' | 'down' | 'left' | 'right';

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
  direction: MovementDirection; // <-- SOSTITUISCE il vecchio direction numerico
  visionRange?: number;
  moveInterval?: number;
  lastMoveTime: number;
}

export interface Key {
  position: Position;
  id: number; // Aggiungi un ID univoco
}

export interface Door {
  position: Position;
  id: number; // Aggiungi un ID univoco, che si abbina a una chiave o a una leva
  type: 'key' | 'lever'; // Tipo di porta
}

export interface Lever {
  position: Position;
  id: number; // Aggiungi un ID univoco, che si abbina a una porta
  isPressed: boolean; // Stato della leva
}

export interface GameState {
  playerPosition: Position;
  playerDirection: Direction;
  lastMoveTime: number;
  gameWon: boolean;
  moveCount: number;
  isMoving: boolean;
  isPlayerDead: boolean;
  enemies: EnemyState[];
  hasKeyCollected: boolean;   // <-- Chiave nell'inventario del giocatore
  isDoorUnlocked: boolean;    // <-- Stato della porta
    hasKeyCollected: number[]; // <-- MODIFICATO: ora è un array di ID di chiavi
    isDoorUnlocked: number[]; // <-- MODIFICATO: ora è un array di ID di porte sbloccate

    isLeverPressed: number | null;  // Aggiungi lo stato della leva
}