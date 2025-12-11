import type { BlockBasic, PlanetConfig, BlockWithPlanet } from "../types";

// 辅助函数：把 bigint 映射到 0~1 区间（简单版）
function normalizeBigint(value: bigint | undefined, max: bigint): number {
  if (!value || max === 0n) return 0;
  const v = value > max ? max : value;
  return Number(v) / Number(max);
}

// 区块 → 星球配置 映射函数
export function mapBlockToPlanetConfig(block: BlockBasic): PlanetConfig {
  const txFactor = Math.min(block.txCount / 200, 1); // 0~1
  const gasFactor = normalizeBigint(
    block.gasUsed,
    block.gasLimit || 30_000_000n
  );
  const sizeFactor = block.size ? Math.min(block.size / 200_000, 1) : 0.3;

  const isPos = block.era === "pos";

  const radius = 1.8 + sizeFactor * 1.2;

  return {
    radius,
    coreColor: isPos ? "#5df2ff" : "#ffb347",
    surfaceColor: isPos ? "#0f172a" : "#3b1f0f",

    atmosphereColor: isPos ? "#38bdf8" : "#f97316",
    atmosphereIntensity: 0.4 + gasFactor * 0.6,

    rotationSpeed: 0.1 + txFactor * 0.4,

    ring: {
      enabled: txFactor > 0.4,
      innerRadius: radius * 1.3,
      outerRadius: radius * (1.7 + txFactor * 0.6),
      color: isPos ? "#38bdf8" : "#f97316",
    },

    satellites: {
      count: 1 + Math.round(txFactor * 4),
      radius: 0.12 + sizeFactor * 0.15,
      orbitRadius: radius * 2.2,
    },

    volcano: {
      enabled: gasFactor > 0.2,
      glowColor: isPos ? "#a5f3fc" : "#fb923c",
      intensity: 0.3 + gasFactor * 0.8,
    },

    particles: {
      count: 200 + Math.round(gasFactor * 600),
      size: 0.02 + txFactor * 0.04,
      spreadRadius: radius * (3 + gasFactor * 3),
    },

    era: isPos ? "pos" : "pow",
  };
}

// 方便调用：直接生成带 planet 的结构
export function buildBlockWithPlanet(block: BlockBasic): BlockWithPlanet {
  return {
    block,
    planet: mapBlockToPlanetConfig(block),
  };
}
