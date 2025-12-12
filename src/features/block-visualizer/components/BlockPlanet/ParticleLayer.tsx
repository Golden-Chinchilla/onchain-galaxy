import React from "react";
import type { BasePlanetLayerProps } from "./types";
import { SparklesParticleSystem } from "./particles/SparklesParticleSystem";

interface ParticleLayerProps extends BasePlanetLayerProps {}

export const ParticleLayer: React.FC<ParticleLayerProps> = ({
  config,
  quality = "high",
}) => {
  // 👉 以后 quality 会在这里决定使用哪种粒子系统
  // const systemType = quality === "high" ? "gpu" : "sparkles";

  const color = config.era === "pos" ? "#38bdf8" : "#f97316";

  return (
    <SparklesParticleSystem
      count={config.particles.count}
      radius={config.particles.spreadRadius}
      color={color}
    />
  );
};
