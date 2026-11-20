import assert from 'node:assert/strict';
import { test } from 'node:test';
import { postJson } from './api.js';

test('postJson returns parsed successful responses', async () => {
  const result = await postJson('/api/generate', { issueKey: 'QA-123' }, async (_url, options) => {
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['Content-Type'], 'application/json');
    return new Response(JSON.stringify({ testCases: 'Draft' }), { status: 200 });
  });
  assert.deepEqual(result, { testCases: 'Draft' });
});

test('postJson surfaces safe API error messages', async () => {
  await assert.rejects(
    postJson('/api/generate', {}, async () => new Response(JSON.stringify({ error: 'Jira issue not found.' }), { status: 404 })),
    /Jira issue not found\./
  );
});
