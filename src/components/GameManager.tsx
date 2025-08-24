// GameManager.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import GameBoard from "./game/GameBoard";
import { levels } from "./levels";
import { useToast } from "@/hooks/use-toast";
import { Level, GameState } from "./game/types";

const GRID_WIDTH = 8;
const GRID_HEIGHT = 7;

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