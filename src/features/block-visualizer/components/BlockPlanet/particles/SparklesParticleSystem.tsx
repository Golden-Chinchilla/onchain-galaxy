import React from "react";
import { Sparkles } from "@react-three/drei";
import type { ParticleSystemProps } from "./types";

interface SparklesParticleSystemProps extends ParticleSystemProps {
  color: string;
}

export const SparklesParticleSystem: React.FC<SparklesParticleSystemProps> = ({
  count,
  radius,
  color,
}) => {
  return (
    <Sparkles
      count={count}
      size={0.04}
      speed={0.6}
      opacity={0.7}
      noise={2}
      color={color}
      scale={radius}
    />
  );
};
