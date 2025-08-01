import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const vaultPath = path.join(process.cwd(), "vault");

export async function GET() {
  if (!fs.existsSync(vaultPath)) {
    return NextResponse.json([]);
  }

  const files = fs.readdirSync(vaultPath);
  const entries = files.map((file) => {
    const content = fs.readFileSync(path.join(vaultPath, file), "utf8");
    const parsed = JSON.parse(content);
    return {
      filename: file,
      title: parsed.title,
      tool: parsed.tool,
      timestamp: parsed.timestamp,
    };
  });

  return NextResponse.json(entries.sort((a, b) => b.timestamp - a.timestamp));
}
