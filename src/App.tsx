// src/App.tsx

import { useState } from "react";

// MODIFICATO: Importa GameManager invece di GameBoard
import MainMenu from './components/game/MainMenu';
import GameManager from './components/GameManager'; // Assicurati che il percorso sia corretto

type Screen = 'menu' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  const startGame = () => {
    setScreen('game');
  };

  return (
    <main className="main-h-screen w-full">
      {screen === 'menu' && <MainMenu onStartNewGame={startGame} />}

      {/* MODIFICATO: Renderizza GameManager quando il gioco inizia */}
      {screen === 'game' && <GameManager />}
    </main>
  );
}

export default App;