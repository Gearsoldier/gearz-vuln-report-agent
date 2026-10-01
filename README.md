# GEARZ Vuln Report Agent 🛠️

GEARZ Vuln Report Agent is a local AI-assisted app for drafting vulnerability reports from pasted tool output. Choose ffuf, nuclei, Burp, or curl, submit the text, and review an Ollama-generated report in a SQLite-backed report vault.

Built with Next.js, React, TypeScript, Tailwind CSS, and Prisma, the app is intended to help organize evidence and prepare reports for human review. It does not run the selected tools or verify their findings.

## Features

- Report drafts generated with the local Ollama `llama3` model
- A prompt requesting a summary, impact, reproduction steps, proof of concept, and recommended fix
- Severity labels derived from the model response and tool-specific keyword rules
- Automatic report storage through Prisma and SQLite
- A vault with report previews, deletion, and Markdown or plain-text downloads

The checked-in backend uses Ollama only. OpenAI support would require a separate implementation.

## Requirements

- Node.js and npm, using a maintained Node.js version compatible with `package-lock.json`
- [Ollama](https://ollama.com/) installed on the machine running the Next.js server
- The `llama3` model downloaded locally
- Write access to the local SQLite database at `prisma/dev.db`

Dependency installation and the initial model download require network access. Report generation uses the configured local model endpoint.

## Local setup

### 1. Prepare Ollama

Start Ollama if it is not already running:

```bash
ollama serve
```

In another terminal, download the model:

```bash
ollama pull llama3
```

Leave Ollama running at `http://localhost:11434`.

### 2. Install the application

```bash
git clone https://github.com/Gearsoldier/gearz-vuln-report-agent.git
cd gearz-vuln-report-agent
npm ci
```

### 3. Prepare the database

The Prisma schema uses SQLite directly; no database URL environment variable is required by the current schema.

```bash
npx prisma generate
npx prisma migrate deploy
```

The repository already includes a migration and a tracked `prisma/dev.db`. Back up any database you intend to preserve before applying migrations. The deploy command applies existing migrations; it does not create a new migration or reset your data.

### 4. Start the app

```bash
npm run dev -- --hostname 127.0.0.1
```

Open [http://localhost:3000](http://localhost:3000).

## Using the app

1. Select the tool that produced your output
2. Paste sanitized output into the form
3. Select **Generate Report**
4. Review the saved report in the vault
5. Use **View**, **MD**, or **TXT** to preview or download the report

Verify every claim, reproduction step, and severity before sharing a report. The model may invent details, and keyword-based severity overrides can misclassify findings. Exporting a report does not submit it to a bug bounty platform.

## Data handling

The vault is local storage, with no application-level login, per-user access control, or encryption implemented. Anyone who can reach the API can access its vault operations. Keep the server bound to localhost unless you add and review suitable access controls.

- Saved reports are stored in `prisma/dev.db` through `app/api/report/route.ts` and `app/api/vault/route.ts`
- The `vault/` JSON files and filesystem-based vault routes are separate from the database-backed interface
- Both `prisma/dev.db` and a JSON report in `vault/` are already tracked in Git
- The existing `.gitignore` does not protect `*.db` files or the `vault/` directory

Use synthetic or sanitized examples while evaluating the project. Avoid committing real reports, credentials, personal information, or confidential program details. Back up reports you need before deleting them; the vault has no restore interface.

## Configuration and source map

- `app/api/report/route.ts`: report prompt, Ollama endpoint, model name, severity rules, and database save
- `app/api/vault/route.ts`: database-backed list, save, and delete operations
- `prisma/schema.prisma`: SQLite location and report schema
- `lib/db.ts`: Prisma client
- `app/components/ReportForm.tsx`: tool selection and pasted output
- `app/components/VaultTab.tsx`: previews, downloads, and deletion controls
- `app/components/modals/ReportModal.tsx`: full report preview
- `public/images/ops-center-bg.png`: background artwork

The model is set to `llama3` and the endpoint to `http://localhost:11434/api/generate` in source. Because the API route runs on the server, `localhost` refers to the Next.js host.

## Development and limitations

Available npm scripts:

- `npm run dev`: start the development server
- `npm run build`: create a production build
- `npm start`: serve a completed production build
- `npm run lint`: invoke `next lint`

The package does not declare ESLint or include an ESLint configuration, so linting requires setup. No automated test script or GitHub Actions workflow is included.

This is a prototype. Input validation and error handling are limited. The generation form does not check the HTTP status before showing its saved-report message, and the delete control removes an item from the display without checking whether deletion succeeded. Confirm important writes or deletions by refreshing the vault.

Generated `.next/` output is also tracked in the repository. Treat the source files and a fresh local build as the basis for development.

## Credits

Created by GEARZ for bug bounty hunters, security researchers, and AI enthusiasts. Please give credit if you use it in your own product.
