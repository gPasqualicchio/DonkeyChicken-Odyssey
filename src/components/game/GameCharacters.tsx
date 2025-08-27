// src/components/game/GameCharacters.tsx

import { GameState, Direction } from "../../game";
import { GameAssets } from "@/config/Assets";
// Importa anche CHARACTER_Y_OFFSET per riferimento, anche se non la useremo direttamente qui
import { CELL_SIZE, GAP_SIZE, IS_DEBUG_MODE, ENEMY_HITBOX_RADIUS, CHARACTER_Y_OFFSET } from "@/config/Constants";

interface GameCharactersProps {
  gameState: GameState;
  assets: typeof GameAssets;
}

const GameCharacters = ({ gameState, assets }: GameCharactersProps) => {
  return (
    <>
      {/* GIOCATORE */}
      <div
        className="absolute pointer-events-none z-20 transition-opacity duration-1000 ease-in-out"
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          left: gameState.playerPixelPosition.x,
          top: gameState.playerPixelPosition.y,
          // 👇 MODIFICA CHIAVE QUI: Regoliamo il translateY per allineare i "piedi"
          // Se lo sprite è alto circa CELL_SIZE, e vogliamo i piedi al centro della hitbox
          // allora dobbiamo traslare di meno. Un valore come -83% o -90% funziona bene
          // per sprite che hanno una parte "vuota" in basso o che si estendono leggermente
          // sotto il centro visivo.
          transform: `translate(-50%, -50%) ${gameState.isMoving ? 'scale(1.1)' : 'scale(1)'}`, // Torniamo a -83% o prova -90%
          opacity: gameState.gameWon ? 0 : 1,
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          {gameState.isPlayerDead ? (
            <span className="text-4xl font-black text-red-600 drop-shadow-lg">X</span>
          ) : (
            <img
              src={assets.player[gameState.playerDirection]}
              alt="Personaggio"
              className="w-11 h-11 object-contain drop-shadow-lg"
            />
          )}
        </div>
      </div>

      {/* NEMICI */}
      {gameState.enemies.map((enemy) => {
        return (
          <div
            key={enemy.id}
            className="absolute pointer-events-none z-10"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: enemy.pixelPosition.x,
              top: enemy.pixelPosition.y,
              // 👇 MODIFICA CHIAVE QUI: Applichiamo lo stesso translateY
              transform: `translate(-50%, -40%)`, // Torniamo a -83% o prova -90%
              transition: 'opacity 500ms ease-out',
              opacity: enemy.isAlive ? 1 : 0,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={assets.enemies[enemy.type][enemy.direction]}
                alt={`Nemico ${enemy.type}`}
                className="w-10 h-10 object-contain drop-shadow-md"
              />
            </div>

            {/* Hitbox di debug - Già corretta, si centra sulla pixelPosition*/}
            {IS_DEBUG_MODE && enemy.isAlive && (
                <div
                    className="absolute rounded-full border-2 border-orange-500 bg-orange-500/30"
                    style={{
                        width: ENEMY_HITBOX_RADIUS * 2,
                        height: ENEMY_HITBOX_RADIUS * 2,
                        left: '50%',
                        top: '50%', // Questo centra la hitbox sul punto (pixelPosition.x, pixelPosition.y)
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            )}
          </div>
        );
      })}
    </>
  );
};

export default GameCharacters;