// app/api/report/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { tool, input } = await req.json();

  const prompt = [
    "You are a professional bug bounty analyst creating reports for platforms like HackerOne, Bugcrowd, and Intigriti.",
    `Your task is to analyze output from the tool: ${tool}.`,
    "",
    "## Strict Markdown Format:",
    "---",
    "# <Vulnerability Title>",
    "<Date: MM/DD/YYYY, HH:MM AM/PM>",
    "**Severity: <Low | Medium | High | Critical | None>**",
    "",
    "## 🔍 Summary",
    "Briefly explain what was found and why it matters.",
    "",
    "## 🎯 Impact",
    "Explain the potential risk or damage this issue could cause.",
    "",
    "## 🧪 Steps to Reproduce",
    "Numbered, clear, reproducible steps.",
    "",
    "## 🚀 Proof of Concept (PoC)",
    "Example: curl, FFUF output, or screenshot instructions.",
    "",
    "## 🛠 Recommended Fix",
    "Clear guidance to fix the issue.",
    "",
    "## ✅ Severity rating",
    "Severity: <Low | Medium | High | Critical | None>",
    "---",
    "",
    "## 🔒 Severity Reference:",
    "- **Critical**: RCE, full account takeover, unauthenticated admin, DB overwrite.",
    "- **High**: Auth bypass, IDOR, `.env`, `.bak`, exposed panels, stored XSS.",
    "- **Medium**: SSRF, reflected XSS, directory listing, auth'd CSRF, sensitive files.",
    "- **Low**: Email leaks, error messages, stack traces, fingerprinting.",
    "- **None**: 404s, tool noise, harmless reflection, `/robots.txt`, false positives.",
    "",
    "## TOOL OUTPUT:",
    "```",
    input,
    "```",
  ].join("\n");

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3", prompt, stream: false }),
  });

  const data = await response.json();
  let markdown = data.response.trim().replace(/\n{3,}/g, "\n\n");

  // Step 1: Parse LLM severity
  let severity = "";
  const match = markdown.match(/Severity\s*[:\-–]\s*(Low|Medium|High|Critical|None)\b/i);
  if (match) severity = match[1].toUpperCase();

  if (!severity) {
    const fallback = markdown.match(/\*\*Severity:\s*(Low|Medium|High|Critical|None)\*\*/i);
    if (fallback) severity = fallback[1].toUpperCase();
  }

  if (!severity) severity = "LOW";

  const fullText = (input + "\n" + markdown).toLowerCase();

  // Step 2: Heuristic Flags
  const isToolNoise = /404|not found|no vulnerabilities|no issues|tool noise/i.test(fullText);
  const isLowSignal = /robots\.txt|x-powered-by|stack trace|email leak|missing favicon/i.test(fullText);
  const isReflection = /reflected input|echoed input|input appears.*response.*(body|title|tag)?/i.test(fullText);
  const isIndexOf = /directory listing|index of/i.test(fullText);
  const isBackup = /\.(bak|zip|tar|gz|old)/i.test(fullText);
  const isSQLi = /sql injection|admin'--|sqli/i.test(fullText);
  const isAuthBypass = /unauthenticated|auth bypass|no authentication/i.test(fullText);
  const isExposedPanel = /admin panel|debug panel|exposed dashboard/i.test(fullText);
  const isInternalBypass = /x-forwarded-for|127\.0\.0\.1|localhost/i.test(fullText);

  const isNonExploitReflected = /(reflected input|echoed input).*?(no risk|not exploitable|minimal impact|harmless|safe|non-issue|no threat|benign|no significant consequence|false positive|no impact)/i.test(fullText);

  // Step 3: Tool-specific overrides
  if (tool === "ffuf") {
    if (isBackup) severity = "HIGH";
    else if (isIndexOf) severity = "MEDIUM";
    else if (isToolNoise || isLowSignal || isNonExploitReflected) severity = "NONE";
  }

  if (tool === "nuclei") {
    if (isSQLi) severity = "CRITICAL";
    else if (isAuthBypass && isExposedPanel) severity = "HIGH";
    else if (isToolNoise || isLowSignal || isNonExploitReflected) severity = "NONE";
    else if (isReflection && !/xss|alert|script|exploit/i.test(fullText)) severity = "NONE";
  }

  if (tool === "curl") {
    if (isInternalBypass && isAuthBypass) severity = "HIGH";
    else if (isToolNoise || isNonExploitReflected) severity = "NONE";
  }

  if (tool === "burp") {
    if (isSQLi) severity = "CRITICAL";
    else if (isToolNoise || isNonExploitReflected) severity = "NONE";
  }

  // Step 4: Final catch-all downgrade
  if (isReflection && isNonExploitReflected) {
    severity = "NONE";
  }

  if (isToolNoise || isNonExploitReflected) {
    severity = "NONE";
  }

  // Step 5: Badge Formatting
  const badge =
    severity === "CRITICAL"
      ? "🚨 **Severity: CRITICAL**"
      : severity === "HIGH"
      ? "🔥 **Severity: HIGH**"
      : severity === "MEDIUM"
      ? "⚠️ **Severity: MEDIUM**"
      : severity === "LOW"
      ? "🟡 **Severity: LOW**"
      : severity === "NONE"
      ? "💤 **Severity: NONE (No Issue Detected)**"
      : "❓ **Severity: UNRATED**";

  markdown = markdown.replace(/^.*?\*\*Severity:.*?\*\*\n+/i, "");
  markdown = `${badge}\n\n${markdown}`;

  // Step 6: Save to DB
  await prisma.vaultEntry.create({
    data: {
      title: `${tool.toUpperCase()} Report`,
      tool,
      content: markdown,
      severity,
      timestamp: Date.now(),
    },
  });

  return NextResponse.json({ report: markdown, severity });
}
