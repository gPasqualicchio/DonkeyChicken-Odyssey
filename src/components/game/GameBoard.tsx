// GameBoard.tsx

import { useEffect, useRef } from "react";
import { Level, Position, GameState } from '../../game';

// URL delle immagini e costanti di gioco
import forestBackground from '@/assets/forest-background.jpg';
import treeSprite from "@/assets/tree-sprite.png";
import keySprite from "@/assets/key_gold_SIMPLE.png";
import portalSprite from "@/assets/portal_forest_1.png";
import playerSprite from "@/assets/donkeychicken_M.png";
import brucoSpriteDown from "@/assets/ENEMY_bruco_down.png"; // Rinominiamo l'esistente
import brucoSpriteUp from "@/assets/ENEMY_bruco_up.png";
import brucoSpriteLeft from "@/assets/ENEMY_bruco_left.png";
import brucoSpriteRight from "@/assets/ENEMY_bruco_right.png";
import pathHorizontalSprite from "@/assets/Forest_Path_Horizontal.png";
import pathVerticalSprite from "@/assets/Forest_Path_Vertical.png";
import pathCurve1Sprite from "@/assets/Forest_Path_Curve_1.png";
import pathCurve2Sprite from "@/assets/Forest_Path_Curve_2.png";
import pathCurve3Sprite from "@/assets/Forest_Path_Curve_3.png";
import pathCurve4Sprite from "@/assets/Forest_Path_Curve_4.png";
import pathClose1Sprite from "@/assets/Forest_Path_Close_1.png";
import pathClose2Sprite from "@/assets/Forest_Path_Close_2.png";
import pathClose3Sprite from "@/assets/Forest_Path_Close_3.png";
import pathClose4Sprite from "@/assets/Forest_Path_Close_4.png";
import pathT1Sprite from "@/assets/Forest_Path_T_1.png";
import pathT2Sprite from "@/assets/Forest_Path_T_2.png";
import pathT3Sprite from "@/assets/Forest_Path_T_3.png";
import pathT4Sprite from "@/assets/Forest_Path_T_4.png";
import pathCrossSprite from "@/assets/Forest_Path_Cross.png";

// Import delle costanti globali
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, GAP_SIZE, SWIPE_THRESHOLD } from "@/config/Constants";

