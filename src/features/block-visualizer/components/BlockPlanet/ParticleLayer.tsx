import React, { useMemo } from "react";
import type { BasePlanetLayerProps } from "./types";
import { useQuality } from "./quality/useQuality";
import { SparklesParticleSystem } from "./particles/SparklesParticleSystem";
import { InstancedSpriteParticleSystem } from "./particles/InstancedSpriteParticleSystem";
import { GPUParticleSystem } from "./particles/gpu/GPUParticleSystem";
import { getGpuLodPreset } from "./particles/gpu/lod";
import { useThree } from "@react-three/fiber";

interface ParticleLayerProps extends BasePlanetLayerProps {}

type Quality = "low" | "mid" | "high";

export const ParticleLayer: React.FC<ParticleLayerProps> = ({
  config,
  quality = "low",
}) => {
  const qualityU = quality as Quality;

  const q = useQuality(qualityU);
  const { gl } = useThree();
  const dpr = gl.getPixelRatio();

  const color = config.era === "pos" ? "#38bdf8" : "#f97316";

  const count = useMemo(() => {
    const base = config.particles.count;
    const mult = q.particleMultiplier ?? 1.0;
    return Math.max(80, Math.floor(base * mult));
  }, [config.particles.count, q.particleMultiplier]);

  const size = config.particles.size;

  if (qualityU === "low") {
    return (
      <SparklesParticleSystem
        count={count}
        radius={config.particles.spreadRadius}
        color={color}
        size={size}
      />
    );
  }

  if (qualityU === "high") {
    const preset = getGpuLodPreset(qualityU, dpr);
    const lodCount = Math.max(64, Math.floor(count * preset.countMultiplier));

    return (
      <GPUParticleSystem
        count={lodCount}
        radius={config.particles.spreadRadius}
        color={color}
        seed={(config as any).visualSeed ?? 0}
        noiseScale={(config.particles as any).noiseScale}
        noiseStrength={(config.particles as any).noiseStrength}
        flowSpeed={(config.particles as any).flowSpeed}
        lifeDecay={(config.particles as any).lifeDecay}
        boundsRadius={(config.particles as any).boundsRadius}
        respawnRadius={(config.particles as any).respawnRadius}
        enableTrails={preset.enableTrails}
        historyLength={preset.historyLength}
        particleStep={preset.particleStep}
        segmentStep={preset.segmentStep}
        pointSize={preset.pointSize}
      />
    );
  }

  // mid
  return (
    <InstancedSpriteParticleSystem
      count={count}
      radius={config.particles.spreadRadius}
      color={color}
      size={Math.max(0.04, size)}
    />
  );
};
