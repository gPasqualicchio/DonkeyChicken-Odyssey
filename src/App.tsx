import { useState, useEffect } from "react";
import MainMenu from "./components/game/MainMenu";
import StartupScreen from './StartupScreen';
import GameManager from "./components/GameManager";
import { audio } from "./audio/AudioManager";
import { levels } from "./components/levels";

import backgroundMusic from "/audio/START_Adventure_Groove.mp3";
import gameMusic from "/audio/CiucoForestThemeSong.mp3";

const App = () => {
  const [screenState, setScreenState] = useState<'startup' | 'mainMenu' | 'game'>('startup');

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

  const handleGoToMainMenu = () => {
    audio.stop('CiucoForest_Theme');
    audio.play('MainMenu_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
    setScreenState('mainMenu');
  };

  // Funzione unificata per avviare il gioco (sia per Nuova Partita che per Continua/Seleziona)
  // La logica specifica (reset/load) è gestita all'interno di useGameEngine
  const handleStartGame = () => {
    audio.stop('MainMenu_Theme');
    audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
    setScreenState('game');
  };

  return (
    <div className="App">
      {screenState === 'startup' && (
        <StartupScreen onStart={handleGoToMainMenu} />
      )}
      {screenState === 'mainMenu' && (
        <MainMenu
          // Passiamo la stessa funzione per tutte le azioni che portano al gioco
          onStartNewGame={handleStartGame}
          onContinueGame={handleStartGame}
          onSelectLevel={handleStartGame} // Anche la selezione del livello avvia semplicemente il gioco
          levels={levels}
        />
      )}
      {screenState === 'game' && (
        // Passiamo al GameManager la funzione per tornare al menu
        <GameManager onGoToMainMenu={handleGoToMainMenu} />
      )}
    </div>
  );
};

export default App;