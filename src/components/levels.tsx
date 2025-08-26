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
    keys: [{ id: 1, position: { x: 2, y: 5 } }], // Corretto: la chiave è un oggetto in un array
    doors: [{ id: 1, position: { x: 7, y: 2 }, type: 'key' }], // Corretto: la porta è un oggetto in un array
    levers: [], // Aggiunto: array per le leve
    enemies: [],
    grid: [
          "----#   #-",
          "----# # #-",
          "##### #D#-",
          "P   # #E#-",
          "###   ###-",
          "-#K# ##---",
          "##   #----",
    ],
  },
      /*
              2 - Il Sentiero Tortuoso
       */
  {
    id: 2,
    name: "Il Bruco",
    keys: [], // Aggiunto: array vuoto
    doors: [], // Aggiunto: array vuoto
    levers: [], // Aggiunto: array vuoto
    enemies: [
        { id: 201, startPosition: { x: 7, y: 4 }, type: 'bruco', behavior: 'smart_active', visionRange: 4,  moveInterval: 1000}
    ],
    grid: [
      "###-------",
      "#P######--",
      "# ##   #--",
      "# ## # ###",
      "#       E#",
      "##########",
      "----------",
    ],
  },
      /*
              3 - Il Sentiero Tortuoso
       */
  {
    id: 3,
    name: "MapTest",
    keys: [], // Aggiunto: array vuoto
    doors: [], // Aggiunto: array vuoto
    levers: [], // Aggiunto: array vuoto
    enemies: [],
    grid: [
      "#P#       ",
      "#    ##   ",
      "# ##      ",
      "# ## # ###",
      "#        #",
      "# ## ### E",
      "     #    ",
    ],
  },
      /*
           4 - Oh god, another caterpillar
       */
  {
    id: 4,
    name: "Oh god, another caterpillar",
    keys: [{ id: 1, position: { x: 1, y: 2 } }],
    doors: [{ id: 1, position: { x: 4, y: 5 }, type: 'key' }],
    levers: [],
    enemies: [ { id: 201, startPosition: { x: 1, y: 1 }, type: 'bruco', behavior: 'smart_active', visionRange: 4,  moveInterval: 1000}],
    grid: [
      "#####-----",
      "#   ####--",
      "# #    #--",
      "### ## #--",
      "#      #--",
      "#P## ###--",
      "####E#----",
    ],
  },
      /*
           6- Such a cool totem
       */
  {
    id: 6,
    name: "Such a cool totem",
      spittingTotems: [
        { id: 1, position: { x: 3, y: 0 }, direction: 'down', isAlive: true, lastShotTime: 600},
        { id: 2, position: { x: 6, y: 0 }, direction: 'down', isAlive: true, lastShotTime: 0}
      ],
      keys: [],
      doors: [],
      levers: [],
      enemies: [],
    grid: [
      "### ## ###",
      "P        #",
      "### ## # #",
      "--# ## # #",
      "### ## # #",
      "E        #",
      "##########",
    ],
  },
      /*
           7 - Ah ah!
       */
  {
    id: 6,
    name: "Ah ah!",
      spittingTotems: [
        { id: 1, position: { x: 7, y: 6 }, direction: 'up', isAlive: true, lastShotTime: 600}
      ],
      keys: [{ id: 1, position: { x: 1, y: 3 } }],
      doors: [{ id: 1, position: { x: 3, y: 2 }, type: 'key' }],
      levers: [],
      enemies: [ { id: 601, startPosition: { x: 1, y: 2 }, type: 'bruco', behavior: 'smart_active', visionRange: 4,  moveInterval: 1000}],
    grid: [
      "##########",
      "#         ",
      "# # ### # ",
      "# #E###   ",
      "####### ##",
      "#######  P",
      "####### ##",
    ],
  },
];