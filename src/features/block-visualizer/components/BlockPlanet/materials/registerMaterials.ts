import { extend } from "@react-three/fiber";
import { PlanetSurfaceMaterial } from "./planetSurfaceMaterial";
import { AtmosphereMaterial } from "./atmosphereMaterial";
import { RingMaterial } from "./ringMaterial";
import { VolcanoMaterial } from "./volcanoMaterial";

extend({
  PlanetSurfaceMaterial,
  AtmosphereMaterial,
  RingMaterial,
  VolcanoMaterial,
});
