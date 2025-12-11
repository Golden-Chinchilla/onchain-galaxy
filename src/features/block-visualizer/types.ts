// 区块基础数据（之后可以接 viem/ethers 真数据）
export interface BlockBasic {
  number: number;
  hash: string;
  timestamp: number;
  gasUsed: bigint;
  gasLimit: bigint;
  baseFeePerGas?: bigint;
  txCount: number;
  size?: number;
  miner?: string;
  difficulty?: bigint;
  totalDifficulty?: bigint;
  parentHash?: string;
  era?: "pow" | "pos";
}

// 区块 → 星球可视化配置
export interface PlanetConfig {
  radius: number;
  coreColor: string;
  surfaceColor: string;

  atmosphereColor: string;
  atmosphereIntensity: number;

  rotationSpeed: number; // 自转速度

  ring: {
    enabled: boolean;
    innerRadius: number;
    outerRadius: number;
    color: string;
  };

  satellites: {
    count: number;
    radius: number;
    orbitRadius: number;
  };

  volcano: {
    enabled: boolean;
    glowColor: string;
    intensity: number;
  };

  particles: {
    count: number;
    size: number;
    spreadRadius: number;
  };

  era: "pow" | "pos";
}

export interface BlockWithPlanet {
  block: BlockBasic;
  planet: PlanetConfig;
}

// 搜索框状态
export interface BlockSearchState {
  query: string;
  isLoading: boolean;
  error?: string;
}
