import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Matrix4, Color, Quaternion, Vector3 } from "three";
import type { BasePlanetLayerProps } from "./types";

interface VolcanoLayerProps extends BasePlanetLayerProps {}

// 🔥 基础喷发点数量（后面可以用 quality 调整）
const VOLCANO_COUNT = 24;

// 🔥 喷发柱高度比例（相对星球半径）
const ERUPTION_HEIGHT_FACTOR = 0.35;

// 🔥 喷发脉冲速度
const ERUPTION_SPEED = 1.2;

export const VolcanoLayer: React.FC<VolcanoLayerProps> = ({
  config,
  quality,
}) => {
  const meshRef = useRef<InstancedMesh>(null);

  // 用于 instance matrix 计算（沿用你原来的方式）
  const dummyMat = useMemo(() => new Matrix4(), []);

  // 用于朝向计算（新增，但不破坏原结构）
  const up = useMemo(() => new Vector3(0, 1, 0), []);
  const dir = useMemo(() => new Vector3(), []);
  const quat = useMemo(() => new Quaternion(), []);

  const color = useMemo(
    () => new Color(config.volcano.glowColor),
    [config.volcano.glowColor]
  );

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.getElapsedTime();
    const r = config.radius * 1.001;

    for (let i = 0; i < VOLCANO_COUNT; i++) {
      /**
       * === 1. 火山在球面上的分布（完全沿用你原来的逻辑）===
       */
      const lat = (Math.acos(2 * (i / VOLCANO_COUNT) - 1) - Math.PI / 2) * 0.8;
      const lon = ((i / VOLCANO_COUNT) * Math.PI * 4 + t * 0.6) % (Math.PI * 2);

      const x = r * Math.cos(lat) * Math.cos(lon);
      const y = r * Math.sin(lat);
      const z = r * Math.cos(lat) * Math.sin(lon);

      /**
       * === 2. 喷发强度（新增：时间脉冲）===
       * 每个火山都有自己的 phase，避免整齐闪烁
       */
      const phase = (i / VOLCANO_COUNT) * Math.PI * 2;
      const pulse = 0.5 + 0.5 * Math.sin(t * ERUPTION_SPEED + phase);

      /**
       * === 3. 计算喷发方向（从星球中心向外）===
       */
      dir.set(x, y, z).normalize();

      /**
       * === 4. 朝向：让圆柱沿法线方向竖起 ===
       */
      quat.setFromUnitVectors(up, dir);

      /**
       * === 5. 最终变换矩阵 ===
       * - 平移到表面
       * - 旋转到法线方向
       * - Y 轴拉伸，形成喷发柱
       */
      dummyMat.compose(
        new Vector3(x, y, z),
        quat,
        new Vector3(
          1,
          pulse * ERUPTION_HEIGHT_FACTOR * config.volcano.intensity + 0.05,
          1
        )
      );

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
      {/* 🔥 几何体：由“点”升级为“喷发柱” */}
      <cylinderGeometry
        args={[
          config.radius * 0.01, // 顶部半径（更细）
          config.radius * 0.03, // 底部半径（更粗）
          config.radius * 0.4, // 高度（会被 scale.y 拉伸）
          6, // 低面数，性能友好
        ]}
      />

      {/* 🔥 材质：先用 Basic，后面可直接替换为 Shader */}
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </instancedMesh>
  );
};
