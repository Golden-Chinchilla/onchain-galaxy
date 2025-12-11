import React from "react";
import { DoubleSide } from "three";
import type { PlanetConfig } from "../../types";

interface RingLayerProps {
  config: PlanetConfig;
}

export const RingLayer: React.FC<RingLayerProps> = ({ config }) => {
  if (!config.ring.enabled) return null;

  const { innerRadius, outerRadius, color } = config.ring;

  return (
    <mesh rotation={[-Math.PI / 3, 0, 0]} receiveShadow>
      <ringGeometry args={[innerRadius, outerRadius, 128]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
        side={DoubleSide}
      />
    </mesh>
  );
};
