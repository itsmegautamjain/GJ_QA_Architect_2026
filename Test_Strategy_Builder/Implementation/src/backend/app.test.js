import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';

async function request(app, path, options = {}) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, options);
    return { status: response.status, body: await response.json() };
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

const config = {
  jiraBaseUrl: 'https://example.atlassian.net',
  jiraEmail: 'qa@example.com',
  jiraToken: 'jira-token',
  groqApiKey: 'groq-token',
  groqModel: 'test-model'
};

test('health endpoint returns ok', async () => {
  const app = createApp({ config, template: '# Test Strategy\n' });
  assert.deepEqual(await request(app, '/api/health'), { status: 200, body: { status: 'ok' } });
});

test('generate rejects invalid issue IDs', async () => {
  const app = createApp({ config, template: '# Test Strategy\n' });
  const result = await request(app, '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ issueKey: 'invalid' })
  });
  assert.equal(result.status, 400);
  assert.match(result.body.error, /valid Jira issue ID/);
});

test('generate uses mocked Jira and strategy integrations', async () => {
  const app = createApp({
    config,
    template: '# Test Strategy\n\n## Introduction\n',
    getIssue: async () => ({
      key: 'QA-123',
      summary: 'Tested summary',
      issueType: 'Story',
      status: 'Open',
      priority: 'Medium',
      description: 'A source description',
      acceptanceCriteria: ['Given a valid source'],
      sourceUrl: 'https://example.atlassian.net/browse/QA-123'
    }),
    makeStrategy: async () => '# Test Strategy\n\n## Introduction\nMocked strategy.'
  });
  const result = await request(app, '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ issueKey: 'QA-123' })
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.issue.key, 'QA-123');
  assert.match(result.body.strategy, /Mocked strategy/);
});
