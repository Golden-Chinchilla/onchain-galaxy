import { useMemo } from "react";
import { QUALITY_CONFIG, QualityLevel } from "./qualityConfig";

export function useQuality(level: QualityLevel = "high") {
  return useMemo(() => QUALITY_CONFIG[level], [level]);
}
