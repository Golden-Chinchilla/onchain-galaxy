import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { TransactionInfo } from "../../types";
import type { BasePlanetLayerProps } from "./types";

interface TransactionSatelliteLayerProps extends BasePlanetLayerProps {
  transactions?: TransactionInfo[];
}

type SatAttr = {
  radius: number;
  inclination: number;
  baseAngle: number;
  speed: number;
  size: number;
  color: THREE.Color;
};

export const TransactionSatelliteLayer: React.FC<
  TransactionSatelliteLayerProps
> = ({ config, quality = "high", transactions = [] }) => {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);

  const cap = quality === "low" ? 120 : quality === "mid" ? 200 : 320;
  const visibleTx = useMemo(
    () => transactions.slice(0, cap),
    [transactions, cap]
  );

  const satAttrs = useMemo(() => {
    const attrs: SatAttr[] = [];
    const baseR = config.radius * 2.0;
    const band = config.radius * 1.2;

    const hashRand = (hash: string, seed: number) => {
      let h = seed;
      for (let i = 0; i < hash.length; i++) {
        h = (h ^ hash.charCodeAt(i)) * 1664525 + 1013904223;
      }
      return ((h >>> 0) % 100000) / 100000;
    };

    const colorByType = (tx: TransactionInfo) => {
      if (!tx.to) return new THREE.Color("#c084fc"); // 合约创建
      const val = tx.value ? Number(tx.value) : 0;
      if (val > 0) return new THREE.Color("#fbbf24"); // 转账
      return new THREE.Color(config.era === "pos" ? "#38bdf8" : "#fb923c"); // 合约调用/其它
    };

    visibleTx.forEach((tx, i) => {
      const r = baseR + band * (i / Math.max(1, visibleTx.length));
      const inc = (hashRand(tx.hash, 1234 + i) - 0.5) * 0.7; // 倾角
      const baseAngle = hashRand(tx.hash, 4321 + i) * Math.PI * 2;
      const gas = tx.gasUsed ? Number(tx.gasUsed) : 0;
      const speed = 0.25 + Math.min(1.2, (Math.log10(gas + 1) + 1) * 0.15);
      const magnitude =
        tx.value !== undefined
          ? Math.log10(Number(tx.value) + 1)
          : hashRand(tx.hash, 8888 + i) * 4;
      const size = THREE.MathUtils.clamp(0.8 + magnitude * 0.05, 0.6, 1.4);
      attrs.push({
        radius: r,
        inclination: inc,
        baseAngle,
        speed,
        size,
        color: colorByType(tx),
      });
    });

    return attrs;
  }, [config.era, config.radius, transactions, visibleTx]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    if (!mesh.instanceColor || mesh.instanceColor.count !== satAttrs.length) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(satAttrs.length * 3),
        3
      );
    }

    satAttrs.forEach((attr, i) => {
      const angle = attr.baseAngle;
      const pos = getPos(attr.radius, attr.inclination, angle);
      dummy.position.set(pos.x, pos.y, pos.z);
      dummy.scale.setScalar(attr.size);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.copy(attr.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [satAttrs]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    satAttrs.forEach((attr, i) => {
      const angle = attr.baseAngle + t * attr.speed;
      const pos = getPos(attr.radius, attr.inclination, angle);
      dummy.position.set(pos.x, pos.y, pos.z);
      dummy.scale.setScalar(attr.size);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.copy(attr.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      meshRef.current?.geometry?.dispose();
      (meshRef.current?.material as THREE.Material | undefined)?.dispose?.();
    };
  }, []);

  if (visibleTx.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined as any, undefined as any, visibleTx.length]}
    >
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        toneMapped={false}
        color="white"
        emissive="#ffffff"
        emissiveIntensity={0.8}
        roughness={0.2}
        metalness={0.0}
      />
    </instancedMesh>
  );
};

function getPos(r: number, inc: number, angle: number) {
  const cosI = Math.cos(inc);
  const sinI = Math.sin(inc);
  const x = r * Math.cos(angle) * cosI;
  const y = r * sinI;
  const z = r * Math.sin(angle) * cosI;
  return { x, y, z };
}
