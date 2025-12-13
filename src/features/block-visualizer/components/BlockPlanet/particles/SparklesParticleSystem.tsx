import React from "react";
import { Sparkles } from "@react-three/drei";
import type { ParticleSystemProps } from "./types";

export const SparklesParticleSystem: React.FC<ParticleSystemProps> = ({
  count,
  radius,
  color,
  size = 0.04,
}) => {
  return (
    <Sparkles
      count={count}
      size={size}
      speed={0.6}
      opacity={0.7}
      noise={2}
      color={color}
      scale={radius}
    />
  );
};
