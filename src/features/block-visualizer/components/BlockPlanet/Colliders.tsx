import React from "react";
import type { BasePlanetLayerProps } from "./types";

interface CollidersProps extends BasePlanetLayerProps {
  onClickPlanet?: () => void;
  onHoverChange?: (hover: boolean) => void;
}

export const Colliders: React.FC<CollidersProps> = ({
  config,
  quality,
  onClickPlanet,
  onHoverChange,
}) => {
  return (
    <mesh
      onClick={onClickPlanet}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHoverChange?.(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHoverChange?.(false);
      }}
    >
      <sphereGeometry args={[config.radius * 1.1, 32, 32]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};
