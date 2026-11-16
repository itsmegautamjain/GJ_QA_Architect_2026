import assert from 'node:assert/strict';
import { test } from 'node:test';
import { postJson } from './api.js';

test('non-JSON API responses produce a deployment diagnostic', async () => {
  await assert.rejects(
    postJson('/api/settings/test-jira', {}, async () => new Response(
      'The page could not be found',
      { status: 404, headers: { 'Content-Type': 'text/html' } }
    )),
    /non-JSON response \(HTTP 404\).*backend is deployed/
  );
});

test('JSON API errors preserve the server message', async () => {
  await assert.rejects(
    postJson('/api/settings/test-jira', {}, async () => Response.json(
      { error: 'Jira authentication failed.' },
      { status: 401 }
    )),
    /Jira authentication failed/
  );
});
