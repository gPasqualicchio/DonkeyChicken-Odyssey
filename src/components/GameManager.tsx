import { useEffect, useState } from 'react';
import GameBoard from "./game/GameBoard";
import { GameAssets } from "@/config/Assets";
import { Button } from "@/components/ui/button";
import iconsSprite from '@/assets/icons/Icons_InGame.png';
import { useGameEngine } from "@/hooks/useGameEngine";
import { Direction } from '@/game';

interface GameManagerProps {
  onGoToMainMenu: () => void;
}

const GameManager = ({ onGoToMainMenu }: GameManagerProps) => {
  const {
    gameState,
    currentLevelData,
    handleDirectionChange,
    handleLevelReset,
  } = useGameEngine();

  const [isConfirmMenuOpen, setConfirmMenuOpen] = useState(false);

  useEffect(() => {
    window.history.pushState({ screen: 'game' }, '');
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      onGoToMainMenu();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onGoToMainMenu]);

  if (!currentLevelData) {
    return <div>Loading Level...</div>;
  }

  return (
    <div className="relative">
      <div className="absolute top-8 right-8 flex gap-2 z-30">
        <Button onClick={handleLevelReset} className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
          <img src={iconsSprite} alt="Restart Icon" className="w-full h-full" />
        </Button>

        <Button onClick={() => setConfirmMenuOpen(true)} className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
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

      {isConfirmMenuOpen && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-yellow-500 rounded-lg p-8 shadow-lg text-center text-white flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Tornare al Menu Principale?</h2>
            <p className="text-gray-300">I progressi in questo livello andranno persi.</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={onGoToMainMenu}
                className="bg-green-600 hover:bg-green-500 px-8 py-4 text-lg"
              >
                Sì
              </Button>
              <Button
                onClick={() => setConfirmMenuOpen(false)}
                className="bg-red-600 hover:bg-red-500 px-8 py-4 text-lg"
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameManager;