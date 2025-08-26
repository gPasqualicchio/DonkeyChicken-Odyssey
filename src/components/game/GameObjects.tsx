// src/components/game/GameObjects.tsx

import React from 'react';
import { Level, GameState, SpittingTotem } from "../../game";
import { GameAssets } from "@/config/Assets";
import {
  CELL_SIZE,
  GAP_SIZE,
  PLAYER_HITBOX_RADIUS, // Importa qui il raggio del giocatore
  PROJECTILE_HITBOX_RADIUS,
  IS_DEBUG_MODE // Importa la costante di debug
} from "@/config/Constants";
import totemSprite from "@/assets/ENEMY_totem_down.png";
import projectileSprite from "@/assets/projectiles/totem_spit.png";

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
        if (gameState.hasKeyCollected.includes(key.id)) {
          return null;
        }
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
      })}

      {/* RENDERIZZAZIONE DELLE PORTE */}
      {level.doors.map((door) => {
        if (gameState.isDoorUnlocked.includes(door.id)) {
          return null;
        }
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
      })}

      {/* RENDERIZZAZIONE DELLE LEVE */}
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
          <img src={assets.tiles.lever} alt="Leva" className="w-full h-full object-contain" />
        </div>
      ))}

      {/* RENDERIZZAZIONE DEI TOTEM */}
      {gameState.spittingTotems.map((totem) => (
          <div
            key={totem.id}
            className="absolute z-10"
            style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                left: totem.position.x * (CELL_SIZE + GAP_SIZE),
                top: totem.position.y * (CELL_SIZE + GAP_SIZE),
            }}
          >
            <img src={totemSprite} alt="Totem" className="w-full h-full object-contain" />
          </div>
      ))}

 {/* RENDERIZZAZIONE DEI PROIETTILI CON MOVIMENTO FLUIDO */}
      {gameState.projectiles.map((projectile) => (
          <div
            key={projectile.id}
            className="absolute z-10"
            style={{
                left: projectile.position.x,
                top: projectile.position.y,
                transform: 'translate(-50%, -50%)',
                width: 24,
                height: 24,
            }}
          >
            <img src={projectileSprite} alt="Proiettile" className="w-full h-full object-contain" />

            {/* DEBUG: Hitbox del Proiettile */}
            {IS_DEBUG_MODE && (
                <div
                    className="absolute rounded-full border-2 border-red-500 bg-red-500/30"
                    style={{
                        width: PROJECTILE_HITBOX_RADIUS * 2,  // Diametro = Raggio * 2
                        height: PROJECTILE_HITBOX_RADIUS * 2, // Diametro = Raggio * 2
                        left: '50%', // Centra rispetto al proiettile padre
                        top: '50%',  // Centra rispetto al proiettile padre
                        transform: 'translate(-50%, -50%)', // Sposta per centrare il cerchio
                    }}
                />
            )}
          </div>
      ))}

{IS_DEBUG_MODE && (
    <div
        className="absolute rounded-full border-2 border-green-500 bg-green-500/30 z-20"
        style={{
            width: PLAYER_HITBOX_RADIUS * 2,
            height: PLAYER_HITBOX_RADIUS * 2,
            left: gameState.playerPosition.x * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2),
            top: gameState.playerPosition.y * (CELL_SIZE + GAP_SIZE) + (CELL_SIZE / 2) - 16,
            transform: 'translate(-50%, -50%)',
            // 👇 AGGIUNGI QUESTA RIGA 👇
            transition: 'top 150ms linear, left 150ms linear',
        }}
    />
)}
    </>
  );
};

export default GameObjects;