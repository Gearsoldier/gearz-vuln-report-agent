import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // 🔥 Make sure this path matches your setup

export async function POST(req: Request) {
  const { tool, input } = await req.json();

  const prompt = `
You are a professional bug bounty hunter writing reports for a bug bounty platform. Based on this output from the tool (${tool}), write a full vulnerability report with:

- Title
- Summary (1 paragraph max)
- Impact (real-world consequences — e.g., data exfiltration, takeover)
- Steps to Reproduce
- Proof of Concept (PoC, use shell commands or curl if relevant)
- Recommended Fix
- **Final line must say:** Severity rating: <Low | Medium | High | Critical>

⚠️ If the vulnerability reveals secrets (.env, config, backups), admin paths, or allows unauthorized access to sensitive data or users, classify it as **High** or **Critical** — do not understate severity.

Respond only in clean Markdown format. Do not include explanations or disclaimers.

INPUT:
${input}
`.trim();

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3", prompt, stream: false }),
  });

  const data = await response.json();
  let markdown = data.response.trim().replace(/\n{2,}/g, "\n");

  // 🔍 Extract severity
  let match = markdown.match(/Severity(?: rating)?\s*[:\-–]\s*(Low|Medium|High|Critical)\.?\s*$/im);
  let severity = match?.[1]?.toUpperCase().trim() ?? "";

  if (!severity) {
    const fallback = markdown.match(/\b(Low|Medium|High|Critical)\b/i);
    severity = fallback?.[1]?.toUpperCase() ?? "UNRATED";
  }

  const badge =
    severity === "CRITICAL"
      ? "🚨 **Severity: CRITICAL**"
      : severity === "HIGH"
      ? "🔥 **Severity: HIGH**"
      : severity === "MEDIUM"
      ? "⚠️ **Severity: MEDIUM**"
      : severity === "LOW"
      ? "🟡 **Severity: LOW**"
      : "💤 **Severity: UNRATED**";

  markdown = markdown.replace(/^.*?\*\*Severity:.*?\*\*\n+/i, "");
  markdown = `${badge}\n\n${markdown}`;

  // 🧠 Save to Vault
  await prisma.vaultEntry.create({
    data: {
      title: `${tool.toUpperCase()} Report`,
      tool,
      content: markdown,
      severity,
      timestamp: new Date().getTime(), // Ensure it’s stored as number
    },
  });

  return NextResponse.json({ report: markdown, severity });
}
