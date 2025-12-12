export type QualityLevel = "low" | "mid" | "high";

export const QUALITY_CONFIG = {
  low: {
    sphereSegments: 48,
    atmosphereSegments: 48,
    ringSegments: 64,
    particleMultiplier: 0.4,
  },
  mid: {
    sphereSegments: 96,
    atmosphereSegments: 64,
    ringSegments: 128,
    particleMultiplier: 0.7,
  },
  high: {
    sphereSegments: 128,
    atmosphereSegments: 96,
    ringSegments: 256,
    particleMultiplier: 1.0,
  },
} as const;
