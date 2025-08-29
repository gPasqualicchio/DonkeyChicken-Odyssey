import { useState, useEffect } from "react";
import MainMenu from "./components/game/MainMenu";
import StartupScreen from './StartupScreen';
import GameManager from "./components/GameManager";
import { audio } from "./audio/AudioManager";
import { useGameEngine } from "./hooks/useGameEngine";
import { levels } from "./components/levels";

import backgroundMusic from "/audio/START_Adventure_Groove.mp3";
import gameMusic from "/audio/CiucoForestThemeSong.mp3";

const App = () => {
  const [screenState, setScreenState] = useState<'startup' | 'mainMenu' | 'game'>('startup');
  const gameEngine = useGameEngine();

  useEffect(() => {
    audio.add('MainMenu_Theme', backgroundMusic);
    audio.add('CiucoForest_Theme', gameMusic);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        audio.stopAll();
      } else {
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

  const handleStartNewGame = () => {
    audio.stop('MainMenu_Theme');
    audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
    gameEngine.startNewGame();
    setScreenState('game');
  };

  const handleContinueGame = () => {
    // Qui andrà la logica per caricare il salvataggio
    // Per ora, si comporta come New Game
    handleStartNewGame();
  };

  const handleSelectLevel = (levelIndex: number) => {
    audio.stop('MainMenu_Theme');
    audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
    gameEngine.startGameAtLevel(levelIndex);
    setScreenState('game');
  };

  return (
    <div className="App">
      {screenState === 'startup' && (
        <StartupScreen onStart={() => setScreenState('mainMenu')} />
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
        <GameManager
          gameState={gameEngine.gameState}
          handleDirectionChange={gameEngine.handleDirectionChange}
          handleLevelReset={gameEngine.handleLevelReset}
          actionableLeverId={gameEngine.actionableLeverId}
          toggleLever={gameEngine.toggleLever}
          onGoToMainMenu={handleGoToMainMenu}
        />
      )}
    </div>
  );
};

export default App;