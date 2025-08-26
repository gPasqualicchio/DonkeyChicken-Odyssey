// GameBoard.tsx

import { useEffect, useRef } from "react";
import { Level, Position, GameState, Direction } from '../../game';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, GAP_SIZE, SWIPE_THRESHOLD } from "@/config/Constants";
import { GameAssets } from "@/config/Assets"; // Importiamo il catalogo

// Tipi per la nuova prop
type SpriteCatalog = typeof GameAssets;

interface GameBoardProps {
  level: Level;
  gameState: GameState;
  onDirectionChange: (direction: Direction | null) => void;
  assets: SpriteCatalog; // <-- NUOVA PROP: riceve il catalogo
}

const GameBoard = ({ level, gameState, onDirectionChange, assets }: GameBoardProps) => {
  const touchStartRef = useRef<Position | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Gestione Input
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

// Funzioni di rendering aggiornate per usare la prop `assets`
  const isWalkable = (x: number, y: number) => {
    if (y < 0 || y >= GRID_HEIGHT || x < 0 || x >= GRID_WIDTH) return false;
    return level.grid[y][x] !== '#';
  };

  const getPathSprite = (x: number, y: number) => {
      // Per prima cosa, controlliamo lo stato dei 4 vicini
      const hasPathAbove = isWalkable(x, y - 1);
      const hasPathBelow = isWalkable(x, y + 1);
      const hasPathLeft = isWalkable(x - 1, y);
      const hasPathRight = isWalkable(x + 1, y);

      // --- LOGICA PER LE CURVE ---
      // Curva Sud-Ovest (collega Sopra e Destra)
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

      // Default se la casella è isolata
      return assets.tiles.path.horizontal;
    };

  const getCellType = (x: number, y: number) => {
    const char = level.grid[y][x];
    switch (char) {
      case '#': return 'obstacle';
      case 'P': return 'start';
      case 'E': return 'end';
      case 'K': return gameState.hasKey ? 'floor' : 'key';
      case 'D': return 'door';
      default: return 'floor';
    }
  };

  const getCellContent = (cellType: string) => {
    switch (cellType) {
      // Usa il catalogo per gli sprite
      case 'obstacle': return <img src={assets.tiles.obstacle} alt="Albero" className="w-10 h-10 object-contain" />;
      case 'key': return <img src={assets.tiles.key} alt="Chiave" className="w-10 h-10 object-contain" />;
      case 'door': return <img src={assets.tiles.portal} alt="Porta" className="w-10 h-10 object-contain" />;
      default: return null;
    }
  };

  const getCellStyles = (cellType: string) => {
    const baseStyles = "border border-green-800/20 flex items-center justify-center text-2xl font-bold transition-all duration-300";
    switch (cellType) {
      case 'obstacle': return `${baseStyles} bg-green-900/30`;
      case 'start': return `${baseStyles} bg-transparent`; // Reso trasparente per vedere il percorso sotto
      case 'end': return `${baseStyles} bg-transparent`;   // Reso trasparente per vedere il percorso sotto
      case 'key': return `${baseStyles} bg-transparent`;
      case 'door':
        return gameState.hasKey
          ? `${baseStyles} bg-amber-800/30 opacity-50`
          : `${baseStyles} bg-amber-900/80`;
      default: return `${baseStyles} bg-transparent`; // Reso trasparente per vedere il percorso sotto
    }
  };

return (
    <div
      ref={gameAreaRef}
      className="min-h-screen w-full flex flex-col items-center justify-center gap-6 p-4 relative"
      // Usa il catalogo per lo sfondo
      style={{ backgroundImage: `url(${assets.background.forest})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute top-2 left-2 bg-black/60 text-white p-2 rounded-lg text-xs font-mono z-10">
        <p>Livello: {level.name}</p>
        <p>Posizione: ({gameState.playerPosition.x}, {gameState.playerPosition.y})</p>
        <p>Mosse: {gameState.moveCount}</p>
        {level.keyPosition && <p>Chiave: {gameState.hasKey ? 'Sì ✅' : 'No ❌'}</p>}
      </div>

      <div className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-lg p-2 shadow-2xl">
        <div className="relative">
{/* GRIGLIA DISEGNATA CON I LIVELLI SEPARATI */}
          <div className="grid grid-cols-10" style={{ gap: `${GAP_SIZE}px` }}>
            {Array.from({ length: GRID_WIDTH * GRID_HEIGHT }).map((_, i) => {
              const x = i % GRID_WIDTH;
              const y = Math.floor(i / GRID_WIDTH);
              const cellType = getCellType(x, y);

              return (
                <div
                  key={`${x}-${y}`}
                  className={getCellStyles(cellType)}
                  style={{
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                    position: 'relative'
                  }}
                >
                  {/* CONDIZIONE: Disegna il percorso solo se NON è un ostacolo */}
                  {cellType !== 'obstacle' && (
                    <img
                      src={getPathSprite(x, y)}
                      alt="Percorso"
                      className="absolute w-full h-full object-cover"
                    />
                  )}

                  {/* Disegna gli OGGETTI (albero, chiave, etc.) sopra a tutto */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {getCellContent(cellType)}
                  </div>
                </div>
              );
            })}
          </div>

{/* GIOCATORE */}
          <div
            className="absolute pointer-events-none transition-all duration-150 ease-out z-20"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: gameState.playerPosition.x * (CELL_SIZE + GAP_SIZE),
              top: gameState.playerPosition.y * (CELL_SIZE + GAP_SIZE),
              transform: gameState.isMoving ? 'scale(1.1)' : 'scale(1)',
              opacity: gameState.gameWon ? 0 : 1,
            }}
          >
                    <div className="w-full h-full flex items-center justify-center">
                      {gameState.isPlayerDead ? (
                        <span className="text-4xl font-black text-red-600 drop-shadow-lg">X</span>
                      ) : (
                        <img
                          // Usa il catalogo per lo sprite del giocatore
                          src={assets.player[gameState.playerDirection]}
                          alt="Personaggio"
                          className="w-11 h-11 object-contain drop-shadow-lg"
                        />
                      )}
                    </div>
          </div>

      {/* NEMICI */}
            {gameState.enemies.map(enemy => {
              // Se il nemico non è vivo, non disegnarlo
              if (!enemy.isAlive) {
                return null;
              }

              let currentEnemySprite;

              // Questo switch sceglie lo sprite giusto in base a TIPO e DIREZIONE
              switch (enemy.type) {
                  case 'bruco':
                      switch (enemy.direction) {
                          case 'up': currentEnemySprite = assets.enemies.bruco.up; break;
                          case 'down': currentEnemySprite = assets.enemies.bruco.down; break;
                          case 'left': currentEnemySprite = assets.enemies.bruco.left; break;
                          case 'right': currentEnemySprite = assets.enemies.bruco.right; break;
                          default: currentEnemySprite = assets.enemies.bruco.down; break;
                      }
                      break;
                  // Qui andranno gli altri nemici
                  default:
                      currentEnemySprite = assets.enemies.bruco.down;
                      break;
              }

              // AGGIORNATO: Questo è il blocco corretto per posizionare il nemico
              return (
                <div
                  key={enemy.id}
                  className="absolute pointer-events-none transition-all duration-150 ease-out z-10"
                  // UTILIZZIAMO LE COORDINATE DEL NEMICO per posizionare lo sprite
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    left: enemy.position.x * (CELL_SIZE + GAP_SIZE),
                    top: enemy.position.y * (CELL_SIZE + GAP_SIZE),
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={currentEnemySprite}
                      alt={`Nemico ${enemy.type}`}
                      className="w-10 h-10 object-contain drop-shadow-md"
                    />
                  </div>
                </div>
              );
            })}

        </div>
      </div>
    </div>
  );
};

export default GameBoard;