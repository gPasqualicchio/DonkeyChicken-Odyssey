// src/components/game/GameObjects.tsx

import React from 'react';
import { Level, GameState, SpittingTotem } from "../../game";
import { GameAssets } from "@/config/Assets";
import {
  CELL_SIZE,
  GAP_SIZE,
  PLAYER_HITBOX_RADIUS, // Importa qui il raggio del giocatore
  PROJECTILE_HITBOX_RADIUS,
  PROJECTILE_SPRITE_SIZE,
  IS_DEBUG_MODE // Importa la costante di debug
} from "@/config/Constants";
import totemSpriteDown from  "@/assets/ENEMY_totem_down.png";
import totemSpriteUp from    "@/assets/ENEMY_totem_up.png";
import totemSpriteLeft from  "@/assets/ENEMY_totem_left.png";
import totemSpriteRight from "@/assets/ENEMY_totem_right.png";
import projectileSprite from "@/assets/projectiles/totem_spit.png";

interface GameObjectsProps {
  level: Level;
  gameState: GameState;
  assets: typeof GameAssets;
}

const GameObjects = ({ level, gameState, assets }: GameObjectsProps) => {

      // 1. Funzione helper per scegliere lo sprite del totem
      const getTotemSprite = (direction: Direction) => {
        switch (direction) {
          case 'up': return totemSpriteUp;
          case 'down': return totemSpriteDown;
          case 'left': return totemSpriteLeft;
          case 'right': return totemSpriteRight;
          default: return totemSpriteDown; // Default nel caso la direzione non sia definita
        }
      };

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

      {/* RENDERIZZAZIONE DEI TOTEM (aggiornato) */}
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
                  {/* 2. Usiamo la funzione helper per impostare l'immagine corretta */}
                  <img src={getTotemSprite(totem.direction)} alt="Totem" className="w-full h-full object-contain" />
                </div>
            ))}

            {/* RENDERIZZAZIONE DEI PROIETTILI CON MOVIMENTO FLUIDO (aggiornato) */}
            {gameState.projectiles.map((projectile) => (
                <div
                  key={projectile.id}
                  className="absolute z-10"
                  style={{
                      left: projectile.position.x,
                      top: projectile.position.y,
                      transform: 'translate(-50%, -50%)',
                      width: PROJECTILE_SPRITE_SIZE,  // 3. Usiamo la costante
                      height: PROJECTILE_SPRITE_SIZE, // 3. Usiamo la costante
                  }}
                >
                  <img src={projectileSprite} alt="Proiettile" className="w-full h-full object-contain" />
                  {IS_DEBUG_MODE && (
                      <div
                          className="absolute rounded-full border-2 border-red-500 bg-red-500/30"
                          style={{
                              width: PROJECTILE_HITBOX_RADIUS * 2,
                              height: PROJECTILE_HITBOX_RADIUS * 2,
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                          }}
                      />
                  )}
                </div>
            ))}

            {/* DEBUG: Hitbox del Giocatore (aggiornato) */}
            {IS_DEBUG_MODE && (
                <div
                    className="absolute rounded-full border-2 border-green-500 bg-green-500/30 z-20"
                    style={{
                        width: PLAYER_HITBOX_RADIUS * 2,
                        height: PLAYER_HITBOX_RADIUS * 2,
                        left: gameState.playerPixelPosition.x, // Usa la posizione in pixel
                        top: gameState.playerPixelPosition.y,   // Usa la posizione in pixel
                        transform: 'translate(-50%, -50%)',
                        // 4. La transizione CSS non è più necessaria qui
                    }}
                />
            )}
    </>
  );
};

export default GameObjects;