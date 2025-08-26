// src/App.tsx
import { useState, useEffect } from "react";
import MainMenu from "./components/game/MainMenu";
import StartupScreen from './StartupScreen';
import GameManager from "./components/GameManager";
import { audio } from "./audio/AudioManager";

// Importa direttamente il file audio dalla sua posizione
import backgroundMusic from "/audio/START_Adventure_Groove.mp3";
import gameMusic from "/audio/CiucoForestThemeSong.mp3";

const App = () => {
  const [screenState, setScreenState] = useState('startup');

  useEffect(() => {
    console.log("[App.tsx] Caricamento iniziale...");
    audio.add('MainMenu_Theme', backgroundMusic);
    audio.add('CiucoForest_Theme', gameMusic);
  }, []);

  const handleShowMainMenu = () => {
    console.log("[App.tsx] Transizione a MainMenu.");
    setScreenState('mainMenu');
  };

  const handleStartGame = () => {
    console.log("[App.tsx] Avvio del gioco.");
    audio.stop('MainMenu_Theme');
    audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
    setScreenState('game');
  };

  return (
    <div className="App">
      {screenState === 'startup' && (
        <StartupScreen onStart={handleShowMainMenu} />
      )}
      {screenState === 'mainMenu' && (
        <MainMenu onStartNewGame={handleStartGame} />
      )}
      {screenState === 'game' && (
        <GameManager />
      )}
    </div>
  );
};

export default App;