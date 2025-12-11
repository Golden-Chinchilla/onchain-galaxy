import React from "react";
import type { PlanetConfig } from "../../types";

// 暂时只是一个占位，用于未来做点击/hover 检测的 “包围体”
interface CollidersProps {
  config: PlanetConfig;
  onClickPlanet?: () => void;
}

export const Colliders: React.FC<CollidersProps> = ({
  config,
  onClickPlanet,
}) => {
  return (
    <mesh onClick={onClickPlanet} visible={false}>
      <sphereGeometry args={[config.radius * 1.1, 32, 32]} />
      <meshBasicMaterial wireframe />
    </mesh>
  );
};
