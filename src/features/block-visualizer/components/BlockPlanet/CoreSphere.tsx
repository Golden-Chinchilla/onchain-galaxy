import React from "react";
import type { ThreeElements } from "@react-three/fiber";
import { Color } from "three";
import type { PlanetConfig } from "../../types";

type MeshProps = ThreeElements["mesh"];

interface CoreSphereProps extends MeshProps {
  config: PlanetConfig;
}

export const CoreSphere: React.FC<CoreSphereProps> = ({ config, ...rest }) => {
  const color = new Color(config.surfaceColor);

  return (
    <mesh {...rest} castShadow receiveShadow>
      <sphereGeometry args={[config.radius, 128, 128]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
    </mesh>
  );
};