interface GameBoardProps {
  level: Level;
  gameState: GameState;
  onPlayerMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

const GameBoard = ({ level, gameState, onPlayerMove }: GameBoardProps) => {
  const touchStartRef = useRef<Position | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Gestione Input (invariato)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      switch (event.key) {
        case 'ArrowUp': case 'w': onPlayerMove('up'); break;
        case 'ArrowDown': case 's': onPlayerMove('down'); break;
        case 'ArrowLeft': case 'a': onPlayerMove('left'); break;
        case 'ArrowRight': case 'd': onPlayerMove('right'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayerMove]);

  useEffect(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;
    const handleTouchStart = (e: TouchEvent) => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > SWIPE_THRESHOLD) onPlayerMove('right');
        if (deltaX < -SWIPE_THRESHOLD) onPlayerMove('left');
      } else {
        if (deltaY > SWIPE_THRESHOLD) onPlayerMove('down');
        if (deltaY < -SWIPE_THRESHOLD) onPlayerMove('up');
      }
      touchStartRef.current = null;
    };
    gameArea.addEventListener('touchstart', handleTouchStart);
    gameArea.addEventListener('touchend', handleTouchEnd);
    return () => {
      gameArea.removeEventListener('touchstart', handleTouchStart);
      gameArea.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onPlayerMove]);

  // Funzioni di Logica e Rendering (invariate)
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
        return pathCurve1Sprite;
    } else if (hasPathAbove && hasPathRight && !hasPathBelow && !hasPathLeft) {
        return pathCurve3Sprite;
    } else if (hasPathAbove && !hasPathRight && !hasPathBelow && hasPathLeft) {
        return pathCurve2Sprite;
    } else if (!hasPathAbove && hasPathRight && hasPathBelow && !hasPathLeft) {
        return pathCurve4Sprite;
    } else if (!hasPathAbove && !hasPathRight && !hasPathBelow && hasPathLeft) {
        return pathClose1Sprite;
    } else if (hasPathAbove && !hasPathRight && !hasPathBelow && !hasPathLeft) {
        return pathClose2Sprite;
    } else if (!hasPathAbove && hasPathRight && !hasPathBelow && !hasPathLeft) {
        return pathClose3Sprite;
    } else if (!hasPathAbove && !hasPathRight && hasPathBelow && !hasPathLeft) {
        return pathClose4Sprite;
    } else if (hasPathAbove && hasPathRight && !hasPathBelow && hasPathLeft) {
        return pathT1Sprite;
    } else if (hasPathAbove && hasPathRight && hasPathBelow && !hasPathLeft) {
        return pathT2Sprite;
    } else if (!hasPathAbove && hasPathRight && hasPathBelow && hasPathLeft) {
        return pathT3Sprite;
    } else if (hasPathAbove && !hasPathRight && hasPathBelow && hasPathLeft) {
        return pathT4Sprite;
    } else if (hasPathAbove && hasPathRight && hasPathBelow && hasPathLeft) {
        return pathCrossSprite;
    } else if (hasPathAbove || hasPathBelow) {
      return pathVerticalSprite;
    } else if (hasPathLeft || hasPathRight) {
      return pathHorizontalSprite;
    }

    // Default se la casella è isolata
    return pathHorizontalSprite;
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

  const getCellContent = (cellType: string, x: number, y: number) => {
    switch (cellType) {
      case 'obstacle': return <img src={treeSprite} alt="Albero" className="w-10 h-10 object-contain" />;
      case 'key': return <img src={keySprite} alt="Chiave" className="w-10 h-10 object-contain" />;
      case 'door': return <img src={portalSprite} alt="Porta" className="w-10 h-10 object-contain" />;
      case 'floor':
        const pathSprite = getPathSprite(x, y);
        return <img src={pathSprite} alt="Percorso" className="w-full h-full object-cover" />;
      default: return '';
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

  // Il JSX che renderizza il tutto
  return (
    <div
      ref={gameAreaRef}
      className="min-h-screen w-full flex flex-col items-center justify-center gap-6 p-4 relative"
      style={{ backgroundImage: `url(${forestBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute top-2 left-2 bg-black/60 text-white p-2 rounded-lg text-xs font-mono z-10">
        <p>Livello: {level.name}</p>
        <p>Posizione: ({gameState.playerPosition.x}, {gameState.playerPosition.y})</p>
        <p>Mosse: {gameState.moveCount}</p>
        {level.keyPosition && <p>Chiave: {gameState.hasKey ? 'Sì ✅' : 'No ❌'}</p>}
      </div>

      <div className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-lg p-2 shadow-2xl">
        <div className="relative">
          {/* GRIGLIA DISEGNATA UNA SOLA VOLTA E IN MODO CORRETTO */}
          <div className="grid grid-cols-10" style={{ gap: `${GAP_SIZE}px` }}>
            {Array.from({ length: GRID_WIDTH * GRID_HEIGHT }).map((_, i) => {
              const x = i % GRID_WIDTH;
              const y = Math.floor(i / GRID_WIDTH);
              const cellType = getCellType(x, y);
              return (
                <div key={`${x}-${y}`} className={getCellStyles(cellType)} style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}>
                  {getCellContent(cellType, x, y)}
                </div>
              );
            })}
          </div>

          {/* GIOCATORE */}
          <div
            className="absolute pointer-events-none transition-all duration-150 ease-out z-20"
            style={{
              width: CELL_SIZE, height: CELL_SIZE,
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
                <img src={playerSprite} alt="Personaggio" className="w-11 h-11 object-contain drop-shadow-lg" />
              )}
            </div>
          </div>

{/* NEMICI */}
          {gameState.enemies.map(enemy => {
              let currentEnemySprite;

              // Questo switch sceglie lo sprite giusto in base a TIPO e DIREZIONE
              switch (enemy.type) {
                  case 'bruco':
                      switch (enemy.direction) {
                          case 'up': currentEnemySprite = brucoSpriteUp; break;
                          case 'down': currentEnemySprite = brucoSpriteDown; break;
                          case 'left': currentEnemySprite = brucoSpriteLeft; break;
                          case 'right': currentEnemySprite = brucoSpriteRight; break;
                          default: currentEnemySprite = brucoSpriteDown; break;
                      }
                      break;
                  default:
                      currentEnemySprite = brucoSpriteDown;
                      break;
              }

              // ===== QUESTO È IL BLOCCO CORRETTO DA USARE =====
              return (
                <div
                  key={enemy.id}
                  // AGGIUNGI QUESTA CLASSE per il posizionamento e la transizione
                  className="absolute pointer-events-none transition-all duration-150 ease-out z-10"
                  // AGGIUNGI QUESTO STYLE per calcolare la posizione
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
            })
          }
        </div>
      </div>
    </div>
  );
};

export default GameBoard;