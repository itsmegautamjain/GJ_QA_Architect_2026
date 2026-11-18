import test from 'node:test';
import assert from 'node:assert/strict';
import { postJson } from './api.js';

test('postJson exposes API error messages', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    json: async () => ({ error: 'Jira issue was not found.' })
  });
  await assert.rejects(postJson('/api/generate', { issueKey: 'QA-404' }), /Jira issue was not found/);
  delete globalThis.fetch;
});
