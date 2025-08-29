import { useState, useEffect, useCallback, useRef } from "react";
import { levels } from '@/components/levels';
import { Level, GameState, Position, Direction, EnemyState, Projectile } from '@/game';
import { findPath } from "@/utils/gameUtils";
import {
    CELL_SIZE,
    GAP_SIZE,
    PLAYER_HITBOX_RADIUS,
    PROJECTILE_HITBOX_RADIUS,
    ENEMY_HITBOX_RADIUS,
    FIRE_INTERVAL,
    PROJECTILE_SPEED,
    MOVE_DURATION,
    MOVE_COOLDOWN,
    ENEMY_MOVE_INTERVAL
} from "@/config/Constants";

const getInitialGameState = (level: Level): GameState => {
  let startPos: Position = { x: 0, y: 0 };
  level.grid.forEach((row, y) => {
    const pIndex = row.indexOf('P');
    if (pIndex !== -1) startPos = { x: pIndex, y: y };
  });
  const initialPlayerPixelPosition = {
      x: startPos.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2),
      y: startPos.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) - 16,
  };
  return {
    level: level,
    playerPosition: startPos,
    playerDirection: 'down',
    gameWon: false,
    isMoving: false,
    isPlayerDead: false,
    moveCount: 0,
    enemies: level.enemies?.map((e, index) => ({
      id: e.id || index,
      position: e.startPosition,
      type: e.type,
      behavior: e.behavior,
      visionRange: e.visionRange || 5,
      moveInterval: e.moveInterval || 1000,
      lastMoveTime: 0,
      direction: "down",
      isAlive: true,
      pixelPosition: { x: e.startPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE/2), y: e.startPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE/2) - 16 },
      startPosition: e.startPosition,
      isMoving: false,
      moveStartTime: 0,
    })) || [],
    hasKeyCollected: [],
    isDoorUnlocked: [],
    projectiles: [],
    spittingTotems: level.spittingTotems?.map(t => ({...t, isAlive: true, lastShotTime: 0})) || [],
    playerPixelPosition: initialPlayerPixelPosition,
    startPosition: startPos,
    moveStartTime: 0,
    lastMoveTime: 0,
    pressedLeverIds: [],
  };
};

