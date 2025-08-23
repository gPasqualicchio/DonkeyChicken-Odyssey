import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// --- CORREZIONE PER L'ANTEPRIMA ---
// L'ambiente di anteprima non può accedere ai tuoi file locali.
// Per far funzionare il codice qui, usiamo degli URL pubblici per le immagini.
// Quando userai questo codice nel tuo progetto, DECOMMENTA le righe 'import'
// e COMMENTA le costanti '...Url' per usare le tue immagini locali.


import forestBackground from "@/assets/forest-background.jpg";
import treeSprite from "@/assets/tree-sprite.png";
import playerSprite from "@/assets/ciucopollo.png"; // Il tuo sprite!


//const forestBackground = "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop";
//const treeSprite = "https://raw.githubusercontent.com/gPasqualicchio/DonkeyChicken-Odyssey/main/src/assets/tree-sprite.png";
//const playerSprite = "https://raw.githubusercontent.com/gPasqualicchio/DonkeyChicken-Odyssey/main/src/assets/donkeychicken.png";


const GRID_SIZE = 8;
const CELL_SIZE = 48;
const GAP_SIZE = 4;

// --- TIPI DI STATO ---
type GameScreen = 'menu' | 'game';

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

// --- FUNZIONI DI GIOCO ---
const generateObstacles = (): Position[] => {
  const obstacles: Position[] = [];
  const numObstacles = 12;
  const startPos = { x: 0, y: 0 };
  const endPos = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 };

  for (let i = 0; i < numObstacles; i++) {
    let newObstacle: Position;
    let isInvalidPosition: boolean;
    do {
      newObstacle = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isInvalidPosition =
        (newObstacle.x === startPos.x && newObstacle.y === startPos.y) ||
        (newObstacle.x === endPos.x && newObstacle.y === endPos.y) ||
        obstacles.some(obs => obs.x === newObstacle.x && obs.y === newObstacle.y);
    } while (isInvalidPosition);
    obstacles.push(newObstacle);
  }
  return obstacles;
};

const getInitialGameState = (): GameState => ({
  playerPosition: { x: 0, y: 0 },
  startPosition: { x: 0, y: 0 },
  endPosition: { x: GRID_SIZE - 1, y: GRID_SIZE - 1 },
  gameWon: false,
  moveCount: 0,
  isMoving: false,
  obstacles: generateObstacles(),
});

// --- COMPONENTE GAMEBOARD ---
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
    <div className="w-full flex flex-col items-center justify-center gap-6 p-4">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Forest Adventure Quest</h1>
        <p className="text-green-200">Navigate through the forest from A to B • Moves: {gameState.moveCount}</p>
      </div>

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

      <div className="grid grid-cols-3 gap-2 max-w-xs w-full sm:w-auto">
        <div></div>
        <Button onClick={() => movePlayer('up')} disabled={gameState.gameWon || gameState.isMoving} className="bg-green-600/80 hover:bg-green-500/80 text-white shadow-lg border-green-400/50">↑</Button>
        <div></div>
        <Button onClick={() => movePlayer('left')} disabled={gameState.gameWon || gameState.isMoving} className="bg-green-600/80 hover:bg-green-500/80 text-white shadow-lg border-green-400/50">←</Button>
        <Button onClick={resetGame} className="bg-amber-600/80 hover:bg-amber-500/80 text-white text-xs shadow-lg border-amber-400/50">Reset</Button>
        <Button onClick={() => movePlayer('right')} disabled={gameState.gameWon || gameState.isMoving} className="bg-green-600/80 hover:bg-green-500/80 text-white shadow-lg border-green-400/50">→</Button>
        <div></div>
        <Button onClick={() => movePlayer('down')} disabled={gameState.gameWon || gameState.isMoving} className="bg-green-600/80 hover:bg-green-500/80 text-white shadow-lg border-green-400/50">↓</Button>
        <div></div>
      </div>

      {gameState.gameWon && (
        <div className="text-center p-6 bg-black/60 backdrop-blur-sm border border-yellow-500/50 rounded-lg mt-4">
          <h2 className="text-3xl font-bold text-yellow-300 mb-2">🎉 Foresta Conquistata!</h2>
          <p className="text-green-200 mb-3">Hai completato il percorso in {gameState.moveCount} mosse!</p>
          <Button onClick={resetGame} className="bg-yellow-600/80 hover:bg-yellow-500/80 text-white shadow-lg border-yellow-400/50">Nuova Avventura</Button>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE MENU PRINCIPALE ---
const MainMenu = ({ onStartNewGame }: { onStartNewGame: () => void }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-4 text-white">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 text-center">
        <h1 className="text-6xl font-bold mb-4">Forest Adventure Quest</h1>
        <p className="text-xl text-green-200">Un'avventura in una foresta misteriosa</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button onClick={onStartNewGame} className="text-lg py-6 bg-green-600/80 hover:bg-green-500/80 shadow-lg border-green-400/50">
          Nuova Partita
        </Button>
        <Button disabled className="text-lg py-6">
          Continua Partita
        </Button>
        <Button disabled className="text-lg py-6">
          Opzioni
        </Button>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPALE APP ---
const App = () => {
  const [screen, setScreen] = useState<GameScreen>('menu');

  const startGame = () => {
    setScreen('game');
  };

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center"
      style={{ backgroundImage: `url(${forestBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {screen === 'menu' && <MainMenu onStartNewGame={startGame} />}
      {screen === 'game' && <GameBoard />}
    </main>
  );
};

export default App;
