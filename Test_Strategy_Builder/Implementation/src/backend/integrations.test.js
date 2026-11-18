import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidIssueKey, normalizeIssue } from './jira.js';
import { validateStrategyStructure } from './strategy.js';

test('issue key validation accepts Jira-style keys', () => {
  assert.equal(isValidIssueKey('QA-123'), true);
  assert.equal(isValidIssueKey('qa_1-42'), true);
  assert.equal(isValidIssueKey('123'), false);
});

test('normalizeIssue preserves source metadata and source URL', () => {
  const issue = normalizeIssue({
    key: 'QA-123',
    names: { customfield_1: 'Acceptance Criteria' },
    fields: {
      summary: 'Source summary',
      issuetype: { name: 'Story' },
      status: { name: 'Open' },
      priority: { name: 'High' },
      description: { type: 'paragraph', content: [{ text: 'Source description' }] },
      customfield_1: 'Given source criteria'
    }
  }, 'https://example.atlassian.net');

  assert.equal(issue.key, 'QA-123');
  assert.equal(issue.description, 'Source description');
  assert.equal(issue.acceptanceCriteria[0], 'Acceptance Criteria: Given source criteria');
  assert.equal(issue.sourceUrl, 'https://example.atlassian.net/browse/QA-123');
});

test('strategy structure validation requires template headings in order', () => {
  const template = '# Test Strategy\n\n## Introduction\n\n## Test Approach';
  assert.equal(validateStrategyStructure('# Test Strategy\n\n## Introduction\n\n## Test Approach\n', template), true);
  assert.equal(validateStrategyStructure('# Test Strategy\n\n## Test Approach\n\n## Introduction\n', template), false);
});
