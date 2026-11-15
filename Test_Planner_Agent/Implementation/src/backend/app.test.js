import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from './app.js';

const template = [
  '# Test Plan — <JIRA-KEY>: <title>',
  '## 1. Scope & Objectives',
  '## 2. Gaps & Questions for the author',
  '## 3. Test Scenarios',
  '## 4. Test Data & Environment',
  '## 5. Risks & Assumptions',
  '## 6. Entry / Exit criteria',
  '## 7. Resource Allocation',
  '## 8. Timelines, Sprint Details',
  '## HUMAN REVIEW GATE'
].join('\n');

const config = {
  jiraBaseUrl: 'https://example.atlassian.net',
  jiraEmail: 'qa@example.invalid',
  jiraToken: 'test-token',
  groqApiKey: 'test-key',
  groqModel: 'test-model'
};

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('generation retrieves the issue then returns the generated plan and source reference', async () => {
  const app = createApp({
    config,
    template,
    getIssue: async ({ issueKey }) => ({
      key: issueKey,
      summary: 'A feature',
      sourceUrl: `https://example.atlassian.net/browse/${issueKey}`,
      acceptanceCriteria: []
    }),
    makePlan: async ({ issue }) => `Draft for ${issue.key}`
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueKey: 'qa-123' })
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      issue: {
        key: 'QA-123',
        summary: 'A feature',
        sourceUrl: 'https://example.atlassian.net/browse/QA-123',
        acceptanceCriteria: []
      },
      plan: 'Draft for QA-123'
    });
  });
});

test('invalid issue keys fail before Jira retrieval', async () => {
  let called = false;
  const app = createApp({
    config,
    template,
    getIssue: async () => { called = true; }
  });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueKey: 'not an issue' })
    });
    assert.equal(response.status, 400);
    assert.equal(called, false);
  });
});

test('missing provider config reports required keys instead of returning mock output', async () => {
  const app = createApp({
    config: { ...config, groqModel: '' },
    template
  });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueKey: 'QA-123' })
    });
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /GROQ_MODEL/);
  });
});

test('connection-test routes use entered credentials but never echo or persist them', async () => {
  const testCredentials = {
    baseUrl: 'https://test.atlassian.net',
    email: 'temporary@example.invalid',
    token: 'temporary-jira-token',
    apiKey: 'temporary-groq-key'
  };
  const observed = [];
  const app = createApp({
    config,
    template,
    fetchImpl: async (url, options) => {
      observed.push({ url: String(url), authorization: options.headers.Authorization });
      return String(url).endsWith('/models')
        ? new Response(JSON.stringify({ data: [{ id: config.groqModel }] }), { status: 200 })
        : new Response(JSON.stringify({ accountId: 'test-account' }), { status: 200 });
    }
  });

  await withServer(app, async (baseUrl) => {
    const jiraResponse = await fetch(`${baseUrl}/api/settings/test-jira`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseUrl: testCredentials.baseUrl,
        email: testCredentials.email,
        token: testCredentials.token
      })
    });
    const jiraBody = await jiraResponse.text();
    assert.equal(jiraResponse.status, 200);
    assert.doesNotMatch(jiraBody, /temporary-jira-token|temporary@example/);

    const groqResponse = await fetch(`${baseUrl}/api/settings/test-groq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: testCredentials.apiKey })
    });
    const groqBody = await groqResponse.text();
    assert.equal(groqResponse.status, 200);
    assert.doesNotMatch(groqBody, /temporary-groq-key/);
  });

  assert.equal(observed[0].url, 'https://test.atlassian.net/rest/api/3/myself');
  assert.equal(observed[0].authorization, `Basic ${Buffer.from(`${testCredentials.email}:${testCredentials.token}`).toString('base64')}`);
  assert.equal(observed[1].authorization, `Bearer ${testCredentials.apiKey}`);
});
