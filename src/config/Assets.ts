// src/config/Assets.ts

import { Direction } from '../game/game';

// Importa tutte le immagini qui, una sola volta
import forestBackground from '@/assets/forest-background.jpg';
import treeSprite from "@/assets/tree-sprite.png";
import keySprite from "@/assets/key_gold_SIMPLE.png";
import portalSprite from "@/assets/portal_forest_1.png";

// Giocatore
import playerSpriteDown from "@/assets/donkeychicken_M_down.png";
import playerSpriteUp from "@/assets/donkeychicken_M_up.png";
import playerSpriteLeft from "@/assets/donkeychicken_M_left.png";
import playerSpriteRight from "@/assets/donkeychicken_M_right.png";

// Nemici
import brucoSpriteDown from "@/assets/ENEMY_bruco_down.png";
import brucoSpriteUp from "@/assets/ENEMY_bruco_up.png";
import brucoSpriteLeft from "@/assets/ENEMY_bruco_left.png";
import brucoSpriteRight from "@/assets/ENEMY_bruco_right.png";

// Percorsi
import pathHorizontalSprite from "@/assets/Forest_Path_Horizontal.png";
import pathVerticalSprite from "@/assets/Forest_Path_Vertical.png";
import pathCurve1Sprite from "@/assets/Forest_Path_Curve_1.png";
import pathCurve2Sprite from "@/assets/Forest_Path_Curve_2.png";
import pathCurve3Sprite from "@/assets/Forest_Path_Curve_3.png";
import pathCurve4Sprite from "@/assets/Forest_Path_Curve_4.png";
import pathClose1Sprite from "@/assets/Forest_Path_Close_1.png";
import pathClose2Sprite from "@/assets/Forest_Path_Close_2.png";
import pathClose3Sprite from "@/assets/Forest_Path_Close_3.png";
import pathClose4Sprite from "@/assets/Forest_Path_Close_4.png";
import pathT1Sprite from "@/assets/Forest_Path_T_1.png";
import pathT2Sprite from "@/assets/Forest_Path_T_2.png";
import pathT3Sprite from "@/assets/Forest_Path_T_3.png";
import pathT4Sprite from "@/assets/Forest_Path_T_4.png";
import pathCrossSprite from "@/assets/Forest_Path_Cross.png";

// Catalogo degli sprite di gioco
export const GameAssets = {
  background: {
    forest: forestBackground,
  },
  player: {
    down: playerSpriteDown,
    up: playerSpriteUp,
    left: playerSpriteLeft,
    right: playerSpriteRight,
  },
  enemies: {
    bruco: {
      down: brucoSpriteDown,
      up: brucoSpriteUp,
      left: brucoSpriteLeft,
      right: brucoSpriteRight,
    },
    // Qui aggiungerai altri tipi di nemici
  },
  tiles: {
    obstacle: treeSprite,
    key: keySprite,
    portal: portalSprite,
    path: {
      horizontal: pathHorizontalSprite,
      vertical: pathVerticalSprite,
      curve1: pathCurve1Sprite,
      curve2: pathCurve2Sprite,
      curve3: pathCurve3Sprite,
      curve4: pathCurve4Sprite,
      close1: pathClose1Sprite,
      close2: pathClose2Sprite,
      close3: pathClose3Sprite,
      close4: pathClose4Sprite,
      t1: pathT1Sprite,
      t2: pathT2Sprite,
      t3: pathT3Sprite,
      t4: pathT4Sprite,
      cross: pathCrossSprite,
    }
  }
};