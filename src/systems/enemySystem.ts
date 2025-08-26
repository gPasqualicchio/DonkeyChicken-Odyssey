import { GameState, Level, Position } from "@/game";
import { findPath as findPathUtil } from "@/utils/gameUtils";

type FindPathFunc = (start: Position, end: Position, grid: string[][]) => Position[];

export function updateEnemies(
  prevState: GameState,
  levelData: Level,
  findPath: FindPathFunc = findPathUtil // Usa la funzione di utility come default
): Partial<GameState> {
  if (prevState.gameWon || prevState.isPlayerDead) {
    return {};
  }

  const now = Date.now();
  // Determina la posizione "reale" del giocatore sulla griglia
  const playerGridPos = prevState.isMoving ? prevState.playerPosition : prevState.startPosition;
  let playerIsCaught = false;

  const newEnemies = prevState.enemies.map(enemy => {
    if (!enemy.isAlive || !enemy.moveInterval || now - enemy.lastMoveTime < enemy.moveInterval) {
      return enemy;
    }

    let desiredNextPosition = { ...enemy.position };
    const isPlayerInVision = Math.abs(playerGridPos.x - enemy.position.x) + Math.abs(playerGridPos.y - enemy.position.y) <= enemy.visionRange;

    if ((enemy.behavior === 'active' || enemy.behavior === 'smart_active') && isPlayerInVision) {
      if (enemy.behavior === 'smart_active') {
        const path = findPath(enemy.position, playerGridPos, levelData.grid);
        if (path.length > 1) {
          desiredNextPosition = path[1];
        }
      } else { // Comportamento 'active'
        if (Math.abs(playerGridPos.x - enemy.position.x) > Math.abs(playerGridPos.y - enemy.position.y)) {
          desiredNextPosition.x += Math.sign(playerGridPos.x - enemy.position.x);
        } else {
          desiredNextPosition.y += Math.sign(playerGridPos.y - enemy.position.y);
        }
      }
    } else {
      return enemy; // Non si muove se il giocatore non è in vista
    }

    // Se la destinazione è il giocatore, il nemico si ferma (agisce come un muro)
    // 'playerIsCaught' servirà in futuro per la logica di attacco
    if (desiredNextPosition.x === playerGridPos.x && desiredNextPosition.y === playerGridPos.y) {
      playerIsCaught = true;
      return enemy;
    }

    // Controlla che la destinazione non sia un altro nemico
    const isBlockedByOtherEnemy = prevState.enemies.some(otherEnemy =>
        otherEnemy.id !== enemy.id &&
        otherEnemy.isAlive &&
        otherEnemy.position.x === desiredNextPosition.x &&
        otherEnemy.position.y === desiredNextPosition.y
    );

    if(isBlockedByOtherEnemy) {
        return enemy;
    }

    const desiredDirection = (
      desiredNextPosition.x > enemy.position.x ? 'right' :
      desiredNextPosition.x < enemy.position.x ? 'left' :
      desiredNextPosition.y > enemy.position.y ? 'down' : 'up'
    );

    return { ...enemy, position: desiredNextPosition, direction: desiredDirection, lastMoveTime: now };
  });

  // Controlla se ci sono stati cambiamenti effettivi prima di aggiornare lo stato
  const hasChanges = newEnemies.some((enemy, index) =>
    enemy.position.x !== prevState.enemies[index].position.x ||
    enemy.position.y !== prevState.enemies[index].position.y
  );

  if (hasChanges || playerIsCaught) {
    return { enemies: newEnemies, isPlayerDead: prevState.isPlayerDead || playerIsCaught };
  }

  return {};
}