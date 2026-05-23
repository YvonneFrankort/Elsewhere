// src/map/layers/index.ts
import { discoveryRings } from "./discoveryRings";
import { discoveryIcons } from "./discoveryIcons";
import { baseTerrain } from "./baseTerrain";
import { base3D } from "./base3D";
import { baseSky } from "./baseSky";

export const layersRegistry = [
  baseTerrain,
  base3D,
  baseSky,
  discoveryRings,
  discoveryIcons
];
