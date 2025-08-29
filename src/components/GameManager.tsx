import { useEffect } from 'react';
import GameBoard from "./game/GameBoard";
import { GameState, Level, Direction } from '../game';
import { GameAssets } from "@/config/Assets";
import { Button } from "@/components/ui/button";
import iconsSprite from '@/assets/icons/Icons_InGame.png';

// 1. L'interfaccia ora definisce tutte le props ricevute da App.tsx
interface GameManagerProps {
  gameState: GameState;
  currentLevelData: Level;
  handleDirectionChange: (direction: Direction | null) => void;
  handleLevelReset: () => void;
  onGoToMainMenu: () => void;
}

const GameManager = ({
  gameState,
  currentLevelData,
  handleDirectionChange,
  handleLevelReset,
  onGoToMainMenu
}: GameManagerProps) => {

  // L'hook useGameEngine NON viene più chiamato qui

  // Gestione del tasto "indietro" del browser
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

  // Guardia di sicurezza per evitare crash se i dati non sono pronti
  if (!currentLevelData) {
    return <div>Caricamento livello...</div>;
  }

  return (
    <div className="relative">
      <div className="absolute top-8 right-8 flex gap-2 z-30">
        <Button onClick={handleLevelReset} className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
          <img src={iconsSprite} alt="Restart Icon" className="w-full h-full" />
        </Button>

        <Button onClick={onGoToMainMenu} className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
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