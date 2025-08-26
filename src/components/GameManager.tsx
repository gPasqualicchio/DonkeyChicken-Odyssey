// GameManager.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import GameBoard from "./game/GameBoard";
import { levels } from './levels';
import { Level, GameState, Position, Direction } from './game';
import {
    CELL_SIZE,
    GAP_SIZE,
    PLAYER_HITBOX_RADIUS,
    PROJECTILE_HITBOX_RADIUS
} from "@/config/Constants";
import { getInitialGameState as getBaseInitialGameState, findPath } from "@/utils/gameUtils";
import { GameAssets } from "@/config/Assets";
import { Button } from "@/components/ui/button";
import iconsSprite from '@/assets/icons/Icons_InGame.png';

const FIRE_INTERVAL = 2000;
const PROJECTILE_SPEED = 2;
const MOVE_DURATION = 150;
const MOVE_COOLDOWN = 500;
const ENEMY_MOVE_INTERVAL = 200; // Intervallo per il movimento dei nemici

const GameManager = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const nextProjectileId = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLevelData = levels[currentLevelIndex];
  const [pressedDirection, setPressedDirection] = useState<Direction | null>(null);

  const getInitialGameState = useCallback((level: Level): GameState => {
    const baseState = getBaseInitialGameState(level);
    const initialPixelPosition = {
        x: baseState.playerPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2),
        y: baseState.playerPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) - 16,
    };
    return {
      ...baseState,
      hasKeyCollected: [],
      isDoorUnlocked: [],
      projectiles: [],
      spittingTotems: level.spittingTotems?.map(totem => ({...totem, isAlive: true, lastShotTime: 0})) || [],
      playerPixelPosition: initialPixelPosition,
      startPosition: baseState.playerPosition,
      moveStartTime: 0,
      lastMoveTime: 0,
    };
  }, []);

  const [gameState, setGameState] = useState<GameState>(() => getInitialGameState(currentLevelData));

  useEffect(() => { setGameState(getInitialGameState(currentLevelData)); }, [currentLevelIndex, currentLevelData, getInitialGameState]);

  const handleDirectionChange = useCallback((direction: Direction | null) => { setPressedDirection(direction); }, []);

  const movePlayer = useCallback((direction: Direction) => {
    setGameState(prev => {
      if (Date.now() - prev.lastMoveTime < MOVE_COOLDOWN) { return prev; }
      if (prev.isMoving || prev.isPlayerDead || prev.gameWon) { return prev; }
      const newPosition = { ...prev.playerPosition };
      switch (direction) {
        case "up": newPosition.y--; break;
        case "down": newPosition.y++; break;
        case "left": newPosition.x--; break;
        case "right": newPosition.x++; break;
      }
      const destinationCell = currentLevelData.grid[newPosition.y]?.[newPosition.x];
      if (!destinationCell || destinationCell === '#') { return prev; }
      const doorAtPosition = currentLevelData.doors.find(d => d.position.x === newPosition.x && d.position.y === newPosition.y);
      if (doorAtPosition && !prev.isDoorUnlocked.includes(doorAtPosition.id) && !prev.hasKeyCollected.includes(doorAtPosition.id)) { return prev; }
      const enemyAsWall = prev.enemies.find(e => e.position.x === newPosition.x && e.position.y === newPosition.y && e.isAlive);
      if (enemyAsWall) { return prev; }
      return {
        ...prev, isMoving: true, startPosition: prev.playerPosition, playerPosition: newPosition, moveStartTime: Date.now(), playerDirection: direction,
      };
    });
  }, [currentLevelData]);

  // --- LOOP DI GIOCO UNIFICATO (Giocatore + Proiettili) ---
  useEffect(() => {
    const gameLoop = setInterval(() => {
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
            const keyAtPos = currentLevelData.keys.find(k => k.position.x === finalPos.x && k.position.y === finalPos.y);
            if (keyAtPos && !newState.hasKeyCollected.includes(keyAtPos.id)) { newState.hasKeyCollected.push(keyAtPos.id); }
            const doorAtPos = currentLevelData.doors.find(d => d.position.x === finalPos.x && d.position.y === finalPos.y);
            if (doorAtPos && newState.hasKeyCollected.includes(doorAtPos.id)) {
              newState.isDoorUnlocked.push(doorAtPos.id);
              //newState.hasKeyCollected = newState.hasKeyCollected.filter(k => k !== doorAtPos.id);
            }
            if (currentLevelData.grid[finalPos.y][finalPos.x] === 'E') { newState.gameWon = true; }
          }
        }
        const newProjectiles = [...newState.projectiles];
        newState.spittingTotems.forEach(totem => {
          if (totem.isAlive && now - totem.lastShotTime > FIRE_INTERVAL) {
            newProjectiles.push({ id: nextProjectileId.current++, position: { x: totem.position.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2), y: totem.position.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) }, direction: totem.direction, type: 'totem' });
            totem.lastShotTime = now;
          }
        });
        newState.projectiles = newProjectiles.map(proj => {
          let newPos = { ...proj.position };
          switch(proj.direction) {
            case 'up': newPos.y -= PROJECTILE_SPEED; break;
            case 'down': newPos.y += PROJECTILE_SPEED; break;
            case 'left': newPos.x -= PROJECTILE_SPEED; break;
            case 'right': newPos.x += PROJECTILE_SPEED; break;
          }
          const gridX = Math.floor(newPos.x / (CELL_SIZE + GAP_SIZE));
          const gridY = Math.floor(newPos.y / (CELL_SIZE + GAP_SIZE));
          if (gridX < 0 || gridX >= currentLevelData.grid[0].length || gridY < 0 || gridY >= currentLevelData.grid.length || currentLevelData.grid[gridY]?.[gridX] === '#' || newState.enemies.some(e => e.isAlive && e.position.x === gridX && e.position.y === gridY)) { return null; }
          return { ...proj, position: newPos };
        }).filter(p => p !== null);
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

  // --- LOOP PER MOVIMENTO CONTINUO ---
  useEffect(() => {
    const moveContinuously = () => { if (pressedDirection) { movePlayer(pressedDirection); } };
    const intervalId = setInterval(moveContinuously, 100);
    return () => clearInterval(intervalId);
  }, [pressedDirection, movePlayer]);

  // --- 👇 LOOP PER AI NEMICI RIPRISTINATO E CORRETTO 👇 ---
  useEffect(() => {
    const aiLoop = setInterval(() => {
      setGameState(prev => {
        if (prev.gameWon || prev.isPlayerDead) return prev;

        const playerGridPos = prev.isMoving ? prev.playerPosition : prev.startPosition;
        let playerIsCaught = false;

        const newEnemies = prev.enemies.map(enemy => {
          if (!enemy.isAlive || !enemy.moveInterval || Date.now() - enemy.lastMoveTime < enemy.moveInterval) {
            return enemy;
          }
          let desiredNextPosition = { ...enemy.position };
          const isPlayerInVision = Math.abs(playerGridPos.x - enemy.position.x) + Math.abs(playerGridPos.y - enemy.position.y) <= enemy.visionRange;

          if ((enemy.behavior === 'active' || enemy.behavior === 'smart_active') && isPlayerInVision) {
            if (enemy.behavior === 'smart_active') {
              const path = findPath(enemy.position, playerGridPos, currentLevelData.grid);
              if (path.length > 1) desiredNextPosition = path[1];
            } else { // 'active' behavior
              if (Math.abs(playerGridPos.x - enemy.position.x) > Math.abs(playerGridPos.y - enemy.position.y)) {
                desiredNextPosition.x += Math.sign(playerGridPos.x - enemy.position.x);
              } else {
                desiredNextPosition.y += Math.sign(playerGridPos.y - enemy.position.y);
              }
            }
          } else {
            return enemy; // Non si muove se il giocatore non è in vista
          }

          // Controlla se il nemico sta per colpire il giocatore (logica di morte da attacco, non da contatto)
          if (desiredNextPosition.x === playerGridPos.x && desiredNextPosition.y === playerGridPos.y) {
            playerIsCaught = true;
          }

          // Per ora il nemico non si muove sulla casella del giocatore, funge da muro
          if (desiredNextPosition.x === playerGridPos.x && desiredNextPosition.y === playerGridPos.y) {
            return enemy;
          }

          const desiredDirection = (desiredNextPosition.x > enemy.position.x ? 'right' : desiredNextPosition.x < enemy.position.x ? 'left' : desiredNextPosition.y > enemy.position.y ? 'down' : 'up');
          return { ...enemy, position: desiredNextPosition, direction: desiredDirection, lastMoveTime: Date.now() };
        });

        // Applica gli aggiornamenti solo se qualcosa è cambiato
        if (newEnemies.some((e, i) => e.position !== prev.enemies[i].position) || playerIsCaught) {
          return { ...prev, enemies: newEnemies, isPlayerDead: prev.isPlayerDead || playerIsCaught };
        }
        return prev;
      });
    }, ENEMY_MOVE_INTERVAL);
    return () => clearInterval(aiLoop);
  }, [currentLevelData, findPath]);

  const handleLevelReset = useCallback(() => { setGameState(getInitialGameState(currentLevelData)); }, [currentLevelData, getInitialGameState]);
  useEffect(() => { if (gameState.isPlayerDead) { const t = setTimeout(handleLevelReset, 1500); return () => clearTimeout(t); } }, [gameState.isPlayerDead, handleLevelReset]);
  const handleNextLevel = useCallback(() => { setCurrentLevelIndex(prev => (prev + 1) % levels.length); }, []);
  useEffect(() => { if (gameState.gameWon) { const t = setTimeout(handleNextLevel, 2000); return () => clearTimeout(t); } }, [gameState.gameWon, handleNextLevel]);

return (
        <div className="relative">
            <div className="absolute top-8 right-8 flex gap-2 z-30">
                <Button onClick={handleLevelReset} className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
                    <img
                        src={iconsSprite}
                        alt="Restart Icon"
                        className="w-full h-full"
                    />
                </Button>

                <Button className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
                    <img
                        src={iconsSprite}
                        alt="Main Menu Icon"
                        className="w-full h-full"
                    />
                </Button>

                <Button className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
                    <img
                        src={iconsSprite}
                        alt="Music Icon"
                        className="w-full h-full"
                    />
                </Button>

                <Button disabled className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50/50 border-none shadow-none">
                    <img
                        src={iconsSprite}
                        alt="Sound Icon"
                        className="w-full h-full"
                    />
                </Button>
            </div>
            <GameBoard
                key={currentLevelData.id}
                level={currentLevelData}
                gameState={gameState}
                onDirectionChange={handleDirectionChange}
                assets={GameAssets}
            />
        </div>
    );
};

export default GameManager;