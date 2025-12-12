import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BasePlanetLayerProps } from "./types";
import { useQuality } from "./quality/useQuality";

interface AtmosphereLayerProps extends BasePlanetLayerProps {}

export const AtmosphereLayer: React.FC<AtmosphereLayerProps> = ({
  config,
  quality = "high",
}) => {
  const q = useQuality(quality);
  const color = useMemo(
    () => new THREE.Color(config.atmosphereColor),
    [config.atmosphereColor]
  );

  const innerRef = useRef<any>(null);
  const outerRef = useRef<any>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (innerRef.current) innerRef.current.uniforms.uTime.value = t;
    if (outerRef.current) outerRef.current.uniforms.uTime.value = t;
  });

  const seed = (config as any).visualSeed ?? 0;

  // 内层：更低 alpha，更低 fresnelPower（“散射感”）
  // 外层：更高 fresnelPower（“边缘辉光”给 Bloom）
  return (
    <>
      <mesh>
        <sphereGeometry
          args={[
            config.radius * 1.03,
            q.atmosphereSegments,
            q.atmosphereSegments,
          ]}
        />
        <atmosphereMaterial
          ref={innerRef}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          uSeed={seed}
          uColor={color}
          uIntensity={0.55 + config.atmosphereIntensity * 0.35}
          uFresnelPower={2.1}
          uAlpha={0.18 + config.atmosphereIntensity * 0.12}
          uNoiseScale={1.3}
          uNoiseStrength={0.08}
        />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[
            config.radius * 1.085,
            q.atmosphereSegments,
            q.atmosphereSegments,
          ]}
        />
        <atmosphereMaterial
          ref={outerRef}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          uSeed={seed}
          uColor={color}
          uIntensity={0.95 + config.atmosphereIntensity * 0.55}
          uFresnelPower={4.2}
          uAlpha={0.28 + config.atmosphereIntensity * 0.18}
          uNoiseScale={1.9}
          uNoiseStrength={0.12}
        />
      </mesh>
    </>
  );
};
