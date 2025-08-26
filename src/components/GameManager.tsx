import GameBoard from "./game/GameBoard";
import { GameAssets } from "@/config/Assets";
import { Button } from "@/components/ui/button";
import iconsSprite from '@/assets/icons/Icons_InGame.png';
import { useGameEngine } from "@/hooks/useGameEngine";

const GameManager = () => {
  // Il componente riceve tutto ciò di cui ha bisogno dall'engine.
  const {
    gameState,
    currentLevelData,
    handleLevelReset,
    handleDirectionChange,
  } = useGameEngine();

  return (
    <div className="relative">
      <div className="absolute top-8 right-8 flex gap-2 z-30">
        <Button onClick={handleLevelReset} className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
          <img src={iconsSprite} alt="Restart Icon" className="w-full h-full" />
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