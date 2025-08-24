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
    startPosition: { x: 0, y: 3 },
    endPosition: { x: 7, y: 3 },
    keyPosition: { x: 2, y: 5 },
    doorPosition: { x: 7, y: 2 },
    enemies: [],
    //enemiesPosition: [],
    obstacles: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },                                                 {x:8, y:0} , {x:9, y:0},
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },                 { x: 6, y: 1 },                 {x:8, y:1} , {x:9, y:1},
        { x: 0, y: 2 }, { x: 1, y: 2 },                                 { x: 4, y: 2 },                 { x: 6, y: 2 },                 {x:8, y:2} , {x:9, y:2},
                                                                        { x: 4, y: 3 },                 { x: 6, y: 3 },                 {x:8, y:3} , {x:9, y:3},
        { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 },                                                 { x: 6, y: 4 }, { x: 7, y: 4 }, {x:8, y:4} , {x:9, y:4},
        { x: 0, y: 5 }, { x: 1, y: 5 },                 { x: 3, y: 5 },                 { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }, {x:8, y:5} , {x:9, y:5},
        { x: 0, y: 6 }, { x: 1, y: 6 },                                                 { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, {x:8, y:6} , {x:9, y:6},
    ],
  },
      /*
              2 - Il Sentiero Tortuoso
       */
  {
    id: 2,
    name: "Il Bruco",
    startPosition: { x: 1, y: 1 },
    endPosition: { x: 8, y: 4 },
    enemies: [
        { id: 201, startPosition: { x: 7, y: 4 }, type: 'bruco', behavior: 'attivo', visionRange: 4,  moveInterval: 1000}
    ],
    obstacles: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, {x:8, y:0} , {x:9, y:0},
        { x: 0, y: 1 },                 { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 }, {x:8, y:1} , {x:9, y:1},
        { x: 0, y: 2 },                 { x: 2, y: 2 }, { x: 3, y: 2 },                                                 { x: 7, y: 2 }, {x:8, y:2} , {x:9, y:2},
        { x: 0, y: 3 },                 { x: 2, y: 3 }, { x: 3, y: 3 },                 { x: 5, y: 3 },                 { x: 7, y: 3 }, {x:8, y:3} , {x:9, y:3},
        { x: 0, y: 4 },                                                                                                                              {x:9, y:4},
        { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }, {x:8, y:5} , {x:9, y:5},
        { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, {x:8, y:6} , {x:9, y:6},
    ],
  },
  // ... puoi aggiungere qui fino al livello 100
];