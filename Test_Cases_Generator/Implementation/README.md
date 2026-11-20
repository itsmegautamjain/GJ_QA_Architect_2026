# Jira Test Cases Generator

A React app and Node/Express API for read-only Jira issue retrieval and Groq-assisted manual test case drafts. The UI follows the supplied Test Strategy Builder reference, with Test Cases-specific labels and a Settings page.

## Requirements

- Node.js 20.19 or newer and npm.
- Jira read access for the configured account.
- A Groq API key and a model identifier available to that key.

## Configuration and secrets

The backend reads `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN`, `GROQ_API_KEY`, and `GROQ_MODEL` from the process environment. Locally it loads the repository-root `.env` first, then `Test_Cases_Generator/Implementation/.env`; process environment values take precedence. `Implementation/.env.example` lists variable names only.

The repository-root `.env` is not copied, printed, committed, or sent anywhere by setup or verification. At runtime, the backend uses its configured credentials only for the user-requested Jira read and Groq generation requests. Do not put credentials in frontend variables, browser storage, logs, screenshots, or documentation.

`GROQ_MODEL` is required; the app does not select a default. Jira Cloud hosts ending in `.atlassian.net` use REST API v3; other hosts use v2.

## Install and run

From the repository root:

```powershell
cd Test_Cases_Generator\Implementation
npm install
```

In one terminal, run the API:

```powershell
npm run server
```

In a second terminal, start the frontend:

```powershell
npm run dev
```

Open the Vite URL (normally `http://127.0.0.1:5173`). Vite proxies `/api` requests to `http://127.0.0.1:3002`; set `BACKEND_URL` if the backend uses a different address.

For a single-process production run:

```powershell
npm run build
npm start
```

Then open `http://127.0.0.1:3002`. `GET /api/health` reports API readiness.

## Deploy to Vercel

From this directory, deploy the app with the Vercel CLI:

```powershell
vercel --prod
```

Set the project root to `Test_Cases_Generator/Implementation` if configuring it through the Vercel dashboard. The deployment includes the static frontend and serverless API functions.

The `.env` file is not included in the deployment and its credentials are not uploaded. The app will report incomplete server configuration until you add `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN`, `GROQ_API_KEY`, and `GROQ_MODEL` yourself in the Vercel project's server-side environment variables and redeploy.

## Use

1. Enter a Jira issue key, such as `QA-123`, and select **Generate test cases**.
2. The backend retrieves the issue read-only, passes available issue details and the supplied manual test case template to the configured Groq model, and returns a draft with a Jira source link.
3. Use **Settings** to test temporary Jira credentials or a Groq token. These values are not persisted; generation uses server-side environment configuration.
4. Review the draft, its source, and missing-information markers before use.

The supplied PDF is a manual test case form with fields for test title, priority, test case ID, tester and dates, test description, design/execution ownership, and a step table. That layout is transcribed in `resources/TestCases_Template.md` for generation and preserves the labels/order shown in the PDF.

## Verification and limitations

- `npm test` exercises the API, Jira normalization, prompt construction, template validation, and frontend request helper using mocks. These tests do not contact Jira or Groq.
- `npm run build` checks the production frontend bundle.
- No live Jira/Groq requests were made during implementation; the `.env` values were not read or exposed.
- Generated cases are AI drafts. Temperature is set to zero, but model output may still vary. The API rejects output that omits or reorders template field labels.
- Requirement and acceptance-criteria custom fields are included only when Jira exposes matching field names; details absent from the source are marked `Insufficient information to determine.`
