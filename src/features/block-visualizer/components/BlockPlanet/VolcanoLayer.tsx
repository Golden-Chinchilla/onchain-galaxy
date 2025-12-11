import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { PlanetConfig } from "../../types";
import { InstancedMesh, Matrix4, Color } from "three";

interface VolcanoLayerProps {
  config: PlanetConfig;
}

const VOLCANO_COUNT = 24;

export const VolcanoLayer: React.FC<VolcanoLayerProps> = ({ config }) => {
  const meshRef = React.useRef<InstancedMesh>(null);
  const dummyMat = useMemo(() => new Matrix4(), []);
  const color = new Color(config.volcano.glowColor);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < VOLCANO_COUNT; i++) {
      const lat = (Math.acos(2 * (i / VOLCANO_COUNT) - 1) - Math.PI / 2) * 0.8;
      const lon = ((i / VOLCANO_COUNT) * Math.PI * 4 + t * 0.6) % (Math.PI * 2);
      const r = config.radius * 1.001;
      const x = r * Math.cos(lat) * Math.cos(lon);
      const y = r * Math.sin(lat);
      const z = r * Math.cos(lat) * Math.sin(lon);
      dummyMat.makeTranslation(x, y, z);
      meshRef.current.setMatrixAt(i, dummyMat);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!config.volcano.enabled) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined as any, undefined as any, VOLCANO_COUNT]}
    >
      <sphereGeometry args={[config.radius * 0.03, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </instancedMesh>
  );
};
