import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { tool, input } = await req.json();

  const prompt = `
You are a professional bug bounty analyst writing high-quality reports for platforms like HackerOne, Bugcrowd, and Intigriti. Based on the following output from a tool like ${tool}, write a full vulnerability report in Markdown.

---

## 🔒 Severity Definitions (use strictly):
- **Critical**: Remote Code Execution (RCE), full account takeover, database overwrite, unauthenticated admin access, or total compromise.
- **High**: Authentication bypass, IDOR, unrestricted sensitive file access, stored XSS, or major privilege escalation.
- **Medium**: Sensitive file leaks (e.g., .env, config), reflected XSS, authenticated CSRF, SSRF requiring credentials, misconfigured access controls.
- **Low**: Info leaks like headers, emails, \`/robots.txt\`, open redirects, verbose error messages, directory listings.
- **None**: Garbage input, false positives, irrelevant noise, or content that clearly does not represent a real security issue.

---

Respond ONLY in clean Markdown using this exact format:

---

# <Title of the Vulnerability>
<Date: MM/DD/YYYY, HH:MM AM/PM>
**Severity: <Low | Medium | High | Critical | None>**

## 🔍 Summary
Describe what the vulnerability is, where it occurs, and why it's a concern.

## 🎯 Impact
Explain what an attacker could do if they exploited this — focus on damage or exposure.

## 🧪 Steps to Reproduce
Give simple, clear, step-by-step reproduction instructions.

## 🚀 Proof of Concept (PoC)
Provide shell/curl/browser payloads that demonstrate the issue.

## 🛠 Recommended Fix
Give practical advice for fixing the issue securely.

## ✅ Severity rating
Severity: <Low | Medium | High | Critical | None>

---

TOOL OUTPUT:
\`\`\`
${input}
\`\`\`
  `.trim();

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  let markdown = data.response.trim().replace(/\n{2,}/g, "\n");

  // Extract severity from AI markdown
  const match = markdown.match(/Severity\s*[:\-–]\s*(Low|Medium|High|Critical|None)\.?\s*$/im);
  let severity = match?.[1]?.toUpperCase().trim() ?? "";

  if (!severity) {
    const fallback = markdown.match(/\b(Low|Medium|High|Critical|None)\b/i);
    severity = fallback?.[1]?.toUpperCase() ?? "UNRATED";
  }

  // 🔥 Manual override if clear signs of CRITICAL severity
  const isUnauthenticated = /unauthenticated/i.test(markdown);
  const isRCE = /(system\(|exec\(|shell_exec\(|cmd=)/i.test(markdown);

  if (isUnauthenticated && isRCE) {
    severity = "CRITICAL";
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
      : severity === "NONE"
      ? "💤 **Severity: NONE (No Issue Detected)**"
      : "❓ **Severity: UNRATED**";

  // Remove old severity lines before prepending badge
  markdown = markdown.replace(/^.*?\*\*Severity:.*?\*\*\n+/i, "");
  markdown = `${badge}\n\n${markdown}`;

  // Save to DB
  await prisma.vaultEntry.create({
    data: {
      title: `${tool.toUpperCase()} Report`,
      tool,
      content: markdown,
      severity,
      timestamp: new Date().getTime(),
    },
  });

  return NextResponse.json({ report: markdown, severity });
}
