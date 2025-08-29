import { useState, useEffect, useCallback, useRef } from "react";
import { levels } from '@/components/levels';
import { Level, GameState, Position, Direction, EnemyState } from '@/game';
import { findPath, getInitialGameState as getBaseInitialGameState, hasLineOfSight } from "@/utils/gameUtils";
import {
    CELL_SIZE,
    GAP_SIZE,
    PLAYER_HITBOX_RADIUS,
    PROJECTILE_HITBOX_RADIUS,
    FIRE_INTERVAL,
    PROJECTILE_SPEED,
    MOVE_DURATION,
    MOVE_COOLDOWN,
    ENEMY_MOVE_INTERVAL,
    ENEMY_HITBOX_RADIUS,
    CHARACTER_Y_OFFSET
} from "@/config/Constants";

const loadLastLevelIndex = (): number => {
  try {
    const savedIndex = localStorage.getItem('lastLevelIndex');
    if (savedIndex) {
      const parsedIndex = parseInt(savedIndex, 10);
      if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < levels.length) {
        return parsedIndex;
      }
    }
    return 0;
  } catch (error) {
    console.error("Failed to load level index from localStorage", error);
    return 0;
  }
};

export const useGameEngine = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(loadLastLevelIndex);
  const [pressedDirection, setPressedDirection] = useState<Direction | null>(null);
  const nextProjectileId = useRef(0);

  const currentLevelData = levels[currentLevelIndex];

  const getInitialGameState = useCallback((level: Level): GameState => {
    const baseState = getBaseInitialGameState(level);
    const initialPlayerPixelPosition = {
        x: baseState.playerPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2),
        y: baseState.playerPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) + CHARACTER_Y_OFFSET,
    };

    const initialEnemies: EnemyState[] = baseState.enemies.map(enemy => ({
      ...enemy,
      pixelPosition: {
        x: enemy.position.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2),
        y: enemy.position.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) + CHARACTER_Y_OFFSET,
      },
      startPosition: enemy.position,
      isMoving: false,
      moveStartTime: 0,
    }));

    return {
      ...baseState,
      enemies: initialEnemies,
      hasKeyCollected: [],
      isDoorUnlocked: [],
      projectiles: [],
      spittingTotems: level.spittingTotems?.map(t => ({...t, isAlive: true, lastShotTime: 0})) || [],
      playerPixelPosition: initialPlayerPixelPosition,
      startPosition: baseState.playerPosition,
      moveStartTime: 0,
      lastMoveTime: 0,
    };
  }, []);

  const [gameState, setGameState] = useState<GameState>(() => getInitialGameState(currentLevelData));

  const movePlayer = useCallback((direction: Direction) => {
    setGameState(prev => {
      if (Date.now() - prev.lastMoveTime < MOVE_COOLDOWN || prev.isMoving || prev.isPlayerDead || prev.gameWon) return prev;
      const newPosition = { ...prev.playerPosition };
      switch (direction) {
        case "up": newPosition.y--; break;
        case "down": newPosition.y++; break;
        case "left": newPosition.x--; break;
        case "right": newPosition.x++; break;
      }
      const destinationCell = currentLevelData.grid[newPosition.y]?.[newPosition.x];
      if (!destinationCell || destinationCell === '#') return prev;
      const door = currentLevelData.doors.find(d => d.position.x === newPosition.x && d.position.y === newPosition.y);
      if (door && !prev.isDoorUnlocked.includes(door.id) && !prev.hasKeyCollected.includes(door.id)) return prev;
      const enemy = prev.enemies.find(e => e.position.x === newPosition.x && e.position.y === newPosition.y && e.isAlive);
      if (enemy) return prev;
      return { ...prev, isMoving: true, startPosition: prev.playerPosition, playerPosition: newPosition, moveStartTime: Date.now(), playerDirection: direction };
    });
  }, [currentLevelData]);

  const handleDirectionChange = useCallback((direction: Direction | null) => { setPressedDirection(direction); }, []);
  const handleLevelReset = useCallback(() => { setGameState(getInitialGameState(currentLevelData)); }, [currentLevelData, getInitialGameState]);
  const handleNextLevel = useCallback(() => { setCurrentLevelIndex(prev => (prev + 1) % levels.length); }, []);

  const startGameAtLevel = (levelIndex: number) => {
    if (levelIndex >= 0 && levelIndex < levels.length) {
      localStorage.setItem('lastLevelIndex', levelIndex.toString());
      setCurrentLevelIndex(levelIndex);
    } else {
      console.error(`Indice di livello non valido: ${levelIndex}. Avvio dal livello 0.`);
      localStorage.setItem('lastLevelIndex', '0');
      setCurrentLevelIndex(0);
    }
  };

  const startNewGame = useCallback(() => {
    startGameAtLevel(0);
  }, []);

  useEffect(() => { setGameState(getInitialGameState(currentLevelData)); }, [currentLevelIndex, currentLevelData, getInitialGameState]);
  useEffect(() => { localStorage.setItem('lastLevelIndex', currentLevelIndex.toString()); }, [currentLevelIndex]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState(prev => {
        if (prev.isPlayerDead || prev.gameWon) return prev;
        let newState = { ...prev };
        const now = Date.now();
        if (newState.isMoving) {
          const elapsed = now - newState.moveStartTime;
          const progress = Math.min(elapsed / MOVE_DURATION, 1);
          const startPixel = { x: newState.startPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2), y: newState.startPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) + CHARACTER_Y_OFFSET };
          const endPixel = { x: newState.playerPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2), y: newState.playerPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) + CHARACTER_Y_OFFSET };
          newState.playerPixelPosition = { x: startPixel.x + (endPixel.x - startPixel.x) * progress, y: startPixel.y + (endPixel.y - startPixel.y) * progress };
          if (progress >= 1) {
            newState.isMoving = false;
            newState.startPosition = newState.playerPosition;
            newState.lastMoveTime = now;
            const finalPos = newState.playerPosition;
            const keyAtPos = currentLevelData.keys.find(k => k.position.x === finalPos.x && k.position.y === finalPos.y);
            if (keyAtPos && !newState.hasKeyCollected.includes(keyAtPos.id)) { newState.hasKeyCollected = [...newState.hasKeyCollected, keyAtPos.id]; }
            const doorAtPos = currentLevelData.doors.find(d => d.position.x === finalPos.x && d.position.y === finalPos.y);
            if (doorAtPos && newState.hasKeyCollected.includes(doorAtPos.id)) { newState.isDoorUnlocked = [...newState.isDoorUnlocked, doorAtPos.id]; }
            if (currentLevelData.grid[finalPos.y][finalPos.x] === 'E') { newState.gameWon = true; }
          }
        }
        newState.enemies = newState.enemies.map(enemy => {
            if (!enemy.isMoving) return enemy;
            const elapsed = now - enemy.moveStartTime;
            const progress = Math.min(elapsed / ENEMY_MOVE_INTERVAL, 1);
            const startPixel = { x: enemy.startPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2), y: enemy.startPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) + CHARACTER_Y_OFFSET };
            const endPixel = { x: enemy.position.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2), y: enemy.position.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) + CHARACTER_Y_OFFSET };
            const newPixelPosition = { x: startPixel.x + (endPixel.x - startPixel.x) * progress, y: startPixel.y + (endPixel.y - startPixel.y) * progress };
            if (progress >= 1) {
                return { ...enemy, isMoving: false, startPosition: enemy.position, pixelPosition: endPixel };
            }
            return { ...enemy, pixelPosition: newPixelPosition };
        });
        const { projectiles, spittingTotems, hitEnemyIds } = updateProjectiles(newState, currentLevelData, nextProjectileId);
        newState.projectiles = projectiles;
        newState.spittingTotems = spittingTotems;
        if (hitEnemyIds && hitEnemyIds.size > 0) {
          newState.enemies = newState.enemies.map(enemy => hitEnemyIds.has(enemy.id) ? { ...enemy, isAlive: false } : enemy);
        }
        const hittingProjectile = newState.projectiles.find(proj => {
          const dx = newState.playerPixelPosition.x - proj.position.x;
          const dy = newState.playerPixelPosition.y - proj.position.y;
          const distanceSquared = (dx * dx) + (dy * dy);
          const sumOfRadii = PLAYER_HITBOX_RADIUS + PROJECTILE_HITBOX_RADIUS;
          return distanceSquared < (sumOfRadii * sumOfRadii);
        });
        if (hittingProjectile) {
          newState.isPlayerDead = true;
          newState.isMoving = false;
          newState.projectiles = newState.projectiles.filter(p => p.id !== hittingProjectile.id);
        }
        return newState;
      });
    }, 1000 / 60);
    return () => clearInterval(gameLoop);
  }, [currentLevelData]);

  useEffect(() => {
    const aiLoop = setInterval(() => {
      setGameState(prev => {
        if (prev.gameWon || prev.isPlayerDead) return prev;

        const playerGridPos = prev.isMoving ? prev.playerPosition : prev.startPosition;
        let playerIsCaught = false;

        const newEnemies = prev.enemies.map(enemy => {
          if (enemy.isMoving || !enemy.isAlive || !enemy.moveInterval || Date.now() - enemy.lastMoveTime < enemy.moveInterval) {
            return enemy;
          }

          let desiredNextPosition = { ...enemy.position };

          const path = findPath(enemy.position, playerGridPos, currentLevelData.grid);
          const pathDistance = path.length - 1;
          const isPlayerInVision = path.length > 0 && pathDistance <= enemy.visionRange;

          if (isPlayerInVision) {
            if (enemy.behavior === 'smart_active') {
              const path = findPath(enemy.position, playerGridPos, currentLevelData.grid);
              if (path.length > 1) desiredNextPosition = path[1];
            } else if (enemy.behavior === 'active') {
              if (Math.abs(playerGridPos.x - enemy.position.x) > Math.abs(playerGridPos.y - enemy.position.y)) {
                desiredNextPosition.x += Math.sign(playerGridPos.x - enemy.position.x);
              } else {
                desiredNextPosition.y += Math.sign(playerGridPos.y - enemy.position.y);
              }
            }
          } else {
            return enemy;
          }

          if (desiredNextPosition.x === enemy.position.x && desiredNextPosition.y === enemy.position.y) return enemy;

          // --- MODIFICA CHIAVE QUI ---
          // Controlliamo se la destinazione è il giocatore
          if (desiredNextPosition.x === playerGridPos.x && desiredNextPosition.y === playerGridPos.y) {
            playerIsCaught = true;
            // NON ritorniamo più `enemy` qui, permettiamo al nemico di "muoversi" e al flag di essere processato.
          }

          // Controlla se è bloccato da un altro nemico
          const isBlockedByOtherEnemy = prev.enemies.some(e => e.id !== enemy.id && e.isAlive && e.position.x === desiredNextPosition.x && e.position.y === desiredNextPosition.y);
          if (isBlockedByOtherEnemy) {
            return enemy;
          }

          const desiredDirection = (desiredNextPosition.x > enemy.position.x ? 'right' : desiredNextPosition.x < enemy.position.x ? 'left' : desiredNextPosition.y > enemy.position.y ? 'down' : 'up');
          return { ...enemy, isMoving: true, startPosition: enemy.position, position: desiredNextPosition, moveStartTime: Date.now(), lastMoveTime: Date.now(), direction: desiredDirection };
        });

        // Aggiorna lo stato se un nemico si è mosso O se il giocatore è stato catturato
        if (newEnemies.some(e => e.isMoving) || playerIsCaught) {
            return { ...prev, enemies: newEnemies, isPlayerDead: prev.isPlayerDead || playerIsCaught };
        }

        return prev;
      });
    }, ENEMY_MOVE_INTERVAL);
    return () => clearInterval(aiLoop);
  }, [currentLevelData, findPath]);

  useEffect(() => {
    const moveContinuously = () => { if (pressedDirection) { movePlayer(pressedDirection); } };
    const intervalId = setInterval(moveContinuously, 100);
    return () => clearInterval(intervalId);
  }, [pressedDirection, movePlayer]);

  useEffect(() => { if (gameState.isPlayerDead) { const t = setTimeout(handleLevelReset, 1500); return () => clearTimeout(t); } }, [gameState.isPlayerDead, handleLevelReset]);
  useEffect(() => { if (gameState.gameWon) { const t = setTimeout(handleNextLevel, 2000); return () => clearTimeout(t); } }, [gameState.gameWon, handleNextLevel]);

  return {
    gameState,
    currentLevelData,
    handleDirectionChange,
    handleLevelReset,
    startNewGame,
    startGameAtLevel, // <-- AGGIUNGI QUESTO
  };
};

