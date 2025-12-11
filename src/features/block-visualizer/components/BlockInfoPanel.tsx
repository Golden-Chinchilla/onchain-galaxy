import React from "react";
import type { BlockBasic } from "../types";

interface BlockInfoPanelProps {
  block: BlockBasic | null;
}

export const BlockInfoPanel: React.FC<BlockInfoPanelProps> = ({ block }) => {
  if (!block) {
    return (
      <div className="p-4 text-sm text-slate-400">
        选择或加载一个区块后，会在这里显示详细信息。
      </div>
    );
  }

  return (
    <div className="p-4 text-xs space-y-2 bg-slate-900/60 rounded-lg border border-slate-800">
      <div className="font-semibold text-slate-100">区块 #{block.number}</div>
      <div className="text-slate-400 break-all">
        <span className="text-slate-500">Hash：</span>
        {block.hash}
      </div>
      {block.parentHash && (
        <div className="text-slate-400 break-all">
          <span className="text-slate-500">Parent：</span>
          {block.parentHash}
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
        <span>交易数：{block.txCount}</span>
        {block.size && <span>大小：{block.size} bytes</span>}
        <span>Gas Used: {block.gasUsed.toString()}</span>
        <span>Gas Limit: {block.gasLimit.toString()}</span>
        {block.baseFeePerGas && (
          <span>Base Fee: {block.baseFeePerGas.toString()}</span>
        )}
      </div>
      <div className="text-slate-400">
        时代：{block.era === "pos" ? "PoS (The Merge 之后)" : "PoW"}
      </div>
    </div>
  );
};
