// GameManager.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import GameBoard from "./game/GameBoard"; // Importa il componente grafico
import { levels } from './levels';                     // Importa i dati dei livelli
import { Level, GameState } from './game';              // Importa i tipi
import { GRID_WIDTH, GRID_HEIGHT } from "@/config/Constants";

const GameManager = () => {
  const { toast } = useToast();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  // <-- NUOVO: Usiamo useRef per mantenere un riferimento all'oggetto audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLevelData = levels[currentLevelIndex];

  const getInitialGameState = (level: Level): GameState => ({
    playerPosition: level.startPosition,
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
        lastMoveTime: 0, // Inizia con il timer a zero
    })) || [],
  });

  const [gameState, setGameState] = useState<GameState>(() => getInitialGameState(currentLevelData));

  useEffect(() => {
    setGameState(getInitialGameState(currentLevelData));
  }, [currentLevelData]);

  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.gameWon || gameState.isMoving) return;

    setGameState(prev => {
        const newPosition = { ...prev.playerPosition };

        console.log("Direzione:", direction);
        switch (direction) {
          case "up":
            if (newPosition.y > 0) newPosition.y--;
            break;
          case "down":
            if (newPosition.y < GRID_HEIGHT - 1) newPosition.y++;
            break;
          case "left":
            if (newPosition.x > 0) newPosition.x--;
            break;
          case "right":
            if (newPosition.x < GRID_WIDTH - 1) newPosition.x++;
            break;
        }

        if (newPosition.x === prev.playerPosition.x && newPosition.y === prev.playerPosition.y) return prev;

        const isObstacle = currentLevelData.obstacles.some(obs => obs.x === newPosition.x && obs.y === newPosition.y);
        if (isObstacle) {
            console.log("OSTACOLO! x:", newPosition.x, ", y:", newPosition.y);
            return prev;
        }

        const isDoor = currentLevelData.doorPosition && newPosition.x === currentLevelData.doorPosition.x && newPosition.y === currentLevelData.doorPosition.y;
        if (isDoor && !prev.hasKey) {
            console.log("Porta chiusa, Trova la chiave per aprirla!");
            return prev;
        }

          const isEnemyCollision = prev.enemies.some(enemy => enemy.position.x === newPosition.x && enemy.position.y === newPosition.y);
          if (isEnemyCollision) {
              toast({ title: "☠️ Preso!", description: "Sei stato catturato.", variant: "destructive" });
              // Il giocatore ora è morto, lo stato si aggiorna e il movimento si ferma
              return { ...prev, isPlayerDead: true };
          }

      let newHasKey = prev.hasKey;
      const isKey = currentLevelData.keyPosition && newPosition.x === currentLevelData.keyPosition.x && newPosition.y === currentLevelData.keyPosition.y;
      if (isKey && !prev.hasKey) {
        newHasKey = true;
        console.log("🔑 Chiave raccolta! Ora puoi aprire la porta.");
      }

      const gameWon = newPosition.x === currentLevelData.endPosition.x && newPosition.y === currentLevelData.endPosition.y;

      return {
        ...prev,
        playerPosition: newPosition,
        moveCount: prev.moveCount + 1,
        gameWon,
        isMoving: true,
        hasKey: newHasKey,
      };
    });

    setTimeout(() => setGameState(prev => ({ ...prev, isMoving: false })), 150);
  }, [currentLevelData, gameState.gameWon, gameState.isMoving, toast]);

  // <-- MODIFICA 1: Usiamo useCallback e la forma funzionale di setState
  // Questo garantisce che la funzione sia stabile e non usi valori "vecchi" (stale) di currentLevelIndex.
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

    const canSeePlayer = (enemy: EnemyState, playerPosition: Position): boolean => {
      const { position, visionRange } = enemy;
      const obstacles = currentLevelData.obstacles;

      if (!visionRange) return false; // Se non ha raggio visivo, non vede

      // Controlla la linea di vista orizzontale
      if (position.y === playerPosition.y) {
          const distance = Math.abs(position.x - playerPosition.x);
          if (distance > visionRange) return false;

          const dir = Math.sign(playerPosition.x - position.x);
          for (let i = 1; i < distance; i++) {
              const checkX = position.x + i * dir;
              if (obstacles.some(obs => obs.x === checkX && obs.y === position.y)) {
                  return false; // C'è un ostacolo in mezzo
              }
          }
          return true; // Percorso libero
      }

      // Controlla la linea di vista verticale
      if (position.x === playerPosition.x) {
          const distance = Math.abs(position.y - playerPosition.y);
          if (distance > visionRange) return false;

          const dir = Math.sign(playerPosition.y - position.y);
          for (let i = 1; i < distance; i++) {
              const checkY = position.y + i * dir;
              if (obstacles.some(obs => obs.x === position.x && obs.y === checkY)) {
                  return false; // C'è un ostacolo in mezzo
              }
          }
          return true; // Percorso libero
      }

      return false; // Non è in linea retta
    };

  // Funzione per resettare il livello
    const handleLevelReset = useCallback(() => {
      console.log("Resetting level...");
      setGameState(getInitialGameState(currentLevelData));
    }, [currentLevelData]);

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



