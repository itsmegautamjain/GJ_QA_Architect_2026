# Jira Test Strategy Builder

A React frontend and Node/Express backend that reads Jira issues and drafts test strategies with the configured Groq model.

## Prerequisites

- Node.js 20.19 or newer
- npm
- Jira read access
- A Groq API key and a model identifier available to that key

## Configuration

The backend reads these server-side variables:

- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_TOKEN`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `PORT` (optional; defaults to `3001`)

The server loads `D:\GJ_QA_Architect_2026\.env` first and then `Implementation\.env` if present. Process environment values take precedence. The repository root `.env` is not copied or read by the browser. See `.env.example` for placeholder variable names only; it contains no credentials.

Do not commit `.env`, place secrets in `VITE_*` variables, browser storage, screenshots, logs, or documentation.

Jira Cloud hosts ending in `.atlassian.net` use REST API v3. Other configured hosts use REST API v2.

## Install and run

```powershell
cd D:\GJ_QA_Architect_2026\Test_Strategy_Builder\Implementation
npm install
```

Run the API:

```powershell
npm run server
```

Run the Vite frontend in a second terminal:

```powershell
npm run dev
```

Open the URL printed by Vite (normally `http://127.0.0.1:5173`). Development API requests are proxied to `http://127.0.0.1:3001`; set `BACKEND_URL` to use another backend.

For one-process production use:

```powershell
npm run build
npm start
```

Open `http://localhost:3001`. `GET /api/health` verifies backend availability.

## Deploy to Vercel

From this directory, build and deploy:

```powershell
npm run build
vercel --prod
```

Set `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN`, `GROQ_API_KEY`, and `GROQ_MODEL` as server-side environment variables in the Vercel project. Never place these values in `VITE_*` variables or repository files.

## Use

1. Enter a Jira issue key, such as `QA-123`, on the Builder page.
2. Select **Generate strategy**. The backend retrieves the issue read-only and asks Groq to produce the supplied template structure.
3. Open **Settings** to test temporary Jira or Groq credentials. Test fields are not persisted; generation uses server-side environment variables.
4. Review every draft before sign-off.

## Verification

- Node HTTP tests mock Jira and Groq behavior.
- Integration tests cover issue-key validation, Jira normalization, and strategy heading order.
- Frontend API tests cover safe API error handling.
- `npm run build` verifies the Vite production build.
- Live Jira/Groq calls were not exercised unless credentials and network access are available.

The application marks unavailable source details with exactly `Insufficient information to determine.` It does not modify Jira content or infer unprovided product behavior.