export const useGameEngine = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(() => getInitialGameState(levels[currentLevelIndex]));
  const [pressedDirection, setPressedDirection] = useState<Direction | null>(null);
  const nextProjectileId = useRef(0);
  const [actionableLeverId, setActionableLeverId] = useState<number | null>(null);
  const lastTimeRef = useRef(performance.now());

  const startNewGame = useCallback(() => {
    setCurrentLevelIndex(0);
    setGameState(getInitialGameState(levels[0]));
  }, []);

  const startGameAtLevel = useCallback((levelIndex: number) => {
    if (levelIndex >= 0 && levelIndex < levels.length) {
      setCurrentLevelIndex(levelIndex);
      setGameState(getInitialGameState(levels[levelIndex]));
    }
  }, []);

  const handleNextLevel = useCallback(() => {
    setCurrentLevelIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % levels.length;
        setGameState(getInitialGameState(levels[nextIndex]));
        return nextIndex;
    });
  }, []);

  const handleLevelReset = useCallback(() => {
    setGameState(getInitialGameState(levels[currentLevelIndex]));
  }, [currentLevelIndex]);

  const toggleLever = () => {
    if (actionableLeverId === null) return;
    setGameState(prev => {
      const isAlreadyPressed = prev.pressedLeverIds.includes(actionableLeverId);
      let newPressedLeverIds: number[];
      let newIsDoorUnlocked: number[];
      if (isAlreadyPressed) {
        newPressedLeverIds = prev.pressedLeverIds.filter(id => id !== actionableLeverId);
        newIsDoorUnlocked = prev.isDoorUnlocked.filter(id => id !== actionableLeverId);
      } else {
        newPressedLeverIds = [...prev.pressedLeverIds, actionableLeverId];
        newIsDoorUnlocked = [...prev.isDoorUnlocked, actionableLeverId];
      }
      return { ...prev, pressedLeverIds: newPressedLeverIds, isDoorUnlocked: newIsDoorUnlocked };
    });
  };

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
      const destinationCell = prev.level.grid[newPosition.y]?.[newPosition.x];
      if (!destinationCell || destinationCell === '#') return prev;
      let newIsDoorUnlocked = [...prev.isDoorUnlocked];
      let newHasKeyCollected = [...prev.hasKeyCollected];
      const door = prev.level.doors.find(d => d.position.x === newPosition.x && d.position.y === newPosition.y);
      if (door && !newIsDoorUnlocked.includes(door.id)) {
        if (door.type === 'key' && newHasKeyCollected.includes(door.id)) {
          newIsDoorUnlocked.push(door.id);
          newHasKeyCollected = newHasKeyCollected.filter(keyId => keyId !== door.id);
        } else {
          return prev;
        }
      }
      const enemy = prev.enemies.find(e => e.position.x === newPosition.x && e.position.y === newPosition.y && e.isAlive);
      if (enemy) return prev;
      return {
        ...prev,
        isDoorUnlocked: newIsDoorUnlocked,
        hasKeyCollected: newHasKeyCollected,
        isMoving: true,
        startPosition: prev.playerPosition,
        playerPosition: newPosition,
        moveStartTime: Date.now(),
        playerDirection: direction
      };
    });
  }, []);

  const handleDirectionChange = useCallback((direction: Direction | null) => {
    setPressedDirection(direction);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      setGameState(prev => {
        if (prev.isPlayerDead || prev.gameWon) return prev;
        let newState = { ...prev };
        const now = Date.now();
        if (newState.isMoving) {
          const elapsed = now - newState.moveStartTime;
          const progress = Math.min(elapsed / MOVE_DURATION, 1);
          const startPixel = { x: newState.startPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2), y: newState.startPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) - 16 };
          const endPixel = { x: newState.playerPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2), y: newState.playerPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) - 16 };
          newState.playerPixelPosition = { x: startPixel.x + (endPixel.x - startPixel.x) * progress, y: startPixel.y + (endPixel.y - startPixel.y) * progress };
          if (progress >= 1) {
            newState.isMoving = false;
            newState.startPosition = newState.playerPosition;
            newState.lastMoveTime = now;
            const finalPos = newState.playerPosition;
            const keyAtPos = newState.level.keys.find(k => k.position.x === finalPos.x && k.position.y === finalPos.y);
            if (keyAtPos && !newState.hasKeyCollected.includes(keyAtPos.id)) {
                newState.hasKeyCollected = [...newState.hasKeyCollected, keyAtPos.id];
            }
            if (newState.level.grid[finalPos.y][finalPos.x] === 'E') newState.gameWon = true;
            const leverAtPosition = newState.level.levers.find(lever => lever.position.x === finalPos.x && lever.position.y === finalPos.y);
            setActionableLeverId(leverAtPosition ? leverAtPosition.id : null);
          }
        }
        newState.enemies = newState.enemies.map(enemy => {
            if (!enemy.isMoving) return enemy;
            const elapsed = now - enemy.moveStartTime;
            const progress = Math.min(elapsed / ENEMY_MOVE_INTERVAL, 1);
            const startPixel = { x: enemy.startPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2), y: enemy.startPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) - 16 };
            const endPixel = { x: enemy.position.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2), y: enemy.position.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) - 16 };
            const newPixelPosition = {
                x: startPixel.x + (endPixel.x - startPixel.x) * progress,
                y: startPixel.y + (endPixel.y - startPixel.y) * progress,
            };
            if (progress >= 1) {
                return { ...enemy, isMoving: false, startPosition: enemy.position, pixelPosition: endPixel };
            }
            return { ...enemy, pixelPosition: newPixelPosition };
        });
        const projectileUpdates = updateProjectiles(newState, nextProjectileId, deltaTime);
        newState = { ...newState, ...projectileUpdates };
        const hittingProjectile = newState.projectiles.find(proj => {
          const dx = newState.playerPixelPosition.x - proj.position.x;
          const dy = newState.playerPixelPosition.y - proj.position.y;
          const distanceSquared = (dx * dx) + (dy * dy);
          const sumOfRadii = PLAYER_HITBOX_RADIUS + PROJECTILE_HITBOX_RADIUS;
          return distanceSquared < (sumOfRadii * sumOfRadii);
        });
        if (hittingProjectile) newState.isPlayerDead = true;
        return newState;
      });
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

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

              const otherEnemies = prev.enemies.filter(e => e.id !== enemy.id);

              // --- MODIFICATO QUI: Aggiunto 'enemy.id' alla chiamata ---
              const path = findPath(enemy.position, playerGridPos, prev.level, prev.isDoorUnlocked, otherEnemies, enemy.id);

              let isPlayerInVision = false;
              // La logica della visione ora ignora gli altri nemici per non essere bloccata
              const pathForVision = findPath(enemy.position, playerGridPos, prev.level, prev.isDoorUnlocked, [], enemy.id);
              if (pathForVision.length > 1 && (pathForVision.length - 1) <= (enemy.visionRange || 0)) {
                  isPlayerInVision = true;
              }

              let desiredNextPosition = { ...enemy.position };
              if (enemy.behavior === 'smart_active' && isPlayerInVision) {
                if (path.length > 1) { // Usa il percorso che considera gli altri nemici per muoversi
                  desiredNextPosition = path[1];
                } else {
                  return enemy;
                }
              } else {
                return enemy;
              }

              if (desiredNextPosition.x === playerGridPos.x && desiredNextPosition.y === playerGridPos.y) {
                playerIsCaught = true;
                return enemy;
              }

              // Controllo anti-collisione prima di muoversi (questo è ridondante se findPath funziona, ma è una sicurezza in più)
              const isNextTileOccupied = otherEnemies.some(
                  e => e.position.x === desiredNextPosition.x && e.position.y === desiredNextPosition.y
              );
              if (isNextTileOccupied) {
                  return enemy;
              }

              if (desiredNextPosition.x !== enemy.position.x || desiredNextPosition.y !== enemy.position.y) {
                const desiredDirection = (desiredNextPosition.x > enemy.position.x ? 'right' : desiredNextPosition.x < enemy.position.x ? 'left' : desiredNextPosition.y > enemy.position.y ? 'down' : 'up');
                return { ...enemy, isMoving: true, startPosition: enemy.position, position: desiredNextPosition, moveStartTime: Date.now(), lastMoveTime: Date.now(), direction: desiredDirection };
              }

              return enemy;
            });

            if (playerIsCaught) return { ...prev, isPlayerDead: true };
            return { ...prev, enemies: newEnemies };
          });
        }, ENEMY_MOVE_INTERVAL);
        return () => clearInterval(aiLoop);
      }, []);

  useEffect(() => {
    const moveContinuously = () => { if (pressedDirection) movePlayer(pressedDirection); };
    const intervalId = setInterval(moveContinuously, 100);
    return () => clearInterval(intervalId);
  }, [pressedDirection, movePlayer]);

  useEffect(() => { if (gameState.isPlayerDead) { const t = setTimeout(handleLevelReset, 1500); return () => clearTimeout(t); } }, [gameState.isPlayerDead, handleLevelReset]);

  useEffect(() => { if (gameState.gameWon) { const t = setTimeout(handleNextLevel, 2000); return () => clearTimeout(t); } }, [gameState.gameWon, handleNextLevel]);

  return {
    gameState,
    handleDirectionChange,
    handleLevelReset,
    actionableLeverId,
    toggleLever,
    startNewGame,
    startGameAtLevel,
  };
};