function updateProjectiles(prevState: GameState, levelData: any, nextProjectileId: React.MutableRefObject<number>): Partial<GameState> & { hitEnemyIds: Set<string> } {
    const now = Date.now();
    const hitEnemyIds = new Set<string>();
    let projectiles = [...prevState.projectiles];
    const spittingTotems = prevState.spittingTotems.map(totem => {
      if (totem.isAlive && now - totem.lastShotTime > FIRE_INTERVAL) {
        projectiles.push({
          id: nextProjectileId.current++,
          position: { x: totem.position.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2), y: totem.position.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) },
          direction: totem.direction, type: 'totem'
        });
        return { ...totem, lastShotTime: now };
      }
      return totem;
    });
    projectiles = projectiles.map(proj => {
      let newPos = { ...proj.position };
      switch (proj.direction) {
        case 'up': newPos.y -= PROJECTILE_SPEED; break;
        case 'down': newPos.y += PROJECTILE_SPEED; break;
        case 'left': newPos.x -= PROJECTILE_SPEED; break;
        case 'right': newPos.x += PROJECTILE_SPEED; break;
      }
      const enemyHit = prevState.enemies.find(enemy => {
        if (!enemy.isAlive) return false;
        const enemyPixelPos = {
          x: enemy.pixelPosition.x,
          y: enemy.pixelPosition.y,
        };
        const dx = newPos.x - enemyPixelPos.x;
        const dy = newPos.y - enemyPixelPos.y;
        const distanceSquared = (dx * dx) + (dy * dy);
        const sumOfRadii = PROJECTILE_HITBOX_RADIUS + ENEMY_HITBOX_RADIUS;
        return distanceSquared < (sumOfRadii * sumOfRadii);
      });
      if (enemyHit) {
        hitEnemyIds.add(enemyHit.id);
        return null;
      }
      const gridX = Math.floor(newPos.x / (CELL_SIZE + GAP_SIZE));
      const gridY = Math.floor(newPos.y / (CELL_SIZE + GAP_SIZE));
      if (gridX < 0 || gridX >= levelData.grid[0].length || gridY < 0 || gridY >= levelData.grid.length ||
          levelData.grid[gridY]?.[gridX] === '#') {
        return null;
      }
      return { ...proj, position: newPos };
    }).filter((p): p is NonNullable<typeof p> => p !== null);
    return { projectiles, spittingTotems, hitEnemyIds };
}