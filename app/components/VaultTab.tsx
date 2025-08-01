"use client";

import { useMemo, useState, useEffect } from "react";
import { DownloadIcon, EyeIcon, Trash2Icon } from "lucide-react";
import ReportModal from "./modals/ReportModal";
import { format } from "date-fns";

type VaultItem = {
  id: string;
  title: string;
  tool: string;
  content: string;
  severity: string;
  timestamp: number;
};

export default function VaultTab({
  items,
  setItems,
}: {
  items: VaultItem[];
  setItems: React.Dispatch<React.SetStateAction<VaultItem[]>>;
}) {
  const [selected, setSelected] = useState<VaultItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/vault?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleExport = (item: VaultItem, type: "md" | "txt") => {
    const blob = new Blob([item.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title}.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formattedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      formattedTime: format(item.timestamp, "M/dd/yyyy, h:mm:ss a"),
    }));
  }, [items]);

  // 👇 SSR-safe: wait until mount
  if (!mounted) return null;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
        📁 Vault
      </h2>

      {formattedItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved reports yet.</p>
      ) : (
        formattedItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#111] rounded-lg p-4 border border-neutral-800"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-neutral-400">
                  Tool: {item.tool} • {item.formattedTime}
                </p>
              </div>
              <div className="text-sm px-2 py-1 rounded bg-neutral-800 border border-neutral-700">
                {item.severity}
              </div>
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                className="bg-blue-800 text-white px-2 py-1 text-xs rounded flex items-center gap-1"
                onClick={() => handleExport(item, "md")}
              >
                <DownloadIcon size={14} /> MD
              </button>
              <button
                className="bg-sky-800 text-white px-2 py-1 text-xs rounded flex items-center gap-1"
                onClick={() => handleExport(item, "txt")}
              >
                <DownloadIcon size={14} /> TXT
              </button>
              <button
                className="bg-purple-700 text-white px-2 py-1 text-xs rounded flex items-center gap-1"
                onClick={() => setSelected(item)}
              >
                <EyeIcon size={14} /> View
              </button>
              <button
                className="bg-red-700 text-white px-2 py-1 text-xs rounded flex items-center gap-1"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2Icon size={14} /> Delete
              </button>
            </div>
          </div>
        ))
      )}

      {selected && (
        <ReportModal
          report={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
