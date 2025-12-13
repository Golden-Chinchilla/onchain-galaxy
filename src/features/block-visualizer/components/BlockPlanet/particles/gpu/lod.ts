export type Quality = "low" | "mid" | "high";

export interface GpuLodPreset {
  // 粒子数缩放（最终 count 会再 clamp 到 texSize^2）
  countMultiplier: number;

  // 轨迹历史长度（>=2）
  historyLength: number;

  // 抽样步长：每隔多少粒子绘制一条轨迹（越大越省）
  particleStep: number;

  // 抽样步长：每隔多少历史段绘制一段线（越大越省）
  segmentStep: number;

  // 点渲染大小
  pointSize: number;

  // 是否启用“真实轨迹线”
  enableTrails: boolean;
}

function isMobileUA() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function getGpuLodPreset(quality: Quality, dpr: number): GpuLodPreset {
  const mobile = isMobileUA();
  const hiDpr = dpr >= 2;

  if (quality === "low") {
    return {
      countMultiplier: mobile ? 0.25 : 0.35,
      historyLength: mobile ? 16 : 24,
      particleStep: mobile ? 3 : 2,
      segmentStep: mobile ? 2 : 1,
      pointSize: hiDpr ? 1.8 : 2.2,
      enableTrails: false,
    };
  }

  if (quality === "mid") {
    return {
      countMultiplier: mobile ? 0.45 : 0.6,
      historyLength: mobile ? 24 : 32,
      particleStep: mobile ? 2 : 1,
      segmentStep: mobile ? 2 : 1,
      pointSize: hiDpr ? 2.0 : 2.6,
      enableTrails: true,
    };
  }

  // high
  return {
    countMultiplier: mobile ? 0.7 : 1.0,
    historyLength: mobile ? 32 : 48,
    particleStep: mobile ? 2 : 1,
    segmentStep: mobile ? 1 : 1,
    pointSize: hiDpr ? 2.2 : 3.0,
    enableTrails: true,
  };
}
