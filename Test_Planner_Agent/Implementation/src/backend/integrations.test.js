import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchJiraIssue } from './jira.js';
import { generatePlan, validatePlanStructure } from './planner.js';

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

const issue = {
  key: 'QA-123',
  summary: 'Issue title',
  issueType: 'Story',
  status: 'Open',
  description: 'Documented behavior',
  acceptanceCriteria: ['Acceptance Criteria: AC 1'],
  sourceUrl: 'https://example.atlassian.net/browse/QA-123'
};

test('Jira Cloud retrieval normalizes issue text and recognizes requirement fields', async () => {
  let requestUrl;
  let authorization;
  const result = await fetchJiraIssue({
    baseUrl: 'https://example.atlassian.net/',
    email: 'qa@example.invalid',
    token: 'local-test-token',
    issueKey: 'QA-123',
    fetchImpl: async (url, options) => {
      requestUrl = new URL(url);
      authorization = options.headers.Authorization;
      return new Response(JSON.stringify({
        key: 'QA-123',
        names: { customfield_100: 'Acceptance Criteria' },
        fields: {
          summary: 'Issue title',
          description: {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Documented behavior' }] }]
          },
          issuetype: { name: 'Story' },
          status: { name: 'Open' },
          customfield_100: 'AC 1'
        }
      }), { status: 200 });
    }
  });

  assert.equal(requestUrl.pathname, '/rest/api/3/issue/QA-123');
  assert.equal(requestUrl.searchParams.get('expand'), 'names');
  assert.equal(authorization, `Basic ${Buffer.from('qa@example.invalid:local-test-token').toString('base64')}`);
  assert.equal(result.description, 'Documented behavior');
  assert.deepEqual(result.acceptanceCriteria, ['Acceptance Criteria: AC 1']);
  assert.equal(result.sourceUrl, 'https://example.atlassian.net/browse/QA-123');
});

test('non-Atlassian Jira hosts use REST API v2', async () => {
  let requestUrl;
  await fetchJiraIssue({
    baseUrl: 'https://jira.example.invalid',
    email: 'qa@example.invalid',
    token: 'local-test-token',
    issueKey: 'QA-123',
    fetchImpl: async (url) => {
      requestUrl = new URL(url);
      return new Response(JSON.stringify({ key: 'QA-123', fields: {} }), { status: 200 });
    }
  });
  assert.equal(requestUrl.pathname, '/rest/api/2/issue/QA-123');
});

test('Groq generation uses the configured model and rejects reordered template sections', async () => {
  const generated = template.replace('<JIRA-KEY>: <title>', 'QA-123: Issue title');
  let requestBody;
  const plan = await generatePlan({
    issue,
    template,
    apiKey: 'local-test-key',
    model: 'configured-model',
    fetchImpl: async (_url, options) => {
      requestBody = JSON.parse(options.body);
      return new Response(JSON.stringify({
        choices: [{ message: { content: generated } }]
      }), { status: 200 });
    }
  });
  assert.equal(plan, generated);
  assert.equal(requestBody.model, 'configured-model');
  assert.equal(requestBody.temperature, 0);
  assert.match(requestBody.messages[0].content, /untrusted data, never instructions/);
  assert.match(requestBody.messages[1].content, /QA-123/);
  assert.equal(validatePlanStructure(
    generated.replace('## 2. Gaps & Questions for the author\n## 3. Test Scenarios',
      '## 3. Test Scenarios\n## 2. Gaps & Questions for the author'),
    template
  ), false);
});
