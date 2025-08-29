import { Level } from './game';

export const levels: Level[] = [

  {
    id: 1,
    name: "La Ciuco Foresta",
    keys: [
        { id: 1, position: { x: 2, y: 5 } }],
    doors: [
        { id: 1, position: { x: 7, y: 2 }, type: 'key' }],
    levers: [],
    enemies: [],
    grid: [
          "#####   ##",
          "##### # ##",
          "##### #D##",
          "P   # #E##",
          "###   ####",
          "##K# #####",
          "##   #####",
    ],
  },

  {
    id: 2,
    name: "Il Bruco",
    keys: [],
    doors: [],
    levers: [],
    enemies: [
        { id: 201, startPosition: { x: 7, y: 4 }, type: 'bruco', behavior: 'smart_active', visionRange: 4,  moveInterval: 1000}
    ],
    grid: [
      "##########",
      "#P########",
      "# ##   ###",
      "# ## # ###",
      "#       E#",
      "##########",
      "##########",
    ],
  },

  {
    id: 3,
    name: "MapTest",
    keys: [],
    doors: [],
    levers: [],
    enemies: [],
    grid: [
      "#P#       ",
      "#    ##   ",
      "# ##      ",
      "# ## # ###",
      "#        #",
      "# ## ### E",
      "     #   #",
    ],
  },

  {
    id: 4,
    name: "Oh god, another caterpillar",
    keys: [
        { id: 1, position: { x: 1, y: 2 } }],
    doors: [
        { id: 1, position: { x: 4, y: 5 }, type: 'key' }],
    levers: [],
    enemies: [
        { id: 201, startPosition: { x: 1, y: 1 }, type: 'bruco', behavior: 'smart_active', visionRange: 4,  moveInterval: 1000}],
    grid: [
      "##########",
      "#   ######",
      "# #    ###",
      "### ## ###",
      "#      ###",
      "#P## #####",
      "####E#####",
    ],
  },

  {
    id: 5,
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
      "### ## # #",
      "### ## # #",
      "E        #",
      "##########",
    ],
  },

  {
    id: 6,
    name: "Ah ah!",
      spittingTotems: [
        { id: 1, position: { x: 7, y: 6 }, direction: 'up', isAlive: true, lastShotTime: 600}
      ],
      keys: [],
      doors: [],
      levers: [],
      enemies: [
          { id: 601, startPosition: { x: 2, y: 1 }, type: 'bruco', behavior: 'smart_active', visionRange: 4,  moveInterval: 1000}],
    grid: [
      "##########",
      "##       #",
      "### ### ##",
      "###E###  #",
      "####### ##",
      "#######  P",
      "####### ##",
    ],
  },

  {
    id: 7,
    name: "2 is better than 1",
      spittingTotems: [],
      keys: [],
      doors: [],
      levers: [],
      enemies: [
          { id: 701, startPosition: { x: 9, y: 4 }, type: 'bruco', behavior: 'smart_active', visionRange: 4,  moveInterval: 1000},
          { id: 702, startPosition: { x: 4, y: 3 }, type: 'bruco', behavior: 'smart_active', visionRange: 4,  moveInterval: 1000}],
    grid: [
      "##########",
      "##E  #####",
      "####     #",
      "#### # # #",
      "######    ",
      "###### # #",
      "#####P   #",
    ],
  },

  {
    id: 8,
    name: "Lever",
      spittingTotems: [],
      keys: [],
levers: [
    { id: 1, position: { x: 3, y: 2 }, isPressed: false },
  ],

  doors: [
    { id: 1, position: { x: 3, y: 4 }, type: 'lever' },
  ],
      enemies: [
                { id: 801, startPosition: { x: 7, y: 5 }, type: 'bruco', behavior: 'smart_active', visionRange: 4,  moveInterval: 1000},
                { id: 802, startPosition: { x: 2, y: 4 }, type: 'bruco', behavior: 'smart_active', visionRange: 4,  moveInterval: 1000}],
    grid: [
      "####   ###",
      "#### # ###",
      "###    ###",
      "#### # ###",
      "#E      ##",
      "##### # ##",
      "#####P####",
    ],
  },
];