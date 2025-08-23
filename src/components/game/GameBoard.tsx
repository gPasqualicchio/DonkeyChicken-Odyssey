import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

// NUOVO: Importa le interfacce condivise
import { Level, Position } from "@/types/game";

// --- URL pubblici per le immagini (per l'anteprima) ---
import forestBackground from '@/assets/forest-background.jpg';
import treeSprite from "@/assets/tree-sprite.png";
import keySprite from "@/assets/key_gold_SIMPLE.png";
import playerSprite from "@/assets/donkeychicken_M.png";

// Costanti di gioco (invariate)
const GRID_WIDTH = 8;
const GRID_HEIGHT = 7;
const CELL_SIZE = 48;
const GAP_SIZE = 0;
const SWIPE_THRESHOLD = 30;

// MODIFICATO: Lo stato interno ora contiene solo dati dinamici
export interface GameState {
  playerPosition: Position;
  gameWon: boolean;
  moveCount: number;
  isMoving: boolean;
  hasKey: boolean;
}

// NUOVO: Definisce le proprietà che il componente riceve
interface GameBoardProps {
  level: Level;
  onLevelComplete: () => void; // Funzione per notificare il genitore del completamento
}

const GameBoard = ({ level, onLevelComplete }: GameBoardProps) => {
  const { toast } = useToast();

  // Funzione helper per creare lo stato iniziale basandosi sul livello passato come prop
  const getInitialGameState = (currentLevel: Level): GameState => ({
    playerPosition: currentLevel.startPosition,
    gameWon: false,
    moveCount: 0,
    isMoving: false,
    hasKey: false,
  });

  const [gameState, setGameState] = useState<GameState>(() => getInitialGameState(level));
  const touchStartRef = useRef<Position | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // NUOVO: Questo Effetto resetta lo stato del gioco se il livello (prop) cambia
  useEffect(() => {
    setGameState(getInitialGameState(level));
  }, [level]);


  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.gameWon || gameState.isMoving) return;

    setGameState(prev => {
      const newPosition = { ...prev.playerPosition };
      switch (direction) {
        case 'up': if (newPosition.y > 0) newPosition.y--; break;
        case 'down': if (newPosition.y < GRID_HEIGHT - 1) newPosition.y++; break;
        case 'left': if (newPosition.x > 0) newPosition.x--; break;
        case 'right': if (newPosition.x < GRID_WIDTH - 1) newPosition.x++; break;
      }

      const hasMoved = newPosition.x !== prev.playerPosition.x || newPosition.y !== prev.playerPosition.y;
      if (!hasMoved) return prev;

      // MODIFICATO: I controlli ora usano i dati da `level` (passato via props)
      const isObstacle = level.obstacles.some(obs => obs.x === newPosition.x && obs.y === newPosition.y);
      if (isObstacle) return prev;

      const isDoor = level.doorPosition && newPosition.x === level.doorPosition.x && newPosition.y === level.doorPosition.y;
      if (isDoor && !prev.hasKey) {
        toast({ title: "Porta chiusa", description: "Trova la chiave per aprirla!" });
        return prev;
      }

      let newHasKey = prev.hasKey;

      const isKey = level.keyPosition && newPosition.x === level.keyPosition.x && newPosition.y === level.keyPosition.y;
      if (isKey && !prev.hasKey) { // Aggiunto !prev.hasKey per evitare di raccoglierla di nuovo
        newHasKey = true;
        toast({ title: "🔑 Chiave raccolta!", description: "Ora puoi aprire la porta." });
      }

      const gameWon = newPosition.x === level.endPosition.x && newPosition.y === level.endPosition.y;

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
  }, [level, gameState.gameWon, gameState.isMoving, toast]);


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
    const handleTouchStart = (e: TouchEvent) => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
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

  // MODIFICATO: Al completamento del livello, chiama la funzione onLevelComplete
  useEffect(() => {
    if (gameState.gameWon) {
      toast({ title: `🎉 ${level.name} completato!`, description: 'Hai finito in ${gameState.moveCount} mosse!' });
      setTimeout(onLevelComplete, 2000);
    }
  }, [gameState.gameWon, gameState.moveCount, level.name, onLevelComplete, toast]);

  // MODIFICATO: Le funzioni di rendering ora usano `level` e `gameState`
  const getCellType = (x: number, y: number) => {
    if (level.keyPosition && x === level.keyPosition.x && y === level.keyPosition.y && !gameState.hasKey) return 'key';
    if (level.doorPosition && x === level.doorPosition.x && y === level.doorPosition.y) return 'door';
    if (level.obstacles.some(obs => obs.x === x && obs.y === y)) return 'obstacle';
    if (x === level.startPosition.x && y === level.startPosition.y) return 'start';
    if (x === level.endPosition.x && y === level.endPosition.y) return 'end';
    return 'floor';
  };

  const getCellContent = (cellType: string) => {
    switch (cellType) {
      case 'obstacle': return <img src={treeSprite} alt="Albero" className="w-10 h-10 object-contain" />;
      case 'start': return 'A';
      case 'end': return 'B';
      case 'key': return <img src={keySprite} alt="Chiave" className="w-10 h-10 object-contain" />;
      case 'door': return '🚪';
      default: return '';
    }
  };

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