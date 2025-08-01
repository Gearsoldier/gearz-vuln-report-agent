# 🛠️ GEARZ Vuln Report Agent

An AI-powered vulnerability report generator for bug bounty hunters. Paste your tool output (ffuf, nuclei, Burp, curl), and this app will generate a complete vulnerability report with severity, title, and suggestions — then save it to your private vault.

---

## ⚡ Features

- 🧠 AI-powered report generation (OpenAI or Ollama)
- 🔐 Vault for saved reports (view, delete, export)
- 📤 Export to `.md` or `.txt`
- 🧾 Full report preview modal
- 🕹️ Tailwind-powered hacker UI with fullscreen background
- 💾 Fully offline-compatible with local Ollama model

---

## 🚀 Quickstart

### 1. Clone the repo

```bash
git clone https://github.com/Gearsoldier/gearz-vuln-report-agent.git
cd gearz-vuln-report-agent

2. Install dependencies
bash
Copy
Edit
npm install
3. Set up your database
bash
Copy
Edit
npx prisma generate
npx prisma migrate dev --name init
🧠 Local AI with Ollama
This app uses llama3 via Ollama by default. No API key required.

✅ Step-by-step by OS:
🔵 Windows
Download Ollama: https://ollama.com/download

Open PowerShell and run:

bash
Copy
Edit
ollama serve
ollama pull llama3
🍎 macOS
bash
Copy
Edit
brew install ollama
ollama serve
ollama pull llama3
🐉 Kali Linux / Ubuntu
bash
Copy
Edit
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull llama3
💡 You MUST keep ollama serve running in a terminal while using the app.

💻 Running the App
bash
Copy
Edit
npm run dev
Then visit: http://localhost:3000

🧪 How to Use
🔧 Select Tool — Choose from ffuf, nuclei, burp, or curl

📋 Paste Output — Paste the tool’s output into the textarea

🧠 Click Generate Report — AI will analyze the output and generate a report

💾 Saved to Vault — View, preview, export, or delete the report from your vault

🧾 Full View — Click View to open the full vulnerability report with severity

📁 Vault Features
🔒 Offline vault stored locally (can be extended for user login)

📥 Export reports as .md or .txt

🗑️ Delete with a single click

🔍 Full preview in modal with AI-assigned severity

🛠️ Configuration
If you want to use OpenAI instead of Ollama, modify the backend in:

ts
Copy
Edit
// app/api/report/route.ts
// Replace Ollama endpoint with OpenAI API call
🖼️ Background / Branding
Background image: public/images/ops-center-bg.png

Favicon and theme customization supported

Fully Tailwind styled and responsive


👑 Created by GEARZ
Built for bug bounty hunters, red teamers, and AI enthusiasts.

Follow, fork, and customize it — but give credit if you use it in your own product.
