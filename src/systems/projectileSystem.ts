import { GameState } from "@/game";
import { CELL_SIZE, GAP_SIZE, FIRE_INTERVAL, PROJECTILE_SPEED } from "@/config/Constants";

// Questa funzione pura prende lo stato e restituisce le modifiche a proiettili e totem
export function updateProjectiles(
  prevState: GameState,
  levelData: any,
  nextProjectileId: React.MutableRefObject<number>
): Partial<GameState> {
  const now = Date.now();
  const newState = {
    projectiles: [...prevState.projectiles],
    spittingTotems: [...prevState.spittingTotems],
  };

  // 1. Logica di spawn dai totem
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

  // 2. Logica di movimento e collisione con muri/nemici
  newState.projectiles = newState.projectiles.map(proj => {
    let newPos = { ...proj.position };
    switch (proj.direction) {
      case 'up': newPos.y -= PROJECTILE_SPEED; break;
      case 'down': newPos.y += PROJECTILE_SPEED; break;
      case 'left': newPos.x -= PROJECTILE_SPEED; break;
      case 'right': newPos.x += PROJECTILE_SPEED; break;
    }

    const gridX = Math.floor(newPos.x / (CELL_SIZE + GAP_SIZE));
    const gridY = Math.floor(newPos.y / (CELL_SIZE + GAP_SIZE));

    if (gridX < 0 || gridX >= levelData.grid[0].length || gridY < 0 || gridY >= levelData.grid.length ||
        levelData.grid[gridY]?.[gridX] === '#' ||
        prevState.enemies.some(e => e.isAlive && e.position.x === gridX && e.position.y === gridY)) {
      return null; // Marca per la rimozione
    }
    return { ...proj, position: newPos };
  }).filter((p): p is NonNullable<typeof p> => p !== null);

  return newState;
}