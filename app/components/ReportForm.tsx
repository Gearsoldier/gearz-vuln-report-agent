"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ReportForm({ onReportSaved }: { onReportSaved: () => void }) {
  const [tool, setTool] = useState("ffuf");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return toast.error("Please enter tool output.");
    setLoading(true);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        body: JSON.stringify({ tool, input }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      toast.success(`✅ Saved report (${data.severity})`);

      setInput("");
      onReportSaved(); // 🔁 Trigger Vault refresh
    } catch (err) {
      toast.error("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#111] rounded-xl border border-neutral-800 space-y-3">
      <label className="block text-sm text-white">Tool:</label>
      <select
        className="w-full bg-neutral-900 text-white p-2 rounded"
        value={tool}
        onChange={e => setTool(e.target.value)}
      >
        <option value="ffuf">ffuf</option>
        <option value="nuclei">nuclei</option>
        <option value="burp">burp</option>
        <option value="curl">curl</option>
      </select>

      <textarea
        className="w-full bg-neutral-900 text-white p-2 rounded h-32 resize-none"
        placeholder="Paste tool output here..."
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button
        className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Report"}
      </button>
    </div>
  );
}
