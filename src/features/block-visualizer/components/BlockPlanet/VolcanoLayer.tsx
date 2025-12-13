import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BasePlanetLayerProps } from "./types";
import { useQuality } from "./quality/useQuality";

interface VolcanoLayerProps extends BasePlanetLayerProps {}

export const VolcanoLayer: React.FC<VolcanoLayerProps> = ({
  config,
  quality = "high",
}) => {
  const q = useQuality(quality);
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const seed = (config as any).visualSeed ?? 0;
  const color = useMemo(
    () => new THREE.Color(config.volcano.glowColor),
    [config.volcano.glowColor]
  );

  const count = useMemo(() => {
    const base = 72;
    const mult = q.particleMultiplier ?? 1.0;
    return Math.max(24, Math.floor(base * mult));
  }, [q]);

  // 初始化实例矩阵
  useMemo(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();

    const theta = (seed * Math.PI * 2) % (Math.PI * 2);
    const phi = 0.8 + ((seed * 1.3) % 0.9);

    const baseDir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    ).normalize();

    const basePos = baseDir.clone().multiplyScalar(config.radius * 1.01);

    for (let i = 0; i < count; i++) {
      const jitter = new THREE.Vector3(
        (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.5) * 0.25
      );

      const pos = basePos.clone().add(jitter);
      const outward = pos.clone().normalize();

      dummy.position.copy(pos);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), outward);
      dummy.scale.setScalar(1);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [config.radius, count, seed]);

  const intensity = THREE.MathUtils.clamp(config.volcano.intensity, 0.2, 1.2);
  const height = config.radius * (0.8 + intensity * 1.8);

  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: seed },
        uColor: { value: color },
        uIntensity: { value: intensity },
        uHeight: { value: height },
      },
      vertexShader: `/* 与你现有 volcanoMaterial.ts 相同 */`,
      fragmentShader: `/* 与你现有 volcanoMaterial.ts 相同 */`,
    });

    materialRef.current = mat;
    return mat;
  }, [seed, color, intensity, height]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  if (!config.volcano.enabled) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.02, 0.08, 0.8, 6, 1, true]} />
      <primitive attach="material" object={material} />
    </instancedMesh>
  );
};
