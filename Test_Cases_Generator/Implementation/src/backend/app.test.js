import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from './app.js';

const template = [
  '# MANUAL TESTING TEST CASE TEMPLATE',
  '| TEST TITLE | PRIORITY | TEST CASE ID | TESTER NAME | TEST DATE |',
  '| TEST DESCRIPTION |',
  '| TEST DESIGNED BY | TEST EXECUTED BY | EXECUTION DATE |',
  '| STEP ID | STEP DESCRIPTION | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | PASS / FAIL | ADDITIONAL NOTES |'
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

test('generation retrieves the issue and returns draft test cases with a Jira source reference', async () => {
  const app = createApp({
    config,
    template,
    getIssue: async ({ issueKey }) => ({
      key: issueKey,
      summary: 'A feature',
      sourceUrl: `https://example.atlassian.net/browse/${issueKey}`,
      requirements: []
    }),
    makeTestCases: async ({ issue }) => `Draft cases for ${issue.key}`
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
        requirements: []
      },
      testCases: 'Draft cases for QA-123'
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
  const app = createApp({ config: { ...config, groqModel: '' }, template });
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

test('temporary connection credentials are never echoed in responses', async () => {
  const app = createApp({
    config,
    template,
    checkJira: async () => {},
    fetchImpl: async () => new Response(JSON.stringify({ data: [{ id: config.groqModel }] }), { status: 200 })
  });
  await withServer(app, async (baseUrl) => {
    const jiraResponse = await fetch(`${baseUrl}/api/settings/test-jira`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseUrl: 'https://test.atlassian.net',
        email: 'temporary@example.invalid',
        token: 'temporary-jira-token'
      })
    });
    assert.equal(jiraResponse.status, 200);
    assert.doesNotMatch(await jiraResponse.text(), /temporary-jira-token|temporary@example/);

    const groqResponse = await fetch(`${baseUrl}/api/settings/test-groq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: 'temporary-groq-token' })
    });
    assert.equal(groqResponse.status, 200);
    assert.doesNotMatch(await groqResponse.text(), /temporary-groq-token/);
  });
});
