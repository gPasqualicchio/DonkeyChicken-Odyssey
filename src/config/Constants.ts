export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 7;
export const CELL_SIZE = 48;
export const GAP_SIZE = 0;
export const SWIPE_THRESHOLD = 30;

// Esempio di raggi per le hitbox (in pixel)
// Prova a modificare questi valori per trovare il "feel" giusto
export const PLAYER_HITBOX_RADIUS = 18; // es. se la cella è 48px, un raggio di 18 è permissivo
export const ENEMY_HITBOX_RADIUS = 18;
export const PROJECTILE_HITBOX_RADIUS = 10; // I proiettili di solito hanno una hitbox più piccola del loro sprite
export const PROJECTILE_SPRITE_SIZE = 22;

export const CHARACTER_Y_OFFSET = -16;

export const IS_DEBUG_MODE = true;

export const FIRE_INTERVAL = 1200;
export const PROJECTILE_SPEED = 3;
export const MOVE_DURATION = 150;
export const MOVE_COOLDOWN = 200;
export const ENEMY_MOVE_INTERVAL = 200;