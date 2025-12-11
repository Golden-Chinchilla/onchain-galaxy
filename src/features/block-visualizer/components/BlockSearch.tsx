import React, { useState } from "react";

interface BlockSearchProps {
  onSearch: (input: string) => void;
  isLoading?: boolean;
}

export const BlockSearch: React.FC<BlockSearchProps> = ({
  onSearch,
  isLoading,
}) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
      <input
        className="flex-1 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500"
        placeholder="输入区块高度或 latest"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-3 py-1.5 text-sm rounded-md bg-sky-600 text-white disabled:bg-slate-600"
      >
        {isLoading ? "加载中…" : "查看"}
      </button>
    </form>
  );
};
