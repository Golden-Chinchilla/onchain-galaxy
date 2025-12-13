import { Object3DNode } from "@react-three/fiber";
import { PlanetSurfaceMaterial } from "./planetSurfaceMaterial";
import { AtmosphereMaterial } from "./atmosphereMaterial";
import { RingMaterial } from "./ringMaterial";
import { VolcanoMaterial } from "./volcanoMaterial";

declare module "@react-three/fiber" {
  interface ThreeElements {
    planetSurfaceMaterial: Object3DNode<
      PlanetSurfaceMaterial,
      typeof PlanetSurfaceMaterial
    >;
    atmosphereMaterial: Object3DNode<
      AtmosphereMaterial,
      typeof AtmosphereMaterial
    >;
    ringMaterial: Object3DNode<RingMaterial, typeof RingMaterial>;
    volcanoMaterial: Object3DNode<VolcanoMaterial, typeof RingMaterial>;
  }
}
