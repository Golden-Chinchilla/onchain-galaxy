import type { PlanetConfig } from "../../types";
import type { QualityLevel } from "./quality/qualityConfig";

export interface BasePlanetLayerProps {
  config: PlanetConfig;
  quality?: QualityLevel;
}
