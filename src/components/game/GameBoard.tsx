// GameBoard.tsx

import { useEffect, useRef } from "react";
import { Level, Position, GameState } from '../../game'; // Importa i tipi (deve "uscire" di due cartelle)

// URL delle immagini e costanti di gioco
import forestBackground from '@/assets/forest-background.jpg';
import treeSprite from "@/assets/tree-sprite.png";
import keySprite from "@/assets/key_gold_SIMPLE.png";
import portalSprite from "@/assets/portal_forest_1.png";
import playerSprite from "@/assets/donkeychicken_M.png";
import brucoSprite from "@/assets/ENEMY_bruco_1.png";

// 1. AGGIUNGI QUESTO IMPORT
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, GAP_SIZE, SWIPE_THRESHOLD } from "@/config/Constants";

interface GameBoardProps {
  level: Level;
  gameState: GameState;
  onPlayerMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

const GameBoard = ({ level, gameState, onPlayerMove }: GameBoardProps) => {
  const touchStartRef = useRef<Position | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Gestione Input (invariata, chiama onPlayerMove)
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

  // Le funzioni di rendering (invariate)
  const getCellType = (x: number, y: number) => {
    if (level.keyPosition && x === level.keyPosition.x && y === level.keyPosition.y && !gameState.hasKey) return 'key';
    if (level.doorPosition && x === level.doorPosition.x && y === level.doorPosition.y) return 'door';
    if (level.obstacles.some(obs => obs.x === x && obs.y === y)) return 'obstacle';
    if (x === level.startPosition.x && y === level.startPosition.y) return 'start';
    if (x === level.endPosition.x && y === level.endPosition.y) return 'end';
    return 'floor';
  };

  // <-- ECCO LA PARTE MANCANTE!
  const getCellContent = (cellType: string) => {
    switch (cellType) {
      case 'obstacle': return <img src={treeSprite} alt="Albero" className="w-10 h-10 object-contain" />;
      case 'start': return 'A'; // Puoi sostituire con uno sprite se vuoi
      case 'end': return 'B'; // Puoi sostituire con uno sprite se vuoi
      case 'key': return <img src={keySprite} alt="Chiave" className="w-10 h-10 object-contain" />;
      case 'door': return <img src={portalSprite} alt="Porta" className="w-10 h-10 object-contain" />;
      default: return '';
    }
  };

  // <-- E ANCHE QUESTA!
  const getCellStyles = (cellType: string) => {
    const baseStyles = "border border-green-800/20 flex items-center justify-center text-2xl font-bold transition-all duration-300";
    switch (cellType) {
      case 'obstacle': return `${baseStyles} bg-green-900/30`;
      case 'start': return `${baseStyles} bg-green-600/80 text-white shadow-lg`;
      case 'end': return `${baseStyles} bg-yellow-500/80 text-white shadow-lg`;
      case 'key': return `${baseStyles} bg-yellow-400/50 animate-pulse`;
      case 'door':
        return gameState.hasKey
          ? `${baseStyles} bg-amber-800/30 opacity-50`
          : `${baseStyles} bg-amber-900/80`;
      default: return `${baseStyles} bg-green-200/40`;
    }
  };

  // Il JSX che renderizza il tutto (invariato)
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
          <div className="grid grid-cols-10" style={{ gap: `${GAP_SIZE}px` }}>
            {Array.from({ length: GRID_WIDTH * GRID_HEIGHT }).map((_, i) => {
              const x = i % GRID_WIDTH;
              const y = Math.floor(i / GRID_WIDTH);
              const cellType = getCellType(x, y);
              return (
                <div key={`${x}-${y}`} className={getCellStyles(cellType)} style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}>
                  {/* Questa riga usa getCellContent per disegnare gli oggetti */}
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
              // Nascondiamo il div se il gioco è vinto, per non coprire l'uscita,
              transform: gameState.isMoving ? 'scale(1.1)' : 'scale(1)',
              opacity: gameState.gameWon ? 0 : 1,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              {/* === CONDIZIONE PER MOSTRARE LA X O IL GIOCATORE === */}
              {gameState.isPlayerDead ? (
                <span className="text-4xl font-black text-red-600 drop-shadow-lg">X</span>
              ) : (
                <img src={playerSprite} alt="Personaggio" className="w-11 h-11 object-contain drop-shadow-lg" />
              )}
            </div>
          </div>

            {gameState.enemies.map(enemy => {
                      let currentEnemySprite;
                      // Questo switch sceglie l'immagine giusta in base al tipo di nemico
                      switch (enemy.type) {
                          case 'bruco':
                              currentEnemySprite = brucoSprite;
                              break;
                          // Aggiungerai qui altri 'case' per futuri nemici
                          default:
                              currentEnemySprite = brucoSprite;
                              break;
                      }

                             return (
                                <div
                                  key={enemy.id}
                                  className="absolute pointer-events-none transition-all duration-150 ease-out"
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
                          }
                      )
                  }
        </div>
      </div>
    </div>
  );
};

export default GameBoard;