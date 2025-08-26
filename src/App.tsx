// src/App.tsx

import { useState, useEffect } from "react";
import MainMenu from "./components/game/MainMenu";
import StartupScreen from './StartupScreen';
import GameManager from "./components/GameManager";
import { audio } from "./audio/AudioManager";
import { useGameEngine } from "./hooks/useGameEngine"; // Importa l'engine

// Importa i file audio
import backgroundMusic from "/audio/START_Adventure_Groove.mp3";
import gameMusic from "/audio/CiucoForestThemeSong.mp3";

const App = () => {
  const [screenState, setScreenState] = useState('startup');

  // --- 1. L'hook del gioco ora vive qui, al livello più alto ---
  const gameEngine = useGameEngine();

  // Gestione dell'audio
  useEffect(() => {
    audio.add('MainMenu_Theme', backgroundMusic);
    audio.add('CiucoForest_Theme', gameMusic);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        audio.stopAll();
      } else {
        if (screenState === 'mainMenu') {
          audio.play('MainMenu_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
        } else if (screenState === 'game') {
          audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [screenState]);

  const handleShowMainMenu = () => {
    audio.play('MainMenu_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
    setScreenState('mainMenu');
  };

  // --- 2. Funzioni specifiche per i pulsanti del menu ---
  const handleStartNewGame = () => {
    audio.stop('MainMenu_Theme');
    audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
    gameEngine.startNewGame(); // Usa la funzione dall'engine per resettare
    setScreenState('game');
  };

  const handleContinueGame = () => {
    audio.stop('MainMenu_Theme');
    audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
    // Non serve fare altro, l'engine carica già il salvataggio all'avvio
    setScreenState('game');
  };

  return (
    <div className="App">
      {screenState === 'startup' && (
        <StartupScreen onStart={handleShowMainMenu} />
      )}
      {screenState === 'mainMenu' && (
        // --- 3. Passiamo entrambe le funzioni al MainMenu ---
        <MainMenu
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
        />
      )}
      {screenState === 'game' && (
        // --- 4. Passiamo lo stato e le funzioni dall'engine al GameManager ---
        <GameManager
          gameState={gameEngine.gameState}
          currentLevelData={gameEngine.currentLevelData}
          handleDirectionChange={gameEngine.handleDirectionChange}
          handleLevelReset={gameEngine.handleLevelReset}
        />
      )}
    </div>
  );
};

export default App;