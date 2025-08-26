// src/components/StartupScreen.tsx

import { useEffect, useState } from 'react';
import { audio } from './audio/AudioManager';

interface StartupScreenProps {
  onStart: () => void;
}

const StartupScreen = ({ onStart }: StartupScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleInteraction = () => {
    // Avvia la musica del menu
    audio.play('MainMenu_Theme', { loop: true, volume: 0.5, fadeMs: 600 });

    // Inizia la transizione di dissolvenza
    setIsVisible(false);

    // Dopo che la transizione è finita, passa alla schermata successiva
    setTimeout(() => {
        onStart();
    }, 1000); // La durata del timeout deve corrispondere alla durata della transizione CSS
  };

  useEffect(() => {
    const handleKeyDown = () => {
      handleInteraction();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onStart]);

  return (
    <div
      onClick={handleInteraction}
      className={`
        fixed inset-0 bg-black flex flex-col items-center justify-center cursor-pointer
        transition-opacity duration-1000
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div className="text-center">
        <p className="text-white text-3xl font-bold">TAP per cominciare</p>
      </div>
    </div>
  );
};

export default StartupScreen;