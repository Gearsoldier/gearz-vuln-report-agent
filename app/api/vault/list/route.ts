import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const vaultPath = path.join(process.cwd(), "vault");

  if (!fs.existsSync(vaultPath)) {
    return NextResponse.json([], { status: 200 });
  }

  const files = fs.readdirSync(vaultPath);
  const reports = files
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const content = fs.readFileSync(path.join(vaultPath, file), "utf-8");
      const parsed = JSON.parse(content);
      return {
        filename: file,
        title: parsed.title || "Untitled",
        tool: parsed.tool || "unknown",
        timestamp: parsed.timestamp || null,
      };
    });

  return NextResponse.json(reports, { status: 200 });
}
