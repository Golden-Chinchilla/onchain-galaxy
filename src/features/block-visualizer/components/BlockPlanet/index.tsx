import React from "react";
import type { PlanetConfig, TransactionInfo } from "../../types";
import type { QualityLevel } from "./quality/qualityConfig";
import { CoreSphere } from "./CoreSphere";
import { AtmosphereLayer } from "./AtmosphereLayer";
import { RingLayer } from "./RingLayer";
import { TransactionSatelliteLayer } from "./TransactionSatelliteLayer";
import { VolcanoLayer } from "./VolcanoLayer";
import { Colliders } from "./Colliders";
import "./materials/registerMaterials";

interface BlockPlanetProps {
  config: PlanetConfig;
  quality?: QualityLevel;
  onClickPlanet?: () => void;
  transactions?: TransactionInfo[];
}

export const BlockPlanet: React.FC<BlockPlanetProps> = ({
  config,
  quality = "high",
  onClickPlanet,
  transactions,
}) => {
  return (
    <group>
      <CoreSphere config={config} quality={quality} />
      <AtmosphereLayer config={config} quality={quality} />
      <RingLayer config={config} quality={quality} />
      <TransactionSatelliteLayer
        config={config}
        quality={quality}
        transactions={transactions}
      />
      <VolcanoLayer config={config} quality={quality} />
      <Colliders
        config={config}
        quality={quality}
        onClickPlanet={onClickPlanet}
      />
    </group>
  );
};
