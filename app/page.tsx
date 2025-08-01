// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import ReportForm from "./components/ReportForm";
import VaultTab from "./components/VaultTab";

export type VaultItem = {
  id: string;
  title: string;
  tool: string;
  content: string;
  severity: string;
  timestamp: number;
};

export default function Home() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);

  const fetchVault = async () => {
    try {
      const res = await fetch("/api/vault");
      const data = await res.json();
      setVaultItems(data.reverse());
    } catch (err) {
      console.error("Failed to fetch vault items:", err);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  return (
    <main className="min-h-screen bg-transparent relative">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <h1 className="text-4xl font-extrabold text-yellow-400 text-center drop-shadow-lg">
          GEARZ Vuln Report Agent
        </h1>

        <ReportForm onReportSaved={fetchVault} />

        <div className="border-t border-yellow-500/20" />

        <VaultTab items={vaultItems} setItems={setVaultItems} />
      </div>
    </main>
  );
}
