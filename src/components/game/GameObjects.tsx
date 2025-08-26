// src/components/game/GameObjects.tsx

import { Level, GameState } from "../../game";
import { GameAssets } from "@/config/Assets";
import { CELL_SIZE, GAP_SIZE } from "@/config/Constants";

interface GameObjectsProps {
  level: Level;
  gameState: GameState;
  assets: typeof GameAssets;
}

const GameObjects = ({ level, gameState, assets }: GameObjectsProps) => {
  return (
    <>
      {/* RENDERIZZAZIONE DELLE CHIAVI */}
      {level.keys.map((key) => {
        if (!gameState.hasKeyCollected.includes(key.id)) {
          return (
            <div
              key={key.id}
              className="absolute z-10"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                left: key.position.x * (CELL_SIZE + GAP_SIZE),
                top: key.position.y * (CELL_SIZE + GAP_SIZE),
              }}
            >
              <img
                src={assets.tiles.key}
                alt="Chiave"
                className="w-full h-full object-contain"
              />
            </div>
          );
        }
        return null;
      })}

      {/* RENDERIZZAZIONE DELLE PORTE */}
      {level.doors.map((door) => {
        if (!gameState.isDoorUnlocked.includes(door.id)) {
          return (
            <div
              key={door.id}
              className="absolute z-10"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                left: door.position.x * (CELL_SIZE + GAP_SIZE),
                top: door.position.y * (CELL_SIZE + GAP_SIZE),
              }}
            >
              <img
                src={assets.tiles.portal}
                alt="Porta Chiusa"
                className="w-full h-full object-contain"
              />
            </div>
          );
        }
        return null;
      })}

      {/* RENDERIZZAZIONE DELLE LEVE (Esempio) */}
      {level.levers.map((lever) => (
        <div
          key={lever.id}
          className="absolute z-10"
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: lever.position.x * (CELL_SIZE + GAP_SIZE),
            top: lever.position.y * (CELL_SIZE + GAP_SIZE),
          }}
        >
          {/* Sostituisci con l'immagine della leva */}
          <img src={assets.tiles.lever} alt="Leva" className="w-full h-full object-contain" />
        </div>
      ))}
    </>
  );
};

export default GameObjects;