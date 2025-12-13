import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BasePlanetLayerProps } from "./types";
import { useQuality } from "./quality/useQuality";

interface RingLayerProps extends BasePlanetLayerProps {}

export const RingLayer: React.FC<RingLayerProps> = ({
  config,
  quality = "high",
}) => {
  const q = useQuality(quality);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const seed = (config as any).visualSeed ?? 0;
  const color = useMemo(
    () => new THREE.Color(config.ring.color),
    [config.ring.color]
  );

  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: seed },
        uColor: { value: color },
        uIntensity: { value: 0.7 },
        uBandFreq: { value: quality === "high" ? 56.0 : 42.0 },
        uGrainStrength: { value: quality === "high" ? 0.45 : 0.35 },
      },
      vertexShader: `/* ringMaterial vertex shader */`,
      fragmentShader: `/* ringMaterial fragment shader */`,
    });

    materialRef.current = mat;
    return mat;
  }, [seed, color, quality]);

  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.z += 0.0006;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  if (!config.ring.enabled) return null;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]}>
      <ringGeometry
        args={[
          config.ring.innerRadius,
          config.ring.outerRadius,
          q.ringSegments,
        ]}
      />
      <primitive attach="material" object={material} />
    </mesh>
  );
};
