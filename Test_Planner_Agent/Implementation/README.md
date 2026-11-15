# Jira Test Plan Studio

A lightweight React interface and Node/Express backend that reads a Jira issue and asks the configured Groq model to draft a plan using the supplied template. Plans remain drafts pending human review.

## Prerequisites

- Node.js 20 or newer.
- Jira read access for the configured account.
- A Groq API key and a model identifier available to that key. The project does not assume a model.

## Configuration

The backend reads `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN`, `GROQ_API_KEY`, and `GROQ_MODEL` from the repository-root `.env` file. `.env` is gitignored. Do not send secrets to the frontend, commit them, or paste them into documentation.

Create or update the root `.env` with:

```dotenv
JIRA_BASE_URL=https://your-jira-domain.example
JIRA_EMAIL=your-account@example.com
JIRA_TOKEN=
GROQ_API_KEY=
GROQ_MODEL=
```

Set `GROQ_MODEL` to a model available to your Groq account. The existing environment configuration includes Jira and Groq credential variable names, but did not include `GROQ_MODEL`; generation and the Groq connection check stay blocked until it is set. Jira Cloud hosts ending in `.atlassian.net` use Jira REST API v3; other configured Jira hosts use v2.

The Settings page offers temporary connection-test fields. Values are sent only to the backend connection-test endpoints, are not saved or logged, and do not replace the active `.env` credentials used for generation. The Groq test checks that `GROQ_MODEL` is available to the entered API key.

## Install and run

From the repository root:

```powershell
cd Test_Planner_Agent\Implementation
npm install
```

In one terminal, start the backend:

```powershell
cd Test_Planner_Agent\Implementation
npm run server
```

In a second terminal, start the frontend:

```powershell
cd Test_Planner_Agent\Implementation
npm run dev
```

Open the local URL printed by Vite. The frontend proxies API requests to the backend on `127.0.0.1:3001`. Set `PORT` in the root `.env` to use another backend port and update `vite.config.js` accordingly.

## Use

1. Enter a Jira issue key, for example `QA-123`, on the Planner page.
2. Select **Generate plan**. The backend retrieves the issue read-only, passes the issue content and authoritative test-plan template to Groq, then returns the draft and Jira source link.
3. Use **Settings** to test temporary Jira credentials or a Groq API key; connection tests do not persist values.
4. Review the generated content and its human-review gate before sign-off.

## Verification and limitations

- `npm test` runs backend HTTP tests with mocked Jira/generation dependencies; these are not live Jira or Groq integration checks.
- `npm run build` verifies the React production build.
- Live integration requires valid `.env` values and was not performed as part of the mock tests.
- No Groq model was configured in the existing environment. Set `GROQ_MODEL` before generation or Groq connection testing.
- The app uses the configured Jira host to choose REST API v2 or v3 and requests issue fields and field names. Custom acceptance-criteria/requirements fields are included only when Jira exposes a matching field name.
- AI output can vary despite a zero temperature. Validate source traceability and completeness; the app rejects output that omits or reorders template headings.
- Jira may encode some issue content in rich-text formats; issue description text is normalized, while factual content not available in the Jira response is explicitly marked as insufficient.
