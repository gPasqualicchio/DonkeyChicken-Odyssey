// GameManager.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import GameBoard from "./game/GameBoard";
import { levels } from './levels';
import { Level, GameState, Position, Direction, EnemyState } from './game';
import { GRID_WIDTH, GRID_HEIGHT } from "@/config/Constants";
// Aggiorna l'import per usare la versione corretta da gameUtils
import { getInitialGameState, findPath } from "@/utils/gameUtils";
import { GameAssets } from "@/config/Assets";

const GameManager = () => {
  const { toast } = useToast();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLevelData = levels[currentLevelIndex];

  const [pressedDirection, setPressedDirection] = useState<Direction | null>(null);

  // CORRETTO: Chiamiamo la funzione importata all'interno di useState.
  const [gameState, setGameState] = useState<GameState>(() => getInitialGameState(currentLevelData));

  // CORRETTO: La dipendenza 'getInitialGameState' è ora superflua, perché la funzione è importata.
  // Resettiamo il livello al cambio di indice.
  useEffect(() => {
    setGameState(getInitialGameState(currentLevelData));
  }, [currentLevelIndex]);

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

      const isDoor = destinationCell === 'D';
      if (isDoor && !prev.hasKey) {
        toast({ title: "Porta chiusa", description: "Trova la chiave per aprirla!" });
        return prev;
      }

      const isEnemyCollision = prev.enemies.some(enemy => enemy.position.x === newPosition.x && enemy.position.y === newPosition.y && enemy.isAlive);
      if (isEnemyCollision) {
        toast({ title: "☠️ Preso!", description: "Sei stato catturato.", variant: "destructive" });
        return { ...prev, isPlayerDead: true };
      }

      let newHasKey = prev.hasKey;
      const isKey = destinationCell === 'K';
      if (isKey && !prev.hasKey) {
        newHasKey = true;
      }

      const gameWon = destinationCell === 'E';

      return {
        ...prev,
        playerPosition: newPosition,
        playerDirection: direction,
        moveCount: prev.moveCount + 1,
        gameWon,
        isMoving: true,
        hasKey: newHasKey,
        lastMoveTime: Date.now(),
      };
    });

    setTimeout(() => setGameState(prev => ({ ...prev, isMoving: false })), 150);
  }, [currentLevelData, gameState.gameWon, gameState.isMoving, gameState.isPlayerDead, gameState.lastMoveTime, toast]);

  // EFFETTO: Movimento continuo del giocatore
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

  // EFFETTO: Gestione IA Nemici
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
        toast({ title: "☠️ Preso!", description: "Un nemico ti ha raggiunto.", variant: "destructive" });
      }
    }, 200);
    return () => clearInterval(gameLoop);
  }, [gameState, currentLevelData, toast, findPath]);

  // EFFETTO: Gestione timer morte
  const handleLevelReset = useCallback(() => {
    setGameState(getInitialGameState(currentLevelData));
  }, [currentLevelData]);

  useEffect(() => {
    if (!gameState.isPlayerDead) return;
    const timerId = setTimeout(() => handleLevelReset(), 1500);
    return () => clearTimeout(timerId);
  }, [gameState.isPlayerDead, handleLevelReset]);

  // EFFETTO: Gestione vittoria
  const handleNextLevel = useCallback(() => {
    setCurrentLevelIndex(prevIndex => (prevIndex < levels.length - 1) ? prevIndex + 1 : 0);
    toast({ title: "🎉 Gioco completato!", description: "Congratulazioni, hai finito tutti i livelli!", duration: 5000 });
  }, [toast]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (gameState.gameWon) {
      timerId = setTimeout(() => handleNextLevel(), 2000);
    }
    return () => clearTimeout(timerId);
  }, [gameState.gameWon, handleNextLevel]);

  // EFFETTO: Gestione audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/START_Adventure_Groove.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
    audioRef.current.play().catch(error => console.warn("La riproduzione automatica della musica è stata bloccata dal browser.", error));
    return () => audioRef.current?.pause();
  }, []);

  return (
    <GameBoard
      key={currentLevelData.id}
      level={currentLevelData}
      gameState={gameState}
      onDirectionChange={handleDirectionChange}
      assets={GameAssets}
    />
  );
};

export default GameManager;