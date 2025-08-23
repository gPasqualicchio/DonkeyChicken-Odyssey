import { useState } from 'react';
import MainMenu from './components/game/MainMenu'; // Assicurati che il percorso sia corretto
import GameBoard from './components/game/GameBoard'; // Assicurati che il percorso sia corretto

type GameScreen = 'menu' | 'game';

function App() {
  const [screen, setScreen] = useState<GameScreen>('menu');

  const startGame = () => {
    setScreen('game');
  };

  // L'elemento <main> ora è un semplice contenitore senza stile di sfondo.
  // Occuperà l'intera schermata e al suo interno verrà renderizzato
  // il componente corretto (MainMenu o GameBoard), che avrà il proprio sfondo.
  return (
    <main className="min-h-screen w-full">
      {screen === 'menu' && <MainMenu onStartNewGame={startGame} />}
      {screen === 'game' && <GameBoard />}
    </main>
  );
}

export default App;