function updateProjectiles(prevState: GameState, nextProjectileId: React.MutableRefObject<number>, deltaTime: number): Partial<GameState> {
    const now = Date.now();
    let newProjectiles = [...prevState.projectiles];
    const spittingTotems = prevState.spittingTotems.map(totem => {
      if (totem.isAlive && now - totem.lastShotTime > FIRE_INTERVAL) {
        newProjectiles.push({
          id: nextProjectileId.current++,
          position: { x: totem.position.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2), y: totem.position.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) },
          direction: totem.direction, type: 'totem'
        });
        return { ...totem, lastShotTime: now };
      }
      return totem;
    });
    let updatedEnemies = [...prevState.enemies];
    const hitEnemyIds = new Set<number>();
    const updatedProjectiles = newProjectiles.map(proj => {
      let newPos = { ...proj.position };
      const distanceToMove = PROJECTILE_SPEED * deltaTime;
      switch (proj.direction) {
        case 'up': newPos.y -= distanceToMove; break;
        case 'down': newPos.y += distanceToMove; break;
        case 'left': newPos.x -= distanceToMove; break;
        case 'right': newPos.x += distanceToMove; break;
      }
      const hitEnemy = updatedEnemies.find(enemy => {
        if (!enemy.isAlive || hitEnemyIds.has(enemy.id)) return false;
        const dx = newPos.x - enemy.pixelPosition.x;
        const dy = newPos.y - enemy.pixelPosition.y;
        const distanceSquared = (dx * dx) + (dy * dy);
        const sumOfRadii = PROJECTILE_HITBOX_RADIUS + ENEMY_HITBOX_RADIUS;
        return distanceSquared < (sumOfRadii * sumOfRadii);
      });
      if (hitEnemy) {
        hitEnemyIds.add(hitEnemy.id);
        return null;
      }
      const gridX = Math.floor(newPos.x / (CELL_SIZE + GAP_SIZE));
      const gridY = Math.floor(newPos.y / (CELL_SIZE + GAP_SIZE));
      if (gridX < 0 || gridX >= prevState.level.grid[0].length || gridY < 0 || gridY >= prevState.level.grid.length || prevState.level.grid[gridY]?.[gridX] === '#') {
        return null;
      }
      return { ...proj, position: newPos };
    }).filter((p): p is Projectile => p !== null);
    if (hitEnemyIds.size > 0) {
        updatedEnemies = updatedEnemies.map(enemy =>
            hitEnemyIds.has(enemy.id) ? { ...enemy, isAlive: false } : enemy
        );
    }
    return {
        projectiles: updatedProjectiles,
        spittingTotems,
        enemies: updatedEnemies
    };
}