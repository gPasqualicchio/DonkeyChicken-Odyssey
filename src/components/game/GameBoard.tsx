// GameBoard.tsx

import { useEffect, useRef } from "react";
import { Level, Position, GameState, Direction } from '../../game';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, GAP_SIZE, SWIPE_THRESHOLD } from "@/config/Constants";
import { GameAssets } from "@/config/Assets";

import GameCharacters from "./GameCharacters";
import GameObjects from "./GameObjects";

type SpriteCatalog = typeof GameAssets;

interface GameBoardProps {
  level: Level;
  gameState: GameState;
  onDirectionChange: (direction: Direction | null) => void;
  assets: SpriteCatalog;
}

const GameBoard = ({ level, gameState, onDirectionChange, assets }: GameBoardProps) => {
  const touchStartRef = useRef<Position | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      let direction: Direction | null = null;
      switch (event.key) {
        case 'ArrowUp': case 'w': direction = 'up'; break;
        case 'ArrowDown': case 's': direction = 'down'; break;
        case 'ArrowLeft': case 'a': direction = 'left'; break;
        case 'ArrowRight': case 'd': direction = 'right'; break;
      }
      onDirectionChange(direction);
    };

    const handleKeyUp = () => {
      onDirectionChange(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onDirectionChange]);

  useEffect(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;

      let direction: Direction | null = null;
      if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }
      }
      onDirectionChange(direction);
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
      onDirectionChange(null);
    };

    gameArea.addEventListener('touchstart', handleTouchStart);
    gameArea.addEventListener('touchmove', handleTouchMove);
    gameArea.addEventListener('touchend', handleTouchEnd);
    gameArea.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      gameArea.removeEventListener('touchstart', handleTouchStart);
      gameArea.removeEventListener('touchmove', handleTouchMove);
      gameArea.removeEventListener('touchend', handleTouchEnd);
      gameArea.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onDirectionChange]);

  const isWalkable = (x: number, y: number) => {
    if (y < 0 || y >= GRID_HEIGHT || x < 0 || x >= GRID_WIDTH) return false;
    const cellChar = level.grid[y][x];
    if (cellChar === '#') return false;
    const doorAtPosition = level.doors.find(d => d.position.x === x && d.position.y === y);
    if (doorAtPosition && !gameState.isDoorUnlocked.includes(doorAtPosition.id)) return false;
    return true;
  };

  const getPathSprite = (x: number, y: number) => {
    const isWalkableForPath = (x: number, y: number) => {
      if (y < 0 || y >= GRID_HEIGHT || x < 0 || x >= GRID_WIDTH) return false;
      const cellChar = level.grid[y][x];
      if (cellChar === '#') return false;
      return true;
    };
    const hasPathAbove = isWalkableForPath(x, y - 1);
    const hasPathBelow = isWalkableForPath(x, y + 1);
    const hasPathLeft = isWalkableForPath(x - 1, y);
    const hasPathRight = isWalkableForPath(x + 1, y);
    if (!hasPathAbove && !hasPathRight && hasPathBelow && hasPathLeft) {
        return assets.tiles.path.curve1;
    } else if (hasPathAbove && hasPathRight && !hasPathBelow && !hasPathLeft) {
        return assets.tiles.path.curve3;
    } else if (hasPathAbove && !hasPathRight && !hasPathBelow && hasPathLeft) {
        return assets.tiles.path.curve2;
    } else if (!hasPathAbove && hasPathRight && hasPathBelow && !hasPathLeft) {
        return assets.tiles.path.curve4;
    } else if (!hasPathAbove && !hasPathRight && !hasPathBelow && hasPathLeft) {
        return assets.tiles.path.close1;
    } else if (hasPathAbove && !hasPathRight && !hasPathBelow && !hasPathLeft) {
        return assets.tiles.path.close2;
    } else if (!hasPathAbove && hasPathRight && !hasPathBelow && !hasPathLeft) {
        return assets.tiles.path.close3;
    } else if (!hasPathAbove && !hasPathRight && hasPathBelow && !hasPathLeft) {
        return assets.tiles.path.close4;
    } else if (hasPathAbove && hasPathRight && !hasPathBelow && hasPathLeft) {
        return assets.tiles.path.t1;
    } else if (hasPathAbove && hasPathRight && hasPathBelow && !hasPathLeft) {
        return assets.tiles.path.t2;
    } else if (!hasPathAbove && hasPathRight && hasPathBelow && hasPathLeft) {
        return assets.tiles.path.t3;
    } else if (hasPathAbove && !hasPathRight && hasPathBelow && hasPathLeft) {
        return assets.tiles.path.t4;
    } else if (hasPathAbove && hasPathRight && hasPathBelow && hasPathLeft) {
        return assets.tiles.path.cross;
    } else if (hasPathAbove || hasPathBelow) {
      return assets.tiles.path.vertical;
    } else if (hasPathLeft || hasPathRight) {
      return assets.tiles.path.horizontal;
    }
    return assets.tiles.path.horizontal;
  };

  const getCellType = (x: number, y: number) => {
    const char = level.grid[y][x];
    const keyAtPosition = level.keys.find(k => k.position.x === x && k.position.y === y);
    const doorAtPosition = level.doors.find(d => d.position.x === x && d.position.y === y);
    const enemyAtPosition = level.enemies.find(e => e.startPosition.x === x && e.startPosition.y === y);
    const totemAtPosition = level.spittingTotems?.find(t => t.position.x === x && t.position.y === y);
    const playerAtPosition = level.startPosition && level.startPosition.x === x && level.startPosition.y === y;

    if (keyAtPosition && !gameState.hasKeyCollected.includes(keyAtPosition.id) && !gameState.isDoorUnlocked.includes(keyAtPosition.id)) return 'key';
    if (doorAtPosition && !gameState.isDoorUnlocked.includes(doorAtPosition.id)) return 'door';
    if (enemyAtPosition) return 'enemy';
    if (totemAtPosition) return 'totem';
    if (playerAtPosition) return 'start';
    if (level.grid[y][x] === '#') return 'obstacle';
    if (level.grid[y][x] === 'E') return 'end';
    if (level.grid[y][x] === '-') return 'empty';

    return 'floor';
  };

  const getCellContent = (cellType: string, x: number, y: number) => {
    switch (cellType) {
      case 'obstacle': return <img src={assets.tiles.obstacle} alt="Albero" className="w-full h-full object-contain" />;
      case 'key':
        const keyAtPosition = level.keys.find(k => k.position.x === x && k.position.y === y);
        if (keyAtPosition && !gameState.hasKeyCollected.includes(keyAtPosition.id) && !gameState.isDoorUnlocked.includes(keyAtPosition.id)) {
          return <img src={assets.tiles.key} alt="Chiave" className="w-full h-full object-contain" />;
        }
        return null;
      case 'door':
        const doorAtPosition = level.doors.find(d => d.position.x === x && d.position.y === y);
        if (doorAtPosition && !gameState.isDoorUnlocked.includes(doorAtPosition.id)) {
          return <img src={assets.tiles.portal} alt="Porta Chiusa" className="w-full h-full object-contain" />;
        }
        return null;
      case 'enemy':
        const enemyAtPosition = level.enemies.find(e => e.startPosition.x === x && e.startPosition.y === y);
        if (enemyAtPosition) {
          return null;
        }
        return null;
      case 'totem':
        const totemAtPosition = level.spittingTotems?.find(t => t.position.x === x && t.position.y === y);
        if (totemAtPosition) {
            return null;
        }
        return null;
      case 'empty': return null;
      default: return null;
    }
  };

  const getCellStyles = (cellType: string, x: number, y: number) => {
    const baseStyles = "flex items-center justify-center text-2xl font-bold transition-all duration-300";
    switch (cellType) {
      case 'obstacle': return `${baseStyles} bg-transparent`;
      case 'start': return `${baseStyles} bg-transparent`;
      case 'end': return `${baseStyles} bg-transparent`;
      case 'key': return `${baseStyles} bg-transparent`;
      case 'door':
        const doorAtPosition = level.doors.find(d => d.position.x === x && d.position.y === y);
        if (doorAtPosition && gameState.isDoorUnlocked.includes(doorAtPosition.id)) {
          return `${baseStyles} bg-transparent`;
        }
        return `${baseStyles} bg-amber-900/80`;
      case 'empty': return `${baseStyles} bg-transparent`;
      default: return `${baseStyles} bg-transparent`;
    }
  };

  return (
    <div
      ref={gameAreaRef}
      className="min-h-screen w-full flex flex-col items-center justify-center gap-6 p-4 relative"
      style={{ backgroundImage: `url(${assets.background.forest})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute top-2 left-2 bg-black/60 text-white p-2 rounded-lg text-xs font-mono z-10">
        <p>Livello: {level.name}</p>
        <p>Posizione: ({gameState.playerPosition.x}, {gameState.playerPosition.y})</p>
        <p>Mosse: {gameState.moveCount}</p>
        <p>Chiavi: {gameState.hasKeyCollected.length}</p>
        <p>Porte aperte: {gameState.isDoorUnlocked.length}</p>
      </div>

      <div className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-lg p-2 shadow-2xl">
        <div className="relative">
          <div className="grid grid-cols-10" style={{ gap: `${GAP_SIZE}px` }}>
            {Array.from({ length: GRID_WIDTH * GRID_HEIGHT }).map((_, i) => {
              const x = i % GRID_WIDTH;
              const y = Math.floor(i / GRID_WIDTH);
              const cellType = getCellType(x, y);

              return (
                <div
                  key={`${x}-${y}`}
                  className={getCellStyles(cellType, x, y)}
                  style={{
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                    position: 'relative'
                  }}
                >
                  {cellType !== 'obstacle' && cellType !== 'empty' && (
                    <img
                      src={getPathSprite(x, y)}
                      alt="Percorso"
                      className="absolute w-full h-full object-cover"
                    />
                  )}

                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {getCellContent(cellType, x, y)}
                  </div>
                </div>
              );
            })}
          </div>

          <GameCharacters gameState={gameState} assets={assets} />
          <GameObjects level={level} gameState={gameState} assets={assets} />

        </div>
      </div>

{(() => {
    // 1. Filtra le chiavi da mostrare nell'inventario
    const keysToShowInInventory = gameState.hasKeyCollected.filter(
      keyId => !gameState.isDoorUnlocked.includes(keyId)
    );

    // 2. Mostra l'inventario solo se ci sono chiavi attive da visualizzare
    if (keysToShowInInventory.length === 0) {
      return null;
    }

    return (
      <div className="absolute bottom-4 left-4 p-2 bg-black/60 rounded-lg z-30 flex items-center gap-2">
        {keysToShowInInventory.map(keyId => (
          <img key={keyId} src={assets.tiles.key} alt={`Chiave ${keyId}`} className="w-10 h-10 object-contain" />
        ))}
      </div>
    );
})()}
    </div>
  );
};

export default GameBoard;