import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// --- CORREZIONE PER L'ANTEPRIMA ---
// L'ambiente di anteprima non può accedere ai tuoi file locali.
// Per far funzionare il codice qui, usiamo degli URL pubblici per le immagini.
// Quando userai questo codice nel tuo progetto, DECOMMENTA le righe 'import'
// e COMMENTA le costanti '...Url' per usare le tue immagini locali.

import forestBackground from '@/assets/forest-background.jpg';
import treeSprite from "@/assets/tree-sprite.png";
import playerSprite from "@/assets/donkeychicken.png";

const GRID_SIZE = 8;
const CELL_SIZE = 48;
const GAP_SIZE = 4;

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  playerPosition: Position;
  startPosition: Position;
  endPosition: Position;
  gameWon: boolean;
  moveCount: number;
  isMoving: boolean;
  obstacles: Position[];
}

// --- DEFINIZIONE DEL LIVELLO 1 ---
// Abbiamo rimosso la funzione `generateObstacles` e l'abbiamo sostituita
// con una configurazione fissa per gli ostacoli del primo livello.
const level1Obstacles: Position[] = [
  { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
  { x: 2, y: 2 }, { x: 2, y: 3 },
  { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 },
  { x: 4, y: 3 },
  { x: 4, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
  { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 },
];

const getInitialGameState = (): GameState => ({
  playerPosition: { x: 0, y: 0 },
  startPosition: { x: 0, y: 0 },
  endPosition: { x: 7, y: 7 },
  gameWon: false,
  moveCount: 0,
  isMoving: false,
  // Ora carichiamo sempre la stessa mappa di ostacoli.
  obstacles: level1Obstacles,
});

const GameBoard = () => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>(getInitialGameState);

  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.gameWon || gameState.isMoving) return;

    setGameState(prev => {
      const newPosition = { ...prev.playerPosition };
      switch (direction) {
        case 'up': if (newPosition.y > 0) newPosition.y--; break;
        case 'down': if (newPosition.y < GRID_SIZE - 1) newPosition.y++; break;
        case 'left': if (newPosition.x > 0) newPosition.x--; break;
        case 'right': if (newPosition.x < GRID_SIZE - 1) newPosition.x++; break;
      }

      const hasMoved = newPosition.x !== prev.playerPosition.x || newPosition.y !== prev.playerPosition.y;
      if (!hasMoved) return prev;

      const isObstacle = prev.obstacles.some(obs => obs.x === newPosition.x && obs.y === newPosition.y);
      if (isObstacle) return prev;

      const gameWon = newPosition.x === prev.endPosition.x && newPosition.y === prev.endPosition.y;

      return { ...prev, playerPosition: newPosition, moveCount: prev.moveCount + 1, gameWon, isMoving: true };
    });

    setTimeout(() => {
      setGameState(prev => ({ ...prev, isMoving: false }));
    }, 150);

  }, [gameState.gameWon, gameState.isMoving]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      switch (event.key) {
        case 'ArrowUp': case 'w': movePlayer('up'); break;
        case 'ArrowDown': case 's': movePlayer('down'); break;
        case 'ArrowLeft': case 'a': movePlayer('left'); break;
        case 'ArrowRight': case 'd': movePlayer('right'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  const resetGame = () => {
    setGameState(getInitialGameState);
  };

  useEffect(() => {
    if (gameState.gameWon) {
      toast({
        title: "🎉 Vittoria!",
        description: `Hai raggiunto l'uscita in ${gameState.moveCount} mosse!`,
      });
    }
  }, [gameState.gameWon, gameState.moveCount, toast]);

  const getCellType = (x: number, y: number) => {
    if (gameState.obstacles.some(obs => obs.x === x && obs.y === y)) return 'obstacle';
    if (x === gameState.startPosition.x && y === gameState.startPosition.y) return 'start';
    if (x === gameState.endPosition.x && y === gameState.endPosition.y) return 'end';
    return 'floor';
  };

  const getCellContent = (cellType: string) => {
    switch (cellType) {
      case 'obstacle': return <img src={treeSprite} alt="Albero" className="w-10 h-10 object-contain" />;
      case 'start': return 'A';
      case 'end': return 'B';
      default: return '';
    }
  };

  const getCellStyles = (cellType: string) => {
    const baseStyles = "border border-green-800/20 flex items-center justify-center text-lg font-bold transition-all duration-300";
    switch (cellType) {
      case 'obstacle': return `${baseStyles} bg-green-900/30`;
      case 'start': return `${baseStyles} bg-green-600/80 text-white shadow-lg`;
      case 'end': return `${baseStyles} bg-yellow-500/80 text-white shadow-lg`;
      default: return `${baseStyles} bg-green-200/40 hover:bg-green-300/50`;
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center gap-6 p-4"
      style={{
        backgroundImage: `url(${forestBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >

      <div className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-lg p-2 shadow-2xl">
        <div className="relative">
          <div className="grid grid-cols-8" style={{ gap: `${GAP_SIZE}px` }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const cellType = getCellType(x, y);
              return (
                <div key={`${x}-${y}`} className={getCellStyles(cellType)} style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}>
                  {getCellContent(cellType)}
                </div>
              );
            })}
          </div>
          <div
            className="absolute pointer-events-none transition-all duration-150 ease-out"
            style={{
              width: CELL_SIZE, height: CELL_SIZE,
              left: gameState.playerPosition.x * (CELL_SIZE + GAP_SIZE),
              top: gameState.playerPosition.y * (CELL_SIZE + GAP_SIZE),
              transform: gameState.isMoving ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <img src={playerSprite} alt="Personaggio DonkeyChicken" className="w-10 h-10 object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;