// src/components/game/GameCharacters.tsx

import { GameState } from "../../game";
import { GameAssets } from "@/config/Assets";
import { CELL_SIZE, GAP_SIZE } from "@/config/Constants";

interface GameCharactersProps {
  gameState: GameState;
  assets: typeof GameAssets;
}

const GameCharacters = ({ gameState, assets }: GameCharactersProps) => {
  return (
    <>
{/* GIOCATORE */}
<div
  className="absolute pointer-events-none z-20" // Transizioni CSS rimosse, corretto
  style={{
    width: CELL_SIZE,
    height: CELL_SIZE,

    // Usa la posizione in pixel, corretto
    left: gameState.playerPixelPosition.x,
    top: gameState.playerPixelPosition.y +16,

    // 👇 MODIFICA CHIAVE: Usa un offset verticale calcolato per allineare lo sprite
    // Questo sposta lo sprite in modo che la sua posizione visiva corrisponda
    // all'offset originale di -20px, pur essendo ancorato alla hitbox fisica.
    transform: `translate(-50%, -83%) ${gameState.isMoving ? 'scale(1.1)' : 'scale(1)'}`,

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
        if (!enemy.isAlive) {
          return null;
        }
        return (
          <div
            key={enemy.id}
            className="absolute pointer-events-none transition-all duration-150 ease-out z-10"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: enemy.position.x * (CELL_SIZE + GAP_SIZE),
              top: enemy.position.y * (CELL_SIZE + GAP_SIZE) - 20,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={assets.enemies[enemy.type][enemy.direction]}
                alt={`Nemico ${enemy.type}`}
                className="w-10 h-10 object-contain drop-shadow-md"
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default GameCharacters;