import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/vault - list all saved entries
export async function GET() {
  const entries = await prisma.vaultEntry.findMany({
    orderBy: { timestamp: "desc" },
  });

  // ✅ Convert BigInt timestamps to Number to avoid serialization error
  const safeEntries = entries.map(entry => ({
    ...entry,
    timestamp: Number(entry.timestamp),
  }));

  return NextResponse.json(safeEntries);
}

// POST /api/vault - save a new entry
export async function POST(req: Request) {
  const { title, content, tool, severity } = await req.json();

  if (!title || !content || !tool) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const entry = await prisma.vaultEntry.create({
    data: {
      title,
      tool,
      content,
      severity: severity || "UNRATED",
      timestamp: Date.now(),
    },
  });

  return NextResponse.json({
    ...entry,
    timestamp: Number(entry.timestamp),
  });
}

// DELETE /api/vault?id=xyz - delete one entry
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  await prisma.vaultEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
