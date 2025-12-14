import React, { useEffect, useState } from "react";
import { BlockSceneCanvas } from "./components/BlockSceneCanvas";
import { BlockInfoPanel } from "./components/BlockInfoPanel";
import { BlockSearch } from "./components/BlockSearch";
import type { BlockBasic, BlockWithPlanet } from "./types";
import { buildBlockWithPlanet } from "./lib/planetMapping";
import {
  fetchBlockByNumber,
  fetchLatestBlock,
} from "./services/blockDataService";

export const BlockVisualizer: React.FC = () => {
  const [current, setCurrent] = useState<BlockWithPlanet | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const block = await fetchLatestBlock();
        setCurrent(buildBlockWithPlanet(block));
      } catch (err: any) {
        console.error(err);
        setErrorMsg("加载最新区块失败，请检查网络或 RPC 配置。");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (trimmed !== "latest" && !/^\d+$/.test(trimmed)) {
      setErrorMsg("请输入合法的区块高度（整数）或 latest。");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      let block: BlockBasic;
      if (trimmed === "latest") {
        block = await fetchLatestBlock();
      } else {
        const height = Number(trimmed);
        block = await fetchBlockByNumber(height);
      }
      setCurrent(buildBlockWithPlanet(block));
    } catch (err: any) {
      console.error(err);
      switch (err?.name) {
        case "InvalidBlockNumberError":
          setErrorMsg("区块高度必须是非负整数。");
          break;
        case "BlockNumberTooLargeError":
          setErrorMsg("输入的区块高度超过当前最新高度。");
          break;
        case "BlockNotFoundError":
          setErrorMsg("未找到对应区块，请确认高度是否正确。");
          break;
        default:
          setErrorMsg("加载区块失败，请稍后重试。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex gap-4">
      <div className="flex-1 min-h-[480px] max-h-[720px]">
        {current && (
          <BlockSceneCanvas
            planet={current.planet}
            block={current.block}
            transactions={current.block.transactions}
          />
        )}
      </div>

      <div className="w-[320px] flex flex-col">
        <BlockSearch onSearch={handleSearch} isLoading={loading} />

        {errorMsg && (
          <div className="mb-2 text-xs text-red-400">{errorMsg}</div>
        )}

        <BlockInfoPanel block={current?.block ?? null} />
      </div>
    </div>
  );
};
