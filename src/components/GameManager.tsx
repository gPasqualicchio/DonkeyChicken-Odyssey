// GameManager.tsx

import { useState, useEffect, useCallback, useRef } from "react";
// Rimosso: useToast non serve più
import GameBoard from "./game/GameBoard";
import { levels } from './levels';
import { Level, GameState, Position, Direction, EnemyState } from './game';
import { GRID_WIDTH, GRID_HEIGHT } from "@/config/Constants";
import { getInitialGameState as getBaseInitialGameState, findPath } from "@/utils/gameUtils";
import { GameAssets } from "@/config/Assets";
import { Button } from "@/components/ui/button";

import iconsSprite from '@/assets/icons/Icons_InGame.png';

const GameManager = () => {
  // Rimosso: useToast non serve più
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLevelData = levels[currentLevelIndex];

  const [pressedDirection, setPressedDirection] = useState<Direction | null>(null);

  const getInitialGameState = useCallback((level: Level): GameState => {
    const baseState = getBaseInitialGameState(level);
    return {
      ...baseState,
      hasKeyCollected: [],
      isDoorUnlocked: [],
    };
  }, [getBaseInitialGameState]);

  const [gameState, setGameState] = useState<GameState>(() => getInitialGameState(currentLevelData));

  useEffect(() => {
    setGameState(getInitialGameState(currentLevelData));
  }, [currentLevelIndex, currentLevelData, getInitialGameState]);

  const handleDirectionChange = useCallback((direction: Direction | null) => {
    setPressedDirection(direction);
  }, []);

  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const timeSinceLastMove = Date.now() - gameState.lastMoveTime;
    const moveCooldown = 500;

    if (gameState.gameWon || gameState.isMoving || gameState.isPlayerDead || timeSinceLastMove < moveCooldown) return;

    setGameState(prev => {
      const newPosition = { ...prev.playerPosition };

      switch (direction) {
        case "up": if (newPosition.y > 0) newPosition.y--; break;
        case "down": if (newPosition.y < GRID_HEIGHT - 1) newPosition.y++; break;
        case "left": if (newPosition.x > 0) newPosition.x--; break;
        case "right": if (newPosition.x < GRID_WIDTH - 1) newPosition.x++; break;
      }

      if (newPosition.x === prev.playerPosition.x && newPosition.y === prev.playerPosition.y) return prev;

      const destinationCell = currentLevelData.grid[newPosition.y][newPosition.x];

      if (destinationCell === '#') return prev;

      let newHasKeyCollected = [...prev.hasKeyCollected];
      let newIsDoorUnlocked = [...prev.isDoorUnlocked];
      let gameWon = prev.gameWon;

      const keyAtPosition = currentLevelData.keys.find(key => key.position.x === newPosition.x && key.position.y === newPosition.y);
      if (keyAtPosition && !prev.hasKeyCollected.includes(keyAtPosition.id) && !prev.isDoorUnlocked.includes(keyAtPosition.id)) {
        newHasKeyCollected.push(keyAtPosition.id);
      }

      const doorAtPosition = currentLevelData.doors.find(door => door.position.x === newPosition.x && door.position.y === newPosition.y);
      if (doorAtPosition) {
        if (doorAtPosition.type === 'key' && newHasKeyCollected.includes(doorAtPosition.id)) {
          newIsDoorUnlocked.push(doorAtPosition.id);
          newHasKeyCollected = newHasKeyCollected.filter(keyId => keyId !== doorAtPosition.id);
        } else if (doorAtPosition.type === 'lever' && prev.isLeverPressed === doorAtPosition.id) {
          newIsDoorUnlocked.push(doorAtPosition.id);
        } else if (!newIsDoorUnlocked.includes(doorAtPosition.id)) {
          return prev;
        }
      }

      const isEnemyCollision = prev.enemies.some(enemy => enemy.position.x === newPosition.x && enemy.position.y === newPosition.y && enemy.isAlive);
      if (isEnemyCollision) {
        return { ...prev, isPlayerDead: true };
      }

      if (destinationCell === 'E') {
        gameWon = true;
      }

      return {
        ...prev,
        playerPosition: newPosition,
        playerDirection: direction,
        moveCount: prev.moveCount + 1,
        gameWon,
        isMoving: true,
        lastMoveTime: Date.now(),
        hasKeyCollected: newHasKeyCollected,
        isDoorUnlocked: newIsDoorUnlocked,
      };
    });

    setTimeout(() => setGameState(prev => ({ ...prev, isMoving: false })), 150);
  }, [currentLevelData, gameState.gameWon, gameState.isMoving, gameState.isPlayerDead, gameState.lastMoveTime]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const movePlayerContinuously = () => {
      const timeSinceLastMove = Date.now() - gameState.lastMoveTime;
      const moveCooldown = 500;
      if (pressedDirection && timeSinceLastMove >= moveCooldown) {
        movePlayer(pressedDirection);
      }
    };
    intervalId = setInterval(movePlayerContinuously, 50);
    return () => clearInterval(intervalId);
  }, [pressedDirection, gameState.lastMoveTime, movePlayer]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameState.gameWon || gameState.isPlayerDead) return;
      const currentTime = Date.now();
      let playerIsCaught = false;

      const newEnemies = gameState.enemies.map(enemy => {
        if (!enemy.isAlive || !enemy.moveInterval || currentTime - enemy.lastMoveTime < enemy.moveInterval) {
          return enemy;
        }

        let desiredNextPosition = { ...enemy.position };
        const playerPos = gameState.playerPosition;

        const isPlayerInVision = Math.abs(playerPos.x - enemy.position.x) + Math.abs(playerPos.y - enemy.position.y) <= enemy.visionRange;

        if ((enemy.behavior === 'active' || enemy.behavior === 'smart_active') && isPlayerInVision) {
          if (enemy.behavior === 'active') {
            if (Math.abs(playerPos.x - enemy.position.x) > Math.abs(playerPos.y - enemy.position.y)) {
              desiredNextPosition.x += Math.sign(playerPos.x - enemy.position.x);
            } else {
              desiredNextPosition.y += Math.sign(playerPos.y - enemy.position.y);
            }
          } else if (enemy.behavior === 'smart_active') {
            const path = findPath(enemy.position, playerPos, currentLevelData.grid);
            if (path.length > 1) {
              desiredNextPosition = path[1];
            } else {
              return enemy;
            }
          }
        } else {
          return enemy;
        }

        const desiredDirection = (
          desiredNextPosition.x > enemy.position.x ? 'right' :
          desiredNextPosition.x < enemy.position.x ? 'left' :
          desiredNextPosition.y > enemy.position.y ? 'down' :
          desiredNextPosition.y < enemy.position.y ? 'up' : enemy.direction
        );

        const finalPosition = (desiredDirection === enemy.direction) ? desiredNextPosition : enemy.position;

        if (finalPosition.x === gameState.playerPosition.x && finalPosition.y === gameState.playerPosition.y) {
          playerIsCaught = true;
        }

        return {
          ...enemy,
          position: finalPosition,
          direction: desiredDirection,
          lastMoveTime: currentTime
        };
      });

      if (newEnemies.some((e, i) => e.position.x !== gameState.enemies[i].position.x || e.position.y !== gameState.enemies[i].position.y || e.direction !== gameState.enemies[i].direction) || playerIsCaught) {
        setGameState(prev => ({
          ...prev,
          enemies: newEnemies,
          isPlayerDead: prev.isPlayerDead || playerIsCaught,
        }));
      }
      if (playerIsCaught) {
      }
    }, 200);
    return () => clearInterval(gameLoop);
  }, [gameState, currentLevelData, findPath]);

  const handleLevelReset = useCallback(() => {
    setGameState(getInitialGameState(currentLevelData));
  }, [currentLevelIndex, currentLevelData, getInitialGameState]);

  useEffect(() => {
    if (!gameState.isPlayerDead) return;
    const timerId = setTimeout(() => handleLevelReset(), 1500);
    return () => clearTimeout(timerId);
  }, [gameState.isPlayerDead, handleLevelReset]);

  const handleNextLevel = useCallback(() => {
    setCurrentLevelIndex(prevIndex => {
      const nextIndex = (prevIndex < levels.length - 1) ? prevIndex + 1 : 0;
      if (nextIndex === 0 && prevIndex === levels.length - 1) {
      }
      return nextIndex;
    });
  }, []);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (gameState.gameWon) {
      timerId = setTimeout(() => handleNextLevel(), 2000);
    }
    return () => clearTimeout(timerId);
  }, [gameState.gameWon, handleNextLevel]);

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