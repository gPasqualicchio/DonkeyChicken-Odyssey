import { useState } from "react";
import GameBoard from "./game/GameBoard";
import { levels } from "./levels";

const GameManager = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  const handleLevelComplete = () => {
    // Controlla se ci sono altri livelli
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(prevIndex => prevIndex + 1);
    } else {
      // Il giocatore ha finito tutti i livelli!
      alert("Hai completato il gioco! Congratulazioni!");
      setCurrentLevelIndex(0); // Ricomincia dal primo livello
    }
  };

  const currentLevelData = levels[currentLevelIndex];

  return (
    <GameBoard
      key={currentLevelData.id} // La "key" è importante per far sì che React ricarichi il componente
      level={currentLevelData}
      onLevelComplete={handleLevelComplete}
    />
  );
};

export default GameManager;