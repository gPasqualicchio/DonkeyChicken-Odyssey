import { useState, useEffect } from "react";
import MainMenu from "./components/game/MainMenu";
import StartupScreen from './StartupScreen';
import GameManager from "./components/GameManager";
import { audio } from "./audio/AudioManager";
import { useGameEngine } from "./hooks/useGameEngine";
import { levels } from "./components/levels";
import { IS_DEBUG_MODE } from "./config/Constants";

import backgroundMusic from "/audio/START_Adventure_Groove.mp3";
import gameMusic from "/audio/CiucoForestThemeSong.mp3";

const App = () => {
  const [screenState, setScreenState] = useState<'startup' | 'mainMenu' | 'levelSelect' | 'game'>('startup');

  // 1. L'engine del gioco vive qui, al livello più alto.
  const gameEngine = useGameEngine();

  useEffect(() => {
    audio.add('MainMenu_Theme', backgroundMusic);
    audio.add('CiucoForest_Theme', gameMusic);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) audio.stopAll();
      else {
        if (screenState === 'mainMenu') audio.play('MainMenu_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
        else if (screenState === 'game') audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [screenState]);

  const handleGoToMainMenu = () => {
    audio.stop('CiucoForest_Theme');
    audio.play('MainMenu_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
    setScreenState('mainMenu');
  };

  // 2. Le funzioni ora interagiscono con l'istanza dell'engine
  const handleStartNewGame = () => {
    if (IS_DEBUG_MODE) {
      setScreenState('levelSelect');
    } else {
      audio.stop('MainMenu_Theme');
      audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
      gameEngine.startNewGame(); // Resetta il salvataggio al livello 0
      setScreenState('game');
    }
  };

  const handleContinueGame = () => {
    audio.stop('MainMenu_Theme');
    audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
    // Non fa nulla all'engine, che caricherà in automatico l'ultimo salvataggio
    setScreenState('game');
  };

  const handleSelectLevel = (levelIndex: number) => {
    audio.stop('MainMenu_Theme');
    audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
    gameEngine.startGameAtLevel(levelIndex); // Imposta il livello specifico
    setScreenState('game');
  };

  return (
    <div className="App">
      {screenState === 'startup' && (
        <StartupScreen onStart={handleGoToMainMenu} />
      )}
      {screenState === 'mainMenu' && (
        <MainMenu
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          onSelectLevel={handleSelectLevel}
          levels={levels}
        />
      )}
      {screenState === 'game' && (
        // 3. Passiamo tutto il necessario al GameManager
        <GameManager
          gameState={gameEngine.gameState}
          currentLevelData={gameEngine.currentLevelData}
          handleDirectionChange={gameEngine.handleDirectionChange}
          handleLevelReset={gameEngine.handleLevelReset}
          onGoToMainMenu={handleGoToMainMenu} // Aggiunto per il pulsante nel gioco
        />
      )}
    </div>
  );
};

export default App;