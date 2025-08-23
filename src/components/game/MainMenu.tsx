import { Button } from "@/components/ui/button";

// --- CORREZIONE PER L'ANTEPRIMA ---
// L'ambiente di anteprima non può accedere ai tuoi file locali.
// Per far funzionare il codice qui, usiamo un URL pubblico per l'immagine di sfondo.
// Quando userai questo codice nel tuo progetto, DECOMMENTA la riga 'import'
// e COMMENTA la costante 'mainMenuBackground' per usare la tua immagine locale.

 import mainMenuBackground from '@/assets/SfondoCiuco1.png';

interface MainMenuProps {
  onStartNewGame: () => void;
}

const MainMenu = ({ onStartNewGame }: MainMenuProps) => {
  return (
    // Questo contenitore principale ora imposta lo sfondo specifico per il menu.
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center"
      style={{
        backgroundImage: `url(${mainMenuBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Il resto del contenuto del menu rimane invariato */}
      <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-4 text-white">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 text-center">
          <h1 className="text-6xl font-bold mb-4">Forest Adventure Quest</h1>
          <p className="text-xl text-green-200">Un'avventura in una foresta misteriosa</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button
            onClick={onStartNewGame}
            className="text-lg py-6 bg-green-600/80 hover:bg-green-500/80 shadow-lg border-green-400/50"
          >
            Nuova Partita
          </Button>
          <Button disabled className="text-lg py-6">
            Continua Partita
          </Button>
          <Button disabled className="text-lg py-6">
            Opzioni
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
