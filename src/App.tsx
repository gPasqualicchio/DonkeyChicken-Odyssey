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

  // Gestione dell'audio in base al ciclo di vita dell'app
  useEffect(() => {
    // Usa la variabile importata, che contiene il percorso corretto
    audio.add('MainMenu_Theme', backgroundMusic);
    audio.add('CiucoForest_Theme', gameMusic);
  }, []);

  // NUOVO: Gestore per gli eventi di visibilità della pagina
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // La pagina è in background, ferma tutto l'audio
        audio.stopAll();
        console.log("Audio fermato: la pagina è in background.");
      } else {
        // La pagina è tornata in primo piano, riavvia l'audio corretto
        if (screenState === 'mainMenu') {
          audio.play('MainMenu_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
          console.log("Audio riavviato: MainMenu_Theme.");
        } else if (screenState === 'game') {
          audio.play('CiucoForest_Theme', { loop: true, volume: 0.5, fadeMs: 600 });
          console.log("Audio riavviato: CiucoForest_Theme.");
        }
      }
    };

    // Aggiunge l'event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup: rimuove l'event listener quando il componente si smonta
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [screenState]); // Aggiungi screenState alle dipendenze per rilevare i cambi di schermata

  // La funzione per mostrare il MainMenu
  const handleShowMainMenu = () => {
    setScreenState('mainMenu');
  };

  const handleStartGame = () => {
    // Prima di avviare il gioco, ferma la musica del menu e avvia quella del gioco
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