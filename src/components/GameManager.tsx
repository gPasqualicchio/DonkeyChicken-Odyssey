// src/components/GameManager.tsx

import GameBoard from "./game/GameBoard";
import { GameState, Level, Direction } from '../game'; // Percorsi aggiornati
import { GameAssets } from "@/config/Assets";
import { Button } from "@/components/ui/button";
import iconsSprite from '@/assets/icons/Icons_InGame.png';
import restartButtonSprite from '@/assets/icons/restart_icon.png';

// 1. Definiamo le props che il componente riceverà
interface GameManagerProps {
  gameState: GameState;
  currentLevelData: Level;
  handleDirectionChange: (direction: Direction | null) => void;
  handleLevelReset: () => void;
}

const GameManager = ({
  gameState,
  currentLevelData,
  handleDirectionChange,
  handleLevelReset
}: GameManagerProps) => {

  // 2. L'hook useGameEngine NON viene più chiamato qui!

  return (
    <div className="relative">
      <div className="absolute top-8 right-8 flex gap-2 z-30">
        <Button onClick={handleLevelReset} className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
          <img src={restartButtonSprite} alt="Restart Icon" className="w-full h-full" />
        </Button>
        <Button className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
          <img src={iconsSprite} alt="Main Menu Icon" className="w-full h-full" />
        </Button>
        <Button className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
          <img src={iconsSprite} alt="Music Icon" className="w-full h-full" />
        </Button>
        <Button disabled className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50/50 border-none shadow-none">
          <img src={iconsSprite} alt="Sound Icon" className="w-full h-full" />
        </Button>
      </div>

      <GameBoard
        key={currentLevelData.id}
        level={currentLevelData}
        gameState={gameState}
        onDirectionChange={handleDirectionChange}
        assets={GameAssets}
      />
    </div>
  );
};

export default GameManager;