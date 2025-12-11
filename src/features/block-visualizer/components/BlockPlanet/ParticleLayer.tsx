import React from "react";
import { Sparkles } from "@react-three/drei";
import type { PlanetConfig } from "../../types";

interface ParticleLayerProps {
  config: PlanetConfig;
}

export const ParticleLayer: React.FC<ParticleLayerProps> = ({ config }) => {
  return (
    <Sparkles
      count={config.particles.count}
      size={config.particles.size}
      speed={0.6}
      opacity={0.7}
      noise={2}
      color={config.era === "pos" ? "#38bdf8" : "#f97316"}
      scale={config.particles.spreadRadius}
    />
  );
};
