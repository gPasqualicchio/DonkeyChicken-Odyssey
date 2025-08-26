import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

import mainMenuBackground from '@/assets/SfondoCiuco1.png';
import titleImage from '@/assets/MainPageTitle3.png';

// 1. Aggiorniamo le props per includere la funzione per continuare
interface MainMenuProps {
  onStartNewGame: () => void;
  onContinueGame: () => void;
}

const MainMenu = ({ onStartNewGame, onContinueGame }: MainMenuProps) => {
  const [animationState, setAnimationState] = useState('loading');

  // 2. Controlliamo se esiste un salvataggio per abilitare il pulsante
  const savedLevelIndex = localStorage.getItem('lastLevelIndex');
  const canContinue = savedLevelIndex ? parseInt(savedLevelIndex, 10) > 0 : false;

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationState('animating'), 2000);
    const timer2 = setTimeout(() => setAnimationState('loaded'), 3000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const mainContainerClasses = `
    absolute inset-0 w-full h-full flex flex-col p-8 transition-all duration-1000
    ${animationState === 'loaded' ? 'items-start justify-end' : 'items-center justify-center'}
  `;

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      <div
        className="absolute inset-0 w-full h-full transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${mainMenuBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: animationState === 'loaded' ? 1 : 0,
        }}
      />
      <div className={mainContainerClasses}>
        <div
          className={`
            flex flex-col gap-4 w-full max-w-xs
            transition-all duration-1000
            ${animationState === 'loaded' ? 'opacity-100' : 'opacity-0 -translate-y-4'}
          `}
        >
          <Button
            onClick={onStartNewGame}
            className="text-lg py-6 bg-green-600/80 hover:bg-green-500/80 shadow-lg border-green-400/50"
          >
            Nuova Partita
          </Button>

          {/* 3. Il pulsante ora è funzionale */}
          <Button
            onClick={onContinueGame}
            disabled={!canContinue}
            className="text-lg py-6"
          >
            Continua Partita
          </Button>

          <Button disabled className="text-lg py-6">
            Opzioni
          </Button>
        </div>
      </div>
      <div
        className={`
          absolute inset-0 w-full h-full bg-black z-10
          transition-opacity duration-1000
          ${animationState === 'loaded' ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
      />
      <img
        src={titleImage}
        alt="DonkeyChicken Odyssey Title"
        className={`
          absolute transition-all duration-1000 ease-in-out z-20
          ${animationState === 'loading'
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl h-auto'
              : 'top-8 left-8 -translate-x-0 -translate-y-0 w-[300px] h-auto'
          }
        `}
      />
    </div>
  );
};

export default MainMenu;