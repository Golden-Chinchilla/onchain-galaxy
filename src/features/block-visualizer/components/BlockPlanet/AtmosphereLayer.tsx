import React from "react";
import { AdditiveBlending, Color } from "three";
import type { PlanetConfig } from "../../types";

interface AtmosphereLayerProps {
  config: PlanetConfig;
}

export const AtmosphereLayer: React.FC<AtmosphereLayerProps> = ({ config }) => {
  const color = new Color(config.atmosphereColor);

  return (
    <mesh>
      <sphereGeometry args={[config.radius * 1.05, 64, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.25 + config.atmosphereIntensity * 0.4}
        blending={AdditiveBlending}
        side={2}
      />
    </mesh>
  );
};
