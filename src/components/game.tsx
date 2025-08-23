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
  keyPosition?: Position;  // Opzionale: non tutti i livelli hanno una chiave
  doorPosition?: Position; // Opzionale: non tutti i livelli hanno una porta
}