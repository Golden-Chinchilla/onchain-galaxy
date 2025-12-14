import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import type { BlockBasic, TransactionInfo } from "../types";

// ===== 1. 创建 PublicClient =====

const RPC_URL = process.env.ETH_MAINNET_RPC_URL as string | undefined;

if (!RPC_URL) {
  throw new Error(
    "Missing ETH_MAINNET_RPC_URL in .env or Webpack DefinePlugin"
  );
}

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
});

// ===== 2. 把 RPC 返回的区块映射成 BlockBasic =====

function normalizeTransactions(raw: any): TransactionInfo[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((tx: any) => {
    if (typeof tx === "string") {
      return { hash: tx };
    }
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gasUsed: tx.gasUsed,
    };
  });
}

function mapBlockResponseToBasic(block: any): BlockBasic {
  const transactions = normalizeTransactions(block.transactions);
  const txCount = transactions.length;

  const number = Number(block.number);

  return {
    number,
    hash: block.hash,
    parentHash: block.parentHash,
    timestamp: Number(block.timestamp),
    gasUsed: block.gasUsed,
    gasLimit: block.gasLimit,
    baseFeePerGas: block.baseFeePerGas, // 伦敦之前是 undefined，类型里是可选的

    txCount,
    size: block.size ? Number(block.size) : undefined,
    miner: block.miner,
    difficulty: block.difficulty,
    totalDifficulty: block.totalDifficulty,

    era: number >= 15537393 ? "pos" : "pow", // Merge 之后算 PoS
    transactions,
  };
}

// ===== 3. 最新区块高度（带简单缓存）=====

let latestBlockNumberCache: bigint | null = null;

export async function getLatestBlockNumber(): Promise<bigint> {
  if (latestBlockNumberCache) return latestBlockNumberCache;
  const latest = await publicClient.getBlockNumber();
  latestBlockNumberCache = latest;
  return latest;
}

// ===== 4. 对外暴露的 service 函数 =====

// 获取最新区块
export async function fetchLatestBlock(): Promise<BlockBasic> {
  const block = await publicClient.getBlock({
    blockTag: "latest",
    includeTransactions: true,
  });

  latestBlockNumberCache = block.number;

  return mapBlockResponseToBasic(block);
}

// 按高度获取区块，带防御：负数 / 非整数 / 超出当前高度 / 不存在
export async function fetchBlockByNumber(
  blockNumber: number
): Promise<BlockBasic> {
  if (!Number.isInteger(blockNumber) || blockNumber < 0) {
    const err = new Error("INVALID_BLOCK_NUMBER");
    err.name = "InvalidBlockNumberError";
    throw err;
  }

  const latest = await getLatestBlockNumber();
  const bn = BigInt(blockNumber);

  if (bn > latest) {
    const err = new Error(
      `BLOCK_NUMBER_TOO_LARGE: requested ${blockNumber}, latest is ${latest.toString()}`
    );
    err.name = "BlockNumberTooLargeError";
    throw err;
  }

  try {
    const block = await publicClient.getBlock({
      blockNumber: bn,
      includeTransactions: true,
    });

    return mapBlockResponseToBasic(block);
  } catch (e: any) {
    const err = new Error(e?.message || "BLOCK_NOT_FOUND");
    err.name = "BlockNotFoundError";
    throw err;
  }
}
