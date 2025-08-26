import { GameState } from "@/game";
import {
  CELL_SIZE,
  GAP_SIZE,
  FIRE_INTERVAL,
  PROJECTILE_SPEED,
  ENEMY_HITBOX_RADIUS,
  PROJECTILE_HITBOX_RADIUS
} from "@/config/Constants";

// La funzione ora restituisce anche un Set con gli ID dei nemici colpiti
export function updateProjectiles(
  prevState: GameState,
  levelData: any,
  nextProjectileId: React.MutableRefObject<number>
): Partial<GameState> & { hitEnemyIds: Set<string> } {
  const now = Date.now();
  const hitEnemyIds = new Set<string>();
  const newState = {
    projectiles: [...prevState.projectiles],
    spittingTotems: [...prevState.spittingTotems],
  };

  // 1. Logica di spawn dai totem (invariata)
  newState.spittingTotems = newState.spittingTotems.map(totem => {
    if (totem.isAlive && now - totem.lastShotTime > FIRE_INTERVAL) {
      newState.projectiles.push({
        id: nextProjectileId.current++,
        position: {
          x: totem.position.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2),
          y: totem.position.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2),
        },
        direction: totem.direction,
        type: 'totem'
      });
      return { ...totem, lastShotTime: now };
    }
    return totem;
  });

  // 2. Logica di movimento e collisione aggiornata
  newState.projectiles = newState.projectiles.map(proj => {
    let newPos = { ...proj.position };
    switch (proj.direction) {
      case 'up': newPos.y -= PROJECTILE_SPEED; break;
      case 'down': newPos.y += PROJECTILE_SPEED; break;
      case 'left': newPos.x -= PROJECTILE_SPEED; break;
      case 'right': newPos.x += PROJECTILE_SPEED; break;
    }

    // --- NUOVA LOGICA DI COLLISIONE PRECISA CON I NEMICI ---
    const enemyHit = prevState.enemies.find(enemy => {
      if (!enemy.isAlive) return false;
      const enemyPixelPos = {
        x: enemy.position.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2),
        y: enemy.position.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2),
      };
      const dx = newPos.x - enemyPixelPos.x;
      const dy = newPos.y - enemyPixelPos.y;
      const distanceSquared = (dx * dx) + (dy * dy);
      const sumOfRadii = PROJECTILE_HITBOX_RADIUS + ENEMY_HITBOX_RADIUS;
      return distanceSquared < (sumOfRadii * sumOfRadii);
    });

    if (enemyHit) {
      hitEnemyIds.add(enemyHit.id); // Registra l'ID del nemico colpito
      return null; // Marca il proiettile per la rimozione
    }

    // --- Logica di collisione con i muri (invariata) ---
    const gridX = Math.floor(newPos.x / (CELL_SIZE + GAP_SIZE));
    const gridY = Math.floor(newPos.y / (CELL_SIZE + GAP_SIZE));
    if (gridX < 0 || gridX >= levelData.grid[0].length || gridY < 0 || gridY >= levelData.grid.length ||
        levelData.grid[gridY]?.[gridX] === '#') {
      return null;
    }

    return { ...proj, position: newPos };
  }).filter((p): p is NonNullable<typeof p> => p !== null);

  return { ...newState, hitEnemyIds };
}