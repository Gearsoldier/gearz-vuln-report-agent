import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(
  req: Request,
  context: { params: { filename: string } }
) {
  const { filename } = context.params;
  const vaultDir = path.join(process.cwd(), "vault");

  try {
    const files = fs.readdirSync(vaultDir);
    const targetFile = files.find((file) =>
      file.endsWith(`${filename}.json`)
    );

    if (!targetFile) {
      console.log("[DEBUG] No match for filename:", filename);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filePath = path.join(vaultDir, targetFile);
    fs.unlinkSync(filePath);
    console.log("[DEBUG] Deleted file:", filePath);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DEBUG] Delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
