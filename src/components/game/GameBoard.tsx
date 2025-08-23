import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import forestBackground from "@/assets/forest-background.jpg";
import treeSprite from "@/assets/tree-sprite.png";
import donkeyChickenSprite from "@/assets/ciucopollo.png"

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  playerPosition: Position;
  visualPosition: Position;
  startPosition: Position;
  endPosition: Position;
  gameWon: boolean;
  moveCount: number;
  isMoving: boolean;
  obstacles: Position[];
}

const GRID_SIZE = 8;
const CELL_SIZE = 48; // 12 * 4 (w-12 = 3rem = 48px)

const GameBoard = () => {
  const { toast } = useToast();

  // Generate random obstacles (trees)
  const generateObstacles = () => {
    const obstacles: Position[] = [];
    const numObstacles = 12;

    for (let i = 0; i < numObstacles; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
      } while (
        (x === 0 && y === 0) || // Start position
        (x === 7 && y === 7) || // End position
        obstacles.some(obs => obs.x === x && obs.y === y) // Already occupied
      );
      obstacles.push({ x, y });
    }
    return obstacles;
  };

  const [gameState, setGameState] = useState<GameState>({
    playerPosition: { x: 0, y: 0 },
    visualPosition: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    endPosition: { x: 7, y: 7 },
    gameWon: false,
    moveCount: 0,
    isMoving: false,
    obstacles: generateObstacles()
  });

  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.gameWon || gameState.isMoving) return;

    const newPosition = { ...gameState.playerPosition };

    switch (direction) {
      case 'up':
        if (newPosition.y > 0) newPosition.y--;
        break;
      case 'down':
        if (newPosition.y < GRID_SIZE - 1) newPosition.y++;
        break;
      case 'left':
        if (newPosition.x > 0) newPosition.x--;
        break;
      case 'right':
        if (newPosition.x < GRID_SIZE - 1) newPosition.x++;
        break;
    }

    // Check if position changed and if it's not an obstacle
    if (newPosition.x === gameState.playerPosition.x && newPosition.y === gameState.playerPosition.y) {
      return;
    }

    // Check for obstacles (trees)
    const isObstacle = gameState.obstacles.some(obs => obs.x === newPosition.x && obs.y === newPosition.y);
    if (isObstacle) {
      return;
    }

    // Start movement
    setGameState(prev => ({
      ...prev,
      isMoving: true
    }));

    // Animate to new position
    setTimeout(() => {
      setGameState(prev => {
        const gameWon = newPosition.x === prev.endPosition.x && newPosition.y === prev.endPosition.y;

        return {
          ...prev,
          playerPosition: newPosition,
          visualPosition: newPosition,
          moveCount: prev.moveCount + 1,
          gameWon,
          isMoving: false
        };
      });
    }, 300);
  };

  const resetGame = () => {
    setGameState({
      playerPosition: { x: 0, y: 0 },
      visualPosition: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
      endPosition: { x: 7, y: 7 },
      gameWon: false,
      moveCount: 0,
      isMoving: false,
      obstacles: generateObstacles()
    });
  };

  useEffect(() => {
    if (gameState.gameWon) {
      toast({
        title: "🎉 Victory!",
        description: `You reached the end in ${gameState.moveCount} moves!`,
      });
    }
  }, [gameState.gameWon, gameState.moveCount, toast]);

  const getCellType = (x: number, y: number) => {
    if (gameState.obstacles.some(obs => obs.x === x && obs.y === y)) {
      return 'obstacle';
    }
    if (x === gameState.startPosition.x && y === gameState.startPosition.y) {
      return 'start';
    }
    if (x === gameState.endPosition.x && y === gameState.endPosition.y) {
      return 'end';
    }
    return 'floor';
  };

  const getCellContent = (cellType: string) => {
    switch (cellType) {
      case 'obstacle':
        return (
          <img 
            src={treeSprite} 
            alt="Tree" 
            className="w-10 h-10 object-contain"
          />
        );
      case 'start':
        return 'A';
      case 'end':
        return 'B';
      default:
        return '';
    }
  };

  const getCellStyles = (cellType: string) => {
    const baseStyles = "w-12 h-12 border border-green-800/20 flex items-center justify-center text-lg font-bold transition-all duration-300";

    switch (cellType) {
      case 'obstacle':
        return `${baseStyles} bg-green-900/30`;
      case 'start':
        return `${baseStyles} bg-green-600/80 text-white shadow-lg`;
      case 'end':
        return `${baseStyles} bg-yellow-500/80 text-white shadow-lg`;
      default:
        return `${baseStyles} bg-green-200/40 hover:bg-green-300/50`;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center gap-6 p-4"
      style={{
        backgroundImage: `url(${forestBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Forest Adventure Quest
        </h1>
        <p className="text-green-200">
          Navigate through the forest from A to B • Moves: {gameState.moveCount}
        </p>
      </div>

      <div className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-lg p-4 shadow-2xl">
        <div className="relative">
          <div className="grid grid-cols-8 gap-1 mb-4">
            {Array.from({ length: GRID_SIZE }, (_, y) =>
              Array.from({ length: GRID_SIZE }, (_, x) => {
                const cellType = getCellType(x, y);
                return (
                  <div
                    key={`${x}-${y}`}
                    className={getCellStyles(cellType)}
                  >
                    {getCellContent(cellType)}
                  </div>
                );
              })
            )}
          </div>

          {/* Smoothly moving character */}
          <div
            className="absolute pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: gameState.visualPosition.x * (CELL_SIZE + 4) + 8, // +4 for gap, +8 for padding
              top: gameState.visualPosition.y * (CELL_SIZE + 4) + 8,
              width: CELL_SIZE,
              height: CELL_SIZE,
              transform: gameState.isMoving ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <img
                src="/lovable-uploads/ce1fbcb4-9bce-4c25-b0af-f1f5e1f41cfd.png"
                alt="Llama Character"
                className="w-10 h-10 object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-xs">
        <div></div>
        <Button
          onClick={() => movePlayer('up')}
          disabled={gameState.gameWon || gameState.isMoving}
          className="bg-green-600/80 hover:bg-green-500/80 text-white shadow-lg border-green-400/50"
        >
          ↑
        </Button>
        <div></div>

        <Button
          onClick={() => movePlayer('left')}
          disabled={gameState.gameWon || gameState.isMoving}
          className="bg-green-600/80 hover:bg-green-500/80 text-white shadow-lg border-green-400/50"
        >
          ←
        </Button>

        <Button
          onClick={resetGame}
          className="bg-amber-600/80 hover:bg-amber-500/80 text-white text-xs shadow-lg border-amber-400/50"
        >
          Reset
        </Button>

        <Button
          onClick={() => movePlayer('right')}
          disabled={gameState.gameWon || gameState.isMoving}
          className="bg-green-600/80 hover:bg-green-500/80 text-white shadow-lg border-green-400/50"
        >
          →
        </Button>

        <div></div>
        <Button
          onClick={() => movePlayer('down')}
          disabled={gameState.gameWon || gameState.isMoving}
          className="bg-green-600/80 hover:bg-green-500/80 text-white shadow-lg border-green-400/50"
        >
          ↓
        </Button>
        <div></div>
      </div>

      {gameState.gameWon && (
        <div className="text-center p-6 bg-black/60 backdrop-blur-sm border border-yellow-500/50 rounded-lg">
          <h2 className="text-3xl font-bold text-yellow-300 mb-2">🎉 Forest Conquered!</h2>
          <p className="text-green-200 mb-3">
            You navigated through the forest in {gameState.moveCount} moves!
          </p>
          <Button
            onClick={resetGame}
            className="bg-yellow-600/80 hover:bg-yellow-500/80 text-white shadow-lg border-yellow-400/50"
          >
            New Adventure
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameBoard;