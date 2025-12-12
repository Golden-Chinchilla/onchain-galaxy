import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BasePlanetLayerProps } from "./types";

type PlanetSurfaceMat = THREE.ShaderMaterial & {
  uniforms: {
    uTime: { value: number };
    uSurfaceColor: { value: THREE.Color };
    uCoreColor: { value: THREE.Color };
    uNoiseScale: { value: number };
    uNoiseStrength: { value: number };
    uFresnelPower: { value: number };
    uFresnelIntensity: { value: number };
  };
};

interface CoreSphereProps extends BasePlanetLayerProps {}

export const CoreSphere: React.FC<CoreSphereProps> = ({ config, quality }) => {
  const matRef = useRef<PlanetSurfaceMat | null>(null);

  const surfaceColor = useMemo(
    () => new THREE.Color(config.surfaceColor),
    [config.surfaceColor]
  );
  const coreColor = useMemo(
    () => new THREE.Color(config.coreColor),
    [config.coreColor]
  );

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[config.radius, 128, 128]} />

      <planetSurfaceMaterial
        ref={matRef as any}
        uSeed={config.visualSeed}
        uSurfaceColor={surfaceColor}
        uCoreColor={coreColor}
        uNoiseScale={config.era === "pos" ? 2.4 : 2.0}
        uNoiseStrength={0.18 + config.atmosphereIntensity * 0.18}
        uFresnelPower={2.2}
        uFresnelIntensity={0.45 + config.atmosphereIntensity * 0.35}
      />
    </mesh>
  );
};
