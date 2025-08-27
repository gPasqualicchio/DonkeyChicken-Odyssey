import { Direction } from '../game/game';

// Importa tutte le immagini qui, una sola volta
import forestBackground from '@/assets/forest-background.jpg';

import keySprite from "@/assets/key_gold_SIMPLE.png";
import portalSprite from "@/assets/portal_forest_1.png";

import treeSprite from "@/assets/tree-sprite.png";
import FOREST_tree_full from '@/assets/trees/FOREST_tree_full.png';
import FOREST_tree_up from '@/assets/trees/FOREST_tree_up.png';
import FOREST_tree_down from '@/assets/trees/FOREST_tree_down.png';
import FOREST_tree_left from '@/assets/trees/FOREST_tree_left.png';
import FOREST_tree_right from '@/assets/trees/FOREST_tree_right.png';
import FOREST_tree_left_right from '@/assets/trees/FOREST_tree_left_right.png';
import FOREST_tree_right_right from '@/assets/trees/FOREST_tree_right_right.png';
import FOREST_tree_left_left from '@/assets/trees/FOREST_tree_left_left.png';
import FOREST_tree_up_down from '@/assets/trees/FOREST_tree_up_down.png';
import FOREST_tree_up_up from '@/assets/trees/FOREST_tree_up_up.png';
import FOREST_tree_down_down from '@/assets/trees/FOREST_tree_down_down.png';
import FOREST_tree_corner_up_left from '@/assets/trees/FOREST_tree_up_left.png';
import FOREST_tree_corner_up_right from '@/assets/trees/FOREST_tree_right_up.png';
import FOREST_tree_corner_down_left from '@/assets/trees/FOREST_tree_down_left.png';
import FOREST_tree_corner_down_right from '@/assets/trees/FOREST_tree_down_right.png';
import FOREST_tree_solo from '@/assets/trees/FOREST_tree_single.png';
import FOREST_tree_default from '@/assets/trees/FOREST_tree_single.png'; // Fallback


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
    },
    trees: {
        FOREST_tree_full: FOREST_tree_full,
        FOREST_tree_up: FOREST_tree_up,
        FOREST_tree_down: FOREST_tree_down,
        FOREST_tree_left: FOREST_tree_left,
        FOREST_tree_right: FOREST_tree_right,
        FOREST_tree_left_right: FOREST_tree_left_right,
        FOREST_tree_right_right: FOREST_tree_right_right,
        FOREST_tree_left_left: FOREST_tree_left_left,
        FOREST_tree_up_down: FOREST_tree_up_down,
        FOREST_tree_up_up: FOREST_tree_up_up,
        FOREST_tree_down_down: FOREST_tree_down_down,
        FOREST_tree_corner_up_left: FOREST_tree_corner_up_left,
        FOREST_tree_corner_up_right: FOREST_tree_corner_up_right,
        FOREST_tree_corner_down_left: FOREST_tree_corner_down_left,
        FOREST_tree_corner_down_right: FOREST_tree_corner_down_right,
        FOREST_tree_solo: FOREST_tree_solo,
        FOREST_tree_edge_top: FOREST_tree_up,
        FOREST_tree_edge_bottom: FOREST_tree_down,
        FOREST_tree_edge_left: FOREST_tree_left,
        FOREST_tree_edge_right: FOREST_tree_right,
        FOREST_tree_default: FOREST_tree_default,
      }
  }
};