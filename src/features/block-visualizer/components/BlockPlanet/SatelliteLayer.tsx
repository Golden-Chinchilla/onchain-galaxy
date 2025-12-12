import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import type { BasePlanetLayerProps } from "./types";

interface SatelliteLayerProps extends BasePlanetLayerProps {}

export const SatelliteLayer: React.FC<SatelliteLayerProps> = ({ config }) => {
  const groupRef = React.useRef<Group>(null);

  const satellites = useMemo(
    () =>
      new Array(config.satellites.count).fill(0).map((_, i) => ({
        phase: (i / config.satellites.count) * Math.PI * 2,
      })),
    [config.satellites.count]
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, index) => {
      const { phase } = satellites[index];
      const angle = t * 0.3 + phase;
      const r = config.satellites.orbitRadius;
      child.position.set(
        Math.cos(angle) * r,
        0.3 * Math.sin(angle * 1.2),
        Math.sin(angle) * r
      );
      child.rotation.y = angle * 2;
    });
  });

  return (
    <group ref={groupRef}>
      {satellites.map((_, idx) => (
        <mesh key={idx} castShadow>
          <sphereGeometry args={[config.satellites.radius, 32, 32]} />
          <meshStandardMaterial
            color={config.coreColor}
            emissive={config.coreColor}
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};
