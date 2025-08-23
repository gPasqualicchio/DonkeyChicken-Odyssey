import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

// --- CORREZIONE PER L'ANTEPRIMA ---
// L'ambiente di anteprima non può accedere ai tuoi file locali.
// Per far funzionare il codice qui, usiamo degli URL pubblici per le immagini.
// Quando userai questo codice nel tuo progetto, DECOMMENTA le righe 'import'
// e COMMENTA le costanti qui sotto per usare le tue immagini locali.

import forestBackground from '@/assets/forest-background.jpg';
import treeSprite from "@/assets/tree-sprite.png";
import playerSprite from "@/assets/donkeychicken_M.png";


// --- MODIFICA: Griglia 8x7 ---
const GRID_WIDTH = 8;
const GRID_HEIGHT = 7;
const CELL_SIZE = 48;
const GAP_SIZE = 0; // GAP between tiles
const SWIPE_THRESHOLD = 30;

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

/*  x 0 1 2 3 4 5 6 7
 * y +---------------+
 * 0 |x x x x x      |
 * 1 |x x x x x   x  |
 * 2 |x x   x     x  |
 * 3 |I       x   x E|
 * 4 |x x x         x|
 * 5 |x x   x   x x x|
 * 6 |x x       x x x|
 *   +---------------+*/
const level1Obstacles: Position[] = [
  { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
  { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },                 { x: 6, y: 1 },
  { x: 0, y: 2 }, { x: 1, y: 2 },                 { x: 3, y: 2 },                                 { x: 6, y: 2 },
                                                                  { x: 4, y: 3 },                 { x: 6, y: 3 },
  { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 },                                                 { x: 6, y: 4 }, { x: 7, y: 4 },
  { x: 0, y: 5 }, { x: 1, y: 5 },                 { x: 3, y: 5 },                 { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
  { x: 0, y: 6 }, { x: 1, y: 6 },                                                 { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 },
];

const getInitialGameState = (): GameState => ({
  playerPosition: { x: 0, y: 3 },
  startPosition: { x: 0, y: 3 },
  // --- MODIFICA: Posizione finale per griglia 8x7 ---
  endPosition: { x: 7, y: 3 },
  gameWon: false,
  moveCount: 0,
  isMoving: false,
  obstacles: level1Obstacles,
});

const GameBoard = () => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>(getInitialGameState);

  const touchStartRef = useRef<Position | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.gameWon || gameState.isMoving) return;
    setGameState(prev => {
      const newPosition = { ...prev.playerPosition };
      switch (direction) {
        case 'up': if (newPosition.y > 0) newPosition.y--; break;
        // --- MODIFICA: Limite per altezza 7 (indice max 6) ---
        case 'down': if (newPosition.y < GRID_HEIGHT - 1) newPosition.y++; break;
        case 'left': if (newPosition.x > 0) newPosition.x--; break;
        // --- MODIFICA: Limite per larghezza 8 (indice max 7) ---
        case 'right': if (newPosition.x < GRID_WIDTH - 1) newPosition.x++; break;
      }
      const hasMoved = newPosition.x !== prev.playerPosition.x || newPosition.y !== prev.playerPosition.y;
      if (!hasMoved) return prev;
      const isObstacle = prev.obstacles.some(obs => obs.x === newPosition.x && obs.y === newPosition.y);
      if (isObstacle) return prev;
      const gameWon = newPosition.x === prev.endPosition.x && newPosition.y === prev.endPosition.y;
      return { ...prev, playerPosition: newPosition, moveCount: prev.moveCount + 1, gameWon, isMoving: true };
    });
    setTimeout(() => setGameState(prev => ({ ...prev, isMoving: false })), 150);
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

  useEffect(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > SWIPE_THRESHOLD) movePlayer('right');
        if (deltaX < -SWIPE_THRESHOLD) movePlayer('left');
      } else {
        if (deltaY > SWIPE_THRESHOLD) movePlayer('down');
        if (deltaY < -SWIPE_THRESHOLD) movePlayer('up');
      }
      touchStartRef.current = null;
    };

    gameArea.addEventListener('touchstart', handleTouchStart);
    gameArea.addEventListener('touchend', handleTouchEnd);
    return () => {
      gameArea.removeEventListener('touchstart', handleTouchStart);
      gameArea.removeEventListener('touchend', handleTouchEnd);
    };
  }, [movePlayer]);

  const resetGame = () => setGameState(getInitialGameState());

  useEffect(() => {
    if (gameState.gameWon) {
      toast({ title: "🎉 Vittoria!", description: 'Livello completato in ${gameState.moveCount} mosse!' });
      setTimeout(resetGame, 2000);
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
      default: return `${baseStyles} bg-green-200/40`;
    }
  };

  return (
    <div
      ref={gameAreaRef}
      className="min-h-screen w-full flex flex-col items-center justify-center gap-6 p-4 relative"
      style={{
        backgroundImage: `url(${forestBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute top-2 left-2 bg-black/60 text-white p-2 rounded-lg text-xs font-mono z-10">
        <p>Posizione: ({gameState.playerPosition.x}, {gameState.playerPosition.y})</p>
        <p>Mosse: {gameState.moveCount}</p>
      </div>

      <div className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-lg p-2 shadow-2xl">
        <div className="relative">
          {/* --- MODIFICA: Griglia 8x7 --- */}
          <div className="grid grid-cols-8" style={{ gap: `${GAP_SIZE}px` }}>
            {Array.from({ length: GRID_WIDTH * GRID_HEIGHT }).map((_, i) => {
              const x = i % GRID_WIDTH;
              const y = Math.floor(i / GRID_WIDTH);
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
              <img src={playerSprite} alt="Personaggio DonkeyChicken" className="w-11 h-11 object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
