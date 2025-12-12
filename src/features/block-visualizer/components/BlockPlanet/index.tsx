import React from "react";
import type { PlanetConfig } from "../../types";
import type { QualityLevel } from "./quality/qualityConfig";
import { CoreSphere } from "./CoreSphere";
import { AtmosphereLayer } from "./AtmosphereLayer";
import { RingLayer } from "./RingLayer";
import { SatelliteLayer } from "./SatelliteLayer";
import { VolcanoLayer } from "./VolcanoLayer";
import { ParticleLayer } from "./ParticleLayer";
import { Colliders } from "./Colliders";
import "./materials/registerMaterials";

interface BlockPlanetProps {
  config: PlanetConfig;
  quality?: QualityLevel;
  onClickPlanet?: () => void;
}

export const BlockPlanet: React.FC<BlockPlanetProps> = ({
  config,
  quality = "high",
  onClickPlanet,
}) => {
  return (
    <group>
      <CoreSphere config={config} quality={quality} />
      <AtmosphereLayer config={config} quality={quality} />
      <RingLayer config={config} quality={quality} />
      <SatelliteLayer config={config} quality={quality} />
      <VolcanoLayer config={config} quality={quality} />
      <ParticleLayer config={config} quality={quality} />
      <Colliders
        config={config}
        quality={quality}
        onClickPlanet={onClickPlanet}
      />
    </group>
  );
};
