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
  const seed = (config as any).visualSeed ?? 0;
  const color = useMemo(
    () => new THREE.Color(config.atmosphereColor),
    [config.atmosphereColor]
  );

  const innerMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const outerMatRef = useRef<THREE.ShaderMaterial | null>(null);

  const innerMat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: seed },
        uColor: { value: color },
        uIntensity: { value: 0.5 },
        uFresnelPower: { value: 2.1 },
        uAlpha: { value: 0.22 },
        uNoiseScale: { value: 1.3 },
        uNoiseStrength: { value: 0.08 },
      },
      vertexShader: `/* atmosphereMaterial vertex shader */`,
      fragmentShader: `/* atmosphereMaterial fragment shader */`,
    });
    innerMatRef.current = m;
    return m;
  }, [seed, color]);

  const outerMat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: seed },
        uColor: { value: color },
        uIntensity: { value: 1.0 },
        uFresnelPower: { value: 4.2 },
        uAlpha: { value: 0.35 },
        uNoiseScale: { value: 1.9 },
        uNoiseStrength: { value: 0.12 },
      },
      vertexShader: `/* atmosphereMaterial vertex shader */`,
      fragmentShader: `/* atmosphereMaterial fragment shader */`,
    });
    outerMatRef.current = m;
    return m;
  }, [seed, color]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (innerMatRef.current) innerMatRef.current.uniforms.uTime.value = t;
    if (outerMatRef.current) outerMatRef.current.uniforms.uTime.value = t;
  });

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
        <primitive attach="material" object={innerMat} />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[
            config.radius * 1.085,
            q.atmosphereSegments,
            q.atmosphereSegments,
          ]}
        />
        <primitive attach="material" object={outerMat} />
      </mesh>
    </>
  );
};
