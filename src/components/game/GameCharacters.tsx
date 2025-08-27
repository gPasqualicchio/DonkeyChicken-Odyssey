// src/components/game/GameCharacters.tsx

import { GameState, Direction } from "../../game";
import { GameAssets } from "@/config/Assets";
// 👇 Importiamo le costanti che ci servono
import { CELL_SIZE, GAP_SIZE, IS_DEBUG_MODE, ENEMY_HITBOX_RADIUS } from "@/config/Constants";

interface GameCharactersProps {
  gameState: GameState;
  assets: typeof GameAssets;
}

const GameCharacters = ({ gameState, assets }: GameCharactersProps) => {
  return (
    <>
      {/* GIOCATORE (invariato) */}
      <div
        className="absolute pointer-events-none z-20 transition-opacity duration-1000 ease-in-out"
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          left: gameState.playerPixelPosition.x,
          top: gameState.playerPixelPosition.y + 16,
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

      {/* NEMICI (con hitbox di debug) */}
      {gameState.enemies.map((enemy) => {
        return (
          <div
            key={enemy.id}
            className="absolute pointer-events-none transition-all duration-500 ease-out z-10"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: enemy.position.x * (CELL_SIZE + GAP_SIZE),
              top: enemy.position.y * (CELL_SIZE + GAP_SIZE) - 20,
              opacity: enemy.isAlive ? 1 : 0,
            }}
          >
            {/* Sprite del nemico */}
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={assets.enemies[enemy.type][enemy.direction]}
                alt={`Nemico ${enemy.type}`}
                className="w-10 h-10 object-contain drop-shadow-md"
              />
            </div>

            {/* 👇 Hitbox di debug del nemico, posizionata qui */}
            {IS_DEBUG_MODE && enemy.isAlive && (
                <div
                    className="absolute rounded-full border-2 border-orange-500 bg-orange-500/30"
                    style={{
                        width: ENEMY_HITBOX_RADIUS * 2,
                        height: ENEMY_HITBOX_RADIUS * 2,
                        left: '50%', // Centrata rispetto al div del nemico
                        top: '50%',  // Centrata rispetto al div del nemico
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