import { GameState } from "@/game";
import { MOVE_DURATION, CELL_SIZE, GAP_SIZE } from "@/config/Constants";
import { Level } from "@/game";

// Gestisce l'aggiornamento della posizione in pixel durante l'animazione
export function updatePlayerAnimation(prevState: GameState): Partial<GameState> {
  if (!prevState.isMoving) {
    return {}; // Nessun cambiamento se il giocatore è fermo
  }

  const now = Date.now();
  const elapsed = now - prevState.moveStartTime;
  const progress = Math.min(elapsed / MOVE_DURATION, 1);

  const startPixel = {
    x: prevState.startPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2),
    y: prevState.startPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) - 16,
  };
  const endPixel = {
    x: prevState.playerPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2),
    y: prevState.playerPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) - 16,
  };

  const playerPixelPosition = {
    x: startPixel.x + (endPixel.x - startPixel.x) * progress,
    y: startPixel.y + (endPixel.y - startPixel.y) * progress,
  };

  return { playerPixelPosition };
}


// Gestisce le azioni a fine movimento (raccogliere chiavi, aprire porte, vincere)
export function handlePlayerActions(prevState: GameState, levelData: Level): Partial<GameState> {
  const now = Date.now();
  const elapsed = now - prevState.moveStartTime;
  const progress = Math.min(elapsed / MOVE_DURATION, 1);

  // Esegui solo se l'animazione è appena terminata
  if (!prevState.isMoving || progress < 1) {
    return {};
  }

  const newState: Partial<GameState> = {
    isMoving: false,
    startPosition: prevState.playerPosition,
    lastMoveTime: now,
  };

  const finalPos = prevState.playerPosition;

  // Raccogli chiave
  const keyAtPos = levelData.keys.find(k => k.position.x === finalPos.x && k.position.y === finalPos.y);
  if (keyAtPos && !prevState.hasKeyCollected.includes(keyAtPos.id)) {
    newState.hasKeyCollected = [...prevState.hasKeyCollected, keyAtPos.id];
  }

  // Apri porta
  const doorAtPos = levelData.doors.find(d => d.position.x === finalPos.x && d.position.y === finalPos.y);
  if (doorAtPos && prevState.hasKeyCollected.includes(doorAtPos.id)) {
    newState.isDoorUnlocked = [...prevState.isDoorUnlocked, doorAtPos.id];
  }

  // Vinci il livello
  if (levelData.grid[finalPos.y][finalPos.x] === 'E') {
    newState.gameWon = true;
  }

  return newState;
}