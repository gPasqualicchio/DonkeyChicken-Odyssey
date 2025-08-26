import { GameState } from "@/game";
import { PLAYER_HITBOX_RADIUS, PROJECTILE_HITBOX_RADIUS } from "@/config/Constants";

export function checkCollisions(prevState: GameState): Partial<GameState> {
  // Per ora, controlliamo solo la collisione giocatore-proiettili
  const hittingProjectile = prevState.projectiles.find(proj => {
    const dx = prevState.playerPixelPosition.x - proj.position.x;
    const dy = prevState.playerPixelPosition.y - proj.position.y;
    const distanceSquared = (dx * dx) + (dy * dy);
    const sumOfRadii = PLAYER_HITBOX_RADIUS + PROJECTILE_HITBOX_RADIUS;
    return distanceSquared < (sumOfRadii * sumOfRadii);
  });

  if (hittingProjectile) {
    return {
      isPlayerDead: true,
      isMoving: false, // Ferma il movimento se viene colpito
      projectiles: prevState.projectiles.filter(p => p.id !== hittingProjectile.id),
    };
  }

  return {};
}