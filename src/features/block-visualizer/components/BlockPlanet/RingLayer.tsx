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
  const matRef = useRef<any>(null);

  const color = useMemo(
    () => new THREE.Color(config.ring.color),
    [config.ring.color]
  );
  const seed = (config as any).visualSeed ?? 0;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) meshRef.current.rotation.z += 0.0006; // 稳定慢转
    if (matRef.current) matRef.current.uniforms.uTime.value = t;
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
      <ringMaterial
        ref={matRef}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uSeed={seed}
        uColor={color}
        uIntensity={0.55 + Math.min(1, config.atmosphereIntensity) * 0.55}
        uBandFreq={quality === "high" ? 56.0 : quality === "mid" ? 46.0 : 38.0}
        uGrainStrength={quality === "high" ? 0.45 : 0.35}
      />
    </mesh>
  );
};
