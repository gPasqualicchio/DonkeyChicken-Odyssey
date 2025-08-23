import { Level } from "@/types/game";

// Ora tutti i tuoi livelli sono oggetti in un array.
// Aggiungere un livello è semplice come aggiungere un nuovo oggetto.
export const levels: Level[] = [
  {
    id: 1,
    name: "La Foresta Introduttiva",
    startPosition: { x: 0, y: 3 },
    endPosition: { x: 7, y: 3 },
    keyPosition: { x: 2, y: 5 },
    doorPosition: { x: 3, y: 2 },
    obstacles: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 6, y: 1 },
        { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 6, y: 2 },
        { x: 4, y: 3 }, { x: 6, y: 3 },
        { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
        { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 3, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
        { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 },
    ],
  },
  {
    id: 2,
    name: "Il Sentiero Tortuoso",
    startPosition: { x: 1, y: 1 },
    endPosition: { x: 6, y: 5 },
    // Questo livello non ha chiave né porta
    obstacles: [
      // ...array di ostacoli per il livello 2...
    ],
  },
  // ... puoi aggiungere qui fino al livello 100
];