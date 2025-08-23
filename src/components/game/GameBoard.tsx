import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
}

const GRID_SIZE = 8;

const GameBoard = () => {
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>({
    playerPosition: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    endPosition: { x: 7, y: 7 },
    gameWon: false,
    moveCount: 0
  });

  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.gameWon) return;

    setGameState(prev => {
      const newPosition = { ...prev.playerPosition };
      
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

      const newMoveCount = prev.moveCount + 1;
      const gameWon = newPosition.x === prev.endPosition.x && newPosition.y === prev.endPosition.y;
      
      return {
        ...prev,
        playerPosition: newPosition,
        moveCount: newMoveCount,
        gameWon
      };
    });
  };

  const resetGame = () => {
    setGameState({
      playerPosition: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
      endPosition: { x: 7, y: 7 },
      gameWon: false,
      moveCount: 0
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
    if (x === gameState.playerPosition.x && y === gameState.playerPosition.y) {
      return 'player';
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
      case 'player':
        return '🏃';
      case 'start':
        return 'A';
      case 'end':
        return 'B';
      default:
        return '';
    }
  };

  const getCellStyles = (cellType: string) => {
    const baseStyles = "w-12 h-12 border border-border flex items-center justify-center text-lg font-bold transition-all duration-200";
    
    switch (cellType) {
      case 'player':
        return `${baseStyles} bg-game-player shadow-button animate-pulse`;
      case 'start':
        return `${baseStyles} bg-game-start text-primary-foreground`;
      case 'end':
        return `${baseStyles} bg-game-end text-destructive-foreground`;
      default:
        return `${baseStyles} bg-game-floor hover:bg-game-path`;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-game bg-clip-text text-transparent mb-2">
          Adventure Quest
        </h1>
        <p className="text-muted-foreground">
          Move from A to B • Moves: {gameState.moveCount}
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 shadow-game">
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
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-xs">
        <div></div>
        <Button
          onClick={() => movePlayer('up')}
          disabled={gameState.gameWon}
          className="bg-gradient-button shadow-button"
        >
          ↑
        </Button>
        <div></div>
        
        <Button
          onClick={() => movePlayer('left')}
          disabled={gameState.gameWon}
          className="bg-gradient-button shadow-button"
        >
          ←
        </Button>
        
        <Button
          onClick={resetGame}
          variant="secondary"
          className="text-xs"
        >
          Reset
        </Button>
        
        <Button
          onClick={() => movePlayer('right')}
          disabled={gameState.gameWon}
          className="bg-gradient-button shadow-button"
        >
          →
        </Button>
        
        <div></div>
        <Button
          onClick={() => movePlayer('down')}
          disabled={gameState.gameWon}
          className="bg-gradient-button shadow-button"
        >
          ↓
        </Button>
        <div></div>
      </div>

      {gameState.gameWon && (
        <div className="text-center p-4 bg-card border border-primary rounded-lg">
          <h2 className="text-2xl font-bold text-primary mb-2">🎉 Well Done!</h2>
          <p className="text-muted-foreground mb-3">
            You completed the adventure in {gameState.moveCount} moves!
          </p>
          <Button 
            onClick={resetGame}
            className="bg-gradient-button shadow-button"
          >
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameBoard;