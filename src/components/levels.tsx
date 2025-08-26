import { Level } from './game'; // Importa il tipo Level

// Ora tutti i tuoi livelli sono oggetti in un array.
// Aggiungere un livello è semplice come aggiungere un nuovo oggetto.
export const levels: Level[] = [
    /*
            1 - La Foresta Introduttiva
     */
  {
    id: 1,
    name: "La Ciuco Foresta",
    keyPosition: { x: 2, y: 5 },
    doorPosition: { x: 7, y: 2 },
    enemies: [],
    grid: [
          "#####   ##", // La - è solo per leggibilità, puoi usare spazi
          "##### # ##",
          "##### #D##",
          "P   # #E##",
          "###   ####",
          "##K# #####",
          "##   #####",
    ],
  },
      /*
              2 - Il Sentiero Tortuoso
       */
  {
    id: 2,
    name: "Il Bruco",
    enemies: [
        { id: 201, startPosition: { x: 7, y: 4 }, type: 'bruco', behavior: 'smart_active', visionRange: 4,  moveInterval: 1000}
    ],
    grid: [
      "##########", // La - è solo per leggibilità, puoi usare spazi
      "#P########",
      "# ##   ###",
      "# ## # ###",
      "#       E#",
      "##########",
      "##########",
    ],
  },
  // ... puoi aggiungere qui fino al livello 100
];