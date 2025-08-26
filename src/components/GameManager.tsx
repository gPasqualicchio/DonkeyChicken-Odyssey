// GameManager.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import GameBoard from "./game/GameBoard";
import { levels } from './levels';
import { Level, GameState, Position, EnemyState } from './game';
import { GRID_WIDTH, GRID_HEIGHT } from "@/config/Constants";

const GameManager = () => {
  const { toast } = useToast();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLevelData = levels[currentLevelIndex];

  // --- MODIFICATO: Ora legge la griglia per inizializzare lo stato ---
  const getInitialGameState = (level: Level): GameState => {
    let startPos: Position = { x: 0, y: 0 };
    let endPos: Position | undefined;
    let keyPos: Position | undefined;
    let doorPos: Position | undefined;

    // Legge la griglia per trovare le posizioni speciali
    level.grid.forEach((row, y) => {
        row.split('').forEach((char, x) => {
            if (char === 'P') startPos = { x, y };
            if (char === 'E') endPos = { x, y };
            if (char === 'K') keyPos = { x, y };
            if (char === 'D') doorPos = { x, y };
        });
    });

    // Aggiungiamo le posizioni trovate all'oggetto level per compatibilità
    level.startPosition = startPos;
    level.endPosition = endPos;
    level.keyPosition = keyPos;
    level.doorPosition = doorPos;

    return {
        playerPosition: startPos,
        playerDirection: 'right',
        lastMoveTime: Date.now(),
        gameWon: false,
        moveCount: 0,
        isMoving: false,
        hasKey: false,
        isPlayerDead: false,
        enemies: level.enemies?.map(e => ({
            id: e.id,
            position: e.startPosition,
            type: e.type,
            behavior: e.behavior,
            visionRange: e.visionRange,
            moveInterval: e.moveInterval,
            lastMoveTime: 0,
            direction: "left",
        })) || [],
    };
  };

  const [gameState, setGameState] = useState<GameState>(() => getInitialGameState(currentLevelData));

  useEffect(() => {
    setGameState(getInitialGameState(currentLevelData));
  }, [currentLevelIndex]); // Aggiornato per dipendere dall'indice del livello

  // --- MODIFICATO: Ora controlla le collisioni sulla griglia ---
  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {

        const timeSinceLastMove = Date.now() - gameState.lastMoveTime;
        const moveCooldown = 500; // 500ms = 0.5 secondi

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

        // Legge il carattere nella nuova posizione per determinare la collisione
        const destinationCell = currentLevelData.grid[newPosition.y][newPosition.x];

        if (destinationCell === '#') {
            console.log("OSTACOLO! (letto dalla griglia)");
            return prev;
        }

        const isDoor = destinationCell === 'D';
        if (isDoor && !prev.hasKey) {
            console.log("Porta chiusa, Trova la chiave per aprirla!");
            return prev;
        }

        const isEnemyCollision = prev.enemies.some(enemy => enemy.position.x === newPosition.x && enemy.position.y === newPosition.y);
        if (isEnemyCollision) {
            toast({ title: "☠️ Preso!", description: "Sei stato catturato.", variant: "destructive" });
            return { ...prev, isPlayerDead: true };
        }

      let newHasKey = prev.hasKey;
      const isKey = destinationCell === 'K';
      if (isKey && !prev.hasKey) {
        newHasKey = true;
        console.log("🔑 Chiave raccolta! Ora puoi aprire la porta.");
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
  }, [currentLevelData, gameState, toast]);

  // --- MODIFICATO: Ora la funzione di visione controlla gli ostacoli sulla griglia ---
  const canSeePlayer = (enemy: EnemyState, playerPosition: Position): boolean => {
    const { position, visionRange } = enemy;
    if (!visionRange) return false;

    const grid = currentLevelData.grid;

    if (position.y === playerPosition.y) {
        const distance = Math.abs(position.x - playerPosition.x);
        if (distance > visionRange) return false;
        const dir = Math.sign(playerPosition.x - position.x);
        for (let i = 1; i < distance; i++) {
            if (grid[position.y][position.x + i * dir] === '#') return false;
        }
        return true;
    }

    if (position.x === playerPosition.x) {
        const distance = Math.abs(position.y - playerPosition.y);
        if (distance > visionRange) return false;
        const dir = Math.sign(playerPosition.y - position.y);
        for (let i = 1; i < distance; i++) {
            if (grid[position.y + i * dir][position.x] === '#') return false;
        }
        return true;
    }
    return false;
  };

  const handleNextLevel = useCallback(() => {
    setCurrentLevelIndex(prevIndex => {
        if (prevIndex < levels.length - 1) {
            return prevIndex + 1;
        } else {
            toast({ title: "🎉 Gioco completato!", description: "Congratulazioni, hai finito tutti i livelli!", duration: 5000 });
            return 0; // Ricomincia dal primo livello
        }
    });
  }, [toast]); // La dipendenza è solo 'toast' che è stabile.

// Funzione per resettare il livello

const handleLevelReset = useCallback(() => {
        console.log("Resetting level...");
        setGameState(getInitialGameState(currentLevelData));
    }, [currentLevelData]);

  // useEffect del Game Loop AI (AGGIORNATO)
    useEffect(() => {
      const gameLoop = setInterval(() => {
          if (gameState.gameWon || gameState.isPlayerDead) return;

          const currentTime = Date.now();
          let playerIsCaught = false;

          const newEnemies = gameState.enemies.map(enemy => {
              // Se non è ora di muoversi, non fare nulla
              if (!enemy.moveInterval || currentTime - enemy.lastMoveTime < enemy.moveInterval) {
                  return enemy;
              }

              // --- 1. CALCOLA LA MOSSA DESIDERATA ---
              let desiredNextPosition = { ...enemy.position };
              // (Qui inseriamo la logica di movimento che avevamo prima)
              if (enemy.behavior === 'attivo' && canSeePlayer(enemy, gameState.playerPosition)) {
                  const playerPos = gameState.playerPosition;
                  if (Math.abs(playerPos.x - enemy.position.x) > Math.abs(playerPos.y - enemy.position.y)) {
                      desiredNextPosition.x += Math.sign(playerPos.x - enemy.position.x);
                  } else {
                      desiredNextPosition.y += Math.sign(playerPos.y - enemy.position.y);
                  }
              } else {
                  // Se il nemico non vede il giocatore, sta fermo e non fa nulla
                  return enemy;
              }

              // --- 2. CALCOLA LA DIREZIONE DESIDERATA ---
              let desiredDirection = enemy.direction;
              if (desiredNextPosition.x > enemy.position.x) desiredDirection = 'right';
              else if (desiredNextPosition.x < enemy.position.x) desiredDirection = 'left';
              else if (desiredNextPosition.y > enemy.position.y) desiredDirection = 'down';
              else if (desiredNextPosition.y < enemy.position.y) desiredDirection = 'up';

              // --- 3. LOGICA "GIRA O MUOVI" ---
              let finalPosition = enemy.position;
              const currentDirection = enemy.direction;

              if (desiredDirection === currentDirection) {
                  // Se già guarda nella direzione giusta, si MUOVE
                  const isObstacle = currentLevelData.grid[desiredNextPosition.y][desiredNextPosition.x] === '#';
                  if (!isObstacle) {
                      finalPosition = desiredNextPosition;
                  }
              } else {
                  // Se deve girarsi, si GIRA SOLTANTO. La posizione non cambia.
                  // Questo "consuma" il suo turno.
              }

              // Controlla se il nemico ha catturato il giocatore
              if (finalPosition.x === gameState.playerPosition.x && finalPosition.y === gameState.playerPosition.y) {
                  playerIsCaught = true;
              }

              // Ritorna lo stato aggiornato del nemico
              return {
                ...enemy,
                position: finalPosition,
                direction: desiredDirection, // La direzione si aggiorna comunque
                lastMoveTime: currentTime
              };
          });

          // Aggiorna lo stato del gioco solo se qualcosa è cambiato
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
    }, [gameState, currentLevelData, toast]);

// useEffect che gestisce il timer dopo la morte
useEffect(() => {
    // Se il giocatore non è morto, non fare nulla
    if (!gameState.isPlayerDead) return;
    // Se il giocatore è morto, avvia un timer di 1.5 secondi
    const timerId = setTimeout(() => {
        handleLevelReset();
    }, 1500); // 1500 millisecondi = 1.5 secondi

    // Funzione di pulizia: se il componente si smonta, cancella il timer
    return () => {
        clearTimeout(timerId);
    };
}, [gameState.isPlayerDead, handleLevelReset]); // Questo effetto si attiva solo quando lo stato di morte cambia


// ***************************************************
//     WIN EFFECT
// ***************************************************
useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (gameState.gameWon) {
        //toast({ title: `🎉 ${currentLevelData.name} completato!`, description: `Hai finito in ${gameState.moveCount} mosse!` });
        timerId = setTimeout(handleNextLevel, 2000);
    }

    // Questa funzione viene eseguita prima di ri-eseguire l'effetto (o quando il componente viene smontato).
    // Annulla il timer precedente, evitando che più timer si accavallino.
    return () => {
        clearTimeout(timerId);
    };

    // Le dipendenze ora includono handleNextLevel (che è stabile grazie a useCallback).
    }, [gameState.gameWon, gameState.moveCount, currentLevelData.name, handleNextLevel, toast]);

useEffect(() => {
    if (!audioRef.current) {
    // <-- MODIFICA SOLO QUESTA RIGA
        audioRef.current = new Audio('/audio/START_Adventure_Groove.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
    }

    audioRef.current.play().catch(error => {
        console.warn("La riproduzione automatica della musica è stata bloccata dal browser.", error);
    });

    return () => {
        audioRef.current?.pause();
    };
}, []);

  return (
    <GameBoard
      key={currentLevelData.id}
      level={currentLevelData}
      gameState={gameState}
      onPlayerMove={movePlayer}
    />
  );
};

export default GameManager;