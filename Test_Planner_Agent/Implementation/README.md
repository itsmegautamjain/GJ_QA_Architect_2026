# Jira Test Plan Studio

A React frontend and Node/Express backend that reads Jira issues and drafts test plans with the configured Groq model. Plans are drafts pending human review.

## Requirements

- Node.js 20.19 or newer and npm.
- Jira read access for the configured account.
- A Groq API key and a model identifier available to that key.
- Docker for the container deployment option.

## Configuration and secrets

The backend reads `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN`, `GROQ_API_KEY`, and `GROQ_MODEL` from the process environment. Locally, the backend loads `.env` from the repository root first, then the app directory. Values already present in the process environment take precedence. See `.env.example` for the variable names; it contains no credentials.

For local use, add the values to the repository-root `.env` or `Test_Planner_Agent/Implementation/.env`. Do not commit `.env` or place secrets in frontend variables, browser storage, logs, or documentation.

For cloud deployment, configure those variables in the cloud service's server/container environment settings. Do not copy `.env` into the image or repository. Set `PORT` only if the service does not provide it automatically. The server binds to `0.0.0.0` and uses the supplied `PORT` (default `3001`).

`GROQ_MODEL` is required. The application does not choose a default model. Jira Cloud hosts ending in `.atlassian.net` use Jira REST API v3; other configured hosts use v2.

The test-plan template is copied into `resources/TestPlan_Template.md` and loaded from inside the app, so a deployment does not depend on files outside this directory.

## Run locally

From the repository root:

```powershell
cd Test_Planner_Agent\Implementation
npm install
```

In one terminal, run the API:

```powershell
npm run server
```

In a second terminal, start the Vite development frontend:

```powershell
npm run dev
```

Open the URL Vite prints (normally `http://127.0.0.1:5173`). Vite proxies `/api` requests to `http://127.0.0.1:3001`. To use another backend address in development, set `BACKEND_URL`.

For a single-process local production run:

```powershell
npm run build
npm start
```

Then open `http://localhost:3001`. The Express server serves the built frontend and API from the same origin. `GET /api/health` is available for service health checks.

## Deploy as a container

Build the image from this directory:

```powershell
docker build -t jira-test-plan .
```

Run locally with the repository-root `.env`:

```powershell
docker run --rm -p 3001:3001 --env-file ..\..\.env jira-test-plan
```

For cloud deployment, publish this image to the provider's container registry, select it as the service image, and add the five Jira/Groq variables in the provider's server-side environment configuration. The container builds the frontend, then starts the production Express server. Cloud hosts that accept a Node process can also run `npm ci --include=dev`, `npm run build`, and `npm start`; ensure the build stage installs the frontend build dependencies.

This deployment is provider-neutral for services that run a Docker container or a persistent Node.js process. Platforms limited to provider-specific serverless functions require an adapter for that platform's function lifecycle.

## Use

1. Enter a Jira issue key, for example `QA-123`, on the Planner page.
2. Select **Generate plan**. The backend retrieves the issue read-only, sends its available requirements and the supplied template to Groq, then returns a draft with a Jira source link.
3. Use **Settings** to test temporary Jira credentials or a Groq API key. These test values are not persisted; actual generation uses server-side environment variables.
4. Review the draft and human-review gate before sign-off.

## Verification and limitations

- `npm test` runs backend HTTP tests with mocked Jira and Groq dependencies; these are not live service checks.
- `npm run build` verifies the frontend production build.
- Live Jira/Groq integration requires valid credentials and a `GROQ_MODEL`; live integrations were not exercised by the mock tests.
- AI output can vary despite a zero temperature. Review source traceability and completeness; the app rejects output that omits or reorders template headings.
- Custom acceptance-criteria/requirements fields are included only when Jira exposes matching field names. Rich-text descriptions are normalized; details absent from the source are marked insufficient.
