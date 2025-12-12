import React from "react";
import type { BasePlanetLayerProps } from "./types";

interface CollidersProps extends BasePlanetLayerProps {
  onClickPlanet?: () => void;
}

export const Colliders: React.FC<CollidersProps> = ({
  config,
  quality,
  onClickPlanet,
}) => {
  return (
    <mesh onClick={onClickPlanet} visible={false}>
      <sphereGeometry args={[config.radius * 1.1, 32, 32]} />
      <meshBasicMaterial wireframe />
    </mesh>
  );
};
