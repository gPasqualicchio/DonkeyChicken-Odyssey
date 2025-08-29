import { useState } from 'react';
import GameBoard from "./game/GameBoard";
import { GameState, Level, Direction } from '../game';
import { GameAssets } from "@/config/Assets";
import { Button } from "@/components/ui/button";

import restartButtonSprite from '@/assets/icons/restart_icon.png';
import mainMenuButtonSprite from '@/assets/icons/homepage_icon.png';
import leverActionButtonSprite from '@/assets/icons/action_icon.png';

// Definiamo le props che il GameManager si aspetta di ricevere da App.tsx
interface GameManagerProps {
  gameState: GameState;
  handleDirectionChange: (direction: Direction | null) => void;
  handleLevelReset: () => void;
  onGoToMainMenu: () => void;
  actionableLeverId: number | null;
  toggleLever: () => void;
}

const GameManager = ({
  gameState,
  handleDirectionChange,
  handleLevelReset,
  onGoToMainMenu,
  actionableLeverId,
  toggleLever
}: GameManagerProps) => {

  const [isConfirmMenuOpen, setConfirmMenuOpen] = useState(false);

  // --- ECCO LA MODIFICA CHIAVE ---
  // I dati del livello ora vengono presi direttamente dallo stato di gioco.
  const currentLevelData = gameState.level;

  // Questo controllo ora funzionerà correttamente.
  if (!currentLevelData) {
    return <div>Caricamento livello...</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute top-8 right-8 flex gap-2 z-30">
        <Button onClick={handleLevelReset} className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
          <img src={restartButtonSprite} alt="Riavvia Icona" className="w-full h-full" />
        </Button>
        <Button onClick={() => setConfirmMenuOpen(true)} className="w-12 h-12 p-0 bg-transparent hover:bg-green-700/50 border-none shadow-none">
          <img src={mainMenuButtonSprite} alt="Menu Principale Icona" className="w-full h-full" />
        </Button>
      </div>

      {actionableLeverId !== null && (
        <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-center gap-2 z-30">
          <Button
            onClick={toggleLever}
            className="w-20 h-20 p-0 bg-transparent hover:bg-yellow-500/20 border-none shadow-lg rounded-full animate-pulse"
          >
            <img src={leverActionButtonSprite} alt="Attiva Leva" />
          </Button>
          <p className="text-white font-bold text-shadow animate-pulse">Attiva</p>
        </div>
      )}

      <GameBoard
        key={currentLevelData.id}
        level={currentLevelData} // Passiamo i dati del livello estratti
        gameState={gameState}
        onDirectionChange={handleDirectionChange}
        assets={GameAssets}
      />

      {isConfirmMenuOpen && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-8 shadow-lg text-center text-white flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Tornare al Menu Principale?</h2>
            <p className="text-gray-300">I progressi in questo livello andranno persi.</p>
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={onGoToMainMenu} className="bg-green-600 hover:bg-green-500 px-8 py-3 text-lg">
                Sì
              </Button>
              <Button onClick={() => setConfirmMenuOpen(false)} className="bg-red-600 hover:bg-red-500 px-8 py-3 text-lg">
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