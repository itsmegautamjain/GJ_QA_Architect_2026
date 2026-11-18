export class IntegrationError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = 'IntegrationError';
    this.status = status;
  }
}

export function isValidIssueKey(value) {
  return typeof value === 'string' && /^[A-Z][A-Z0-9_]*-\d+$/i.test(value.trim());
}

export function jiraApiVersion(baseUrl) {
  const hostname = new URL(baseUrl).hostname.toLowerCase();
  return hostname.endsWith('.atlassian.net') ? '3' : '2';
}

function toPlainText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(toPlainText).filter(Boolean).join('\n');
  if (!value || typeof value !== 'object') return '';
  if (typeof value.text === 'string') return value.text;
  const content = toPlainText(value.content);
  return value.type === 'paragraph' || value.type === 'listItem' ? `${content}\n` : content;
}

export function normalizeIssue(issue, baseUrl) {
  const fields = issue.fields ?? {};
  const fieldNames = issue.names ?? {};
  const requirements = Object.entries(fields)
    .filter(([id]) => /customfield/i.test(id))
    .map(([id, value]) => ({
      name: fieldNames[id],
      value: toPlainText(value).trim()
    }))
    .filter(({ name, value }) => value && /acceptance criteria|requirement/i.test(name ?? ''))
    .map(({ name, value }) => `${name}: ${value}`);

  return {
    key: issue.key,
    summary: fields.summary ?? '',
    issueType: fields.issuetype?.name ?? '',
    status: fields.status?.name ?? '',
    priority: fields.priority?.name ?? '',
    description: toPlainText(fields.description).trim(),
    acceptanceCriteria: requirements,
    sourceUrl: `${baseUrl}/browse/${encodeURIComponent(issue.key)}`
  };
}

export async function fetchJiraIssue({ baseUrl, email, token, issueKey, fetchImpl = fetch }) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  let version;
  try {
    version = jiraApiVersion(normalizedBaseUrl);
  } catch {
    throw new IntegrationError('Jira base URL is invalid.', 503);
  }

  const url = new URL(`${normalizedBaseUrl}/rest/api/${version}/issue/${encodeURIComponent(issueKey)}`);
  url.searchParams.set('fields', '*all');
  url.searchParams.set('expand', 'names');

  let response;
  try {
    response = await fetchImpl(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`,
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });
  } catch {
    throw new IntegrationError('Could not reach Jira. Check the URL and network connection.', 502);
  }

  if (response.status === 401) throw new IntegrationError('Jira authentication failed. Check the configured email and token.', 401);
  if (response.status === 403) throw new IntegrationError('The configured Jira account does not have permission to read this issue.', 403);
  if (response.status === 404) throw new IntegrationError('The Jira issue was not found or is not available to this account.', 404);
  if (!response.ok) throw new IntegrationError(`Jira returned an unexpected response (${response.status}).`, 502);

  try {
    return normalizeIssue(await response.json(), normalizedBaseUrl);
  } catch {
    throw new IntegrationError('Jira returned an unreadable issue response.', 502);
  }
}

export async function testJiraConnection({ baseUrl, email, token, fetchImpl = fetch }) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  let version;
  try {
    version = jiraApiVersion(normalizedBaseUrl);
  } catch {
    throw new IntegrationError('Jira base URL is invalid.', 400);
  }

  let response;
  try {
    response = await fetchImpl(`${normalizedBaseUrl}/rest/api/${version}/myself`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`,
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
  } catch {
    throw new IntegrationError('Could not reach Jira. Check the URL and network connection.', 502);
  }
  if (response.status === 401) throw new IntegrationError('Jira authentication failed. Check the entered email and token.', 401);
  if (response.status === 403) throw new IntegrationError('The Jira account could not access the connection check.', 403);
  if (!response.ok) throw new IntegrationError(`Jira connection check failed (${response.status}).`, 502);
}
