import React from "react";
import type { PlanetConfig } from "../../types";
import { CoreSphere } from "./CoreSphere";
import { AtmosphereLayer } from "./AtmosphereLayer";
import { RingLayer } from "./RingLayer";
import { SatelliteLayer } from "./SatelliteLayer";
import { VolcanoLayer } from "./VolcanoLayer";
import { ParticleLayer } from "./ParticleLayer";
import { Colliders } from "./Colliders";

interface BlockPlanetProps {
  config: PlanetConfig;
  onClickPlanet?: () => void;
}

export const BlockPlanet: React.FC<BlockPlanetProps> = ({
  config,
  onClickPlanet,
}) => {
  return (
    <group>
      <CoreSphere config={config} />
      <AtmosphereLayer config={config} />
      <RingLayer config={config} />
      <SatelliteLayer config={config} />
      <VolcanoLayer config={config} />
      <ParticleLayer config={config} />
      <Colliders config={config} onClickPlanet={onClickPlanet} />
    </group>
  );
};