useEffect(() => {
    const gameLoop = setInterval(() => {
        // Non aggiornare l'IA se il giocatore ha vinto o è morto
        if (gameState.gameWon || gameState.isPlayerDead) return;

        const currentTime = Date.now();
        let playerIsCaught = false;

        const newEnemies = gameState.enemies.map(enemy => {
            // Se il nemico non ha un intervallo di movimento, non si muove
            if (!enemy.moveInterval) return enemy;

            // Controlla se è passato abbastanza tempo per la prossima mossa
            if (currentTime - enemy.lastMoveTime < enemy.moveInterval) {
                return enemy; // Non è ancora ora di muoversi
            }

            let nextPosition = { ...enemy.position };

            // Logica di movimento basata sul comportamento
            if (enemy.behavior === 'attivo' && canSeePlayer(enemy, gameState.playerPosition)) {
                // Se vede il giocatore, si muove verso di lui
                const playerPos = gameState.playerPosition;
                if (Math.abs(playerPos.x - enemy.position.x) > Math.abs(playerPos.y - enemy.position.y)) {
                    nextPosition.x += Math.sign(playerPos.x - enemy.position.x);
                } else {
                    nextPosition.y += Math.sign(playerPos.y - enemy.position.y);
                }
            }
            // Qui potresti aggiungere: else if (enemy.behavior === 'sentinella') { ... }

            // Controlla che la nuova posizione sia valida (non è un ostacolo)
            const isObstacle = currentLevelData.obstacles.some(obs => obs.x === nextPosition.x && obs.y === nextPosition.y);
            if (isObstacle) {
                nextPosition = enemy.position; // Se c'è un ostacolo, annulla la mossa
            }

            // Controlla se il nemico ha catturato il giocatore
            if (nextPosition.x === gameState.playerPosition.x && nextPosition.y === gameState.playerPosition.y) {
                playerIsCaught = true;
            }

            return { ...enemy, position: nextPosition, lastMoveTime: currentTime };
        });

        // Aggiorna lo stato del gioco
        setGameState(prev => ({
            ...prev,
            enemies: newEnemies,
            isPlayerDead: prev.isPlayerDead || playerIsCaught, // Il giocatore muore se viene catturato
        }));

        if (playerIsCaught) {
            toast({ title: "☠️ Preso!", description: "Un nemico ti ha raggiunto.", variant: "destructive" });
        }

    }, 200); // L'IA viene "pensata" ogni 200ms

    return () => clearInterval(gameLoop); // Pulisce il loop quando il componente si smonta

  }, [gameState, currentLevelData]); // L'effetto si ri-esegue se lo stato o il livello cambiano




  // <-- MODIFICA 2: Aggiungiamo una funzione di pulizia al nostro effetto
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