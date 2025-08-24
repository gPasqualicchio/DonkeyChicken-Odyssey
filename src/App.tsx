// src/App.tsx
import { useState, useEffect } from "react";

import MainMenu from "./components/game/MainMenu";
import GameManager from "./components/GameManager";
import { audio } from "./audio/AudioManager";

type Screen = "menu" | "game";

function App() {
  const [screen, setScreen] = useState<Screen>("menu");

  const startGame = () => setScreen("game");

  useEffect(() => {
    audio.add("menu", "/audio/START_Adventure_Groove.mp3");
    audio.add("level1", "/audio/START_Adventure_Groove.mp3");

    const onFirstUnlock = async () => {
      removeUnlockers();
      try {
        console.log("[App] First user gesture → unlocking audio");
        await audio.play("menu", { volume: 0.55, fadeMs: 700 });
      } catch (err) {
        console.error("[App] Even after unlock, audio failed", err);
      }
    };

    const addUnlockers = () => {
      window.addEventListener("pointerdown", onFirstUnlock, { once: true });
      window.addEventListener("keydown", onFirstUnlock, { once: true });
      document.addEventListener("visibilitychange", onFirstUnlock, { once: true });
    };

    const removeUnlockers = () => {
      window.removeEventListener("pointerdown", onFirstUnlock);
      window.removeEventListener("keydown", onFirstUnlock);
      document.removeEventListener("visibilitychange", onFirstUnlock);
    };

    const tryStartMenu = async () => {
      try {
        console.log("[App] Trying autoplay of menu music…");
        await audio.play("menu", { volume: 0.55, fadeMs: 700 });
        removeUnlockers();
      } catch {
        console.log("[App] Autoplay blocked, waiting for first user gesture");
        addUnlockers();
      }
    };

    void tryStartMenu();

    return () => {
      removeUnlockers();
      // opzionale: audio.stopAll();
    };
  }, []);

  return (
    <main className="min-h-screen w-full">
      {screen === "menu" && <MainMenu onStartNewGame={startGame} />}
      {screen === "game" && <GameManager />}
    </main>
  );
}

export default App;
