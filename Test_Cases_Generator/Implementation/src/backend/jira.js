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
  return value.type === 'paragraph' || value.type === 'listItem'
    ? `${content}\n`
    : content;
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
    .filter(({ name, value }) =>
      value && /acceptance criteria|requirement/i.test(name ?? '')
    )
    .map(({ name, value }) => `${name}: ${value}`);

  return {
    key: issue.key,
    summary: fields.summary ?? '',
    issueType: fields.issuetype?.name ?? '',
    status: fields.status?.name ?? '',
    description: toPlainText(fields.description).trim(),
    requirements,
    sourceUrl: `${baseUrl}/browse/${encodeURIComponent(issue.key)}`
  };
}

function jiraUrl(baseUrl, path) {
  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new IntegrationError('Jira base URL is invalid.', 400);
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new IntegrationError('Jira base URL must be an HTTP(S) URL without embedded credentials.', 400);
  }
  const normalizedBaseUrl = parsed.toString().replace(/\/+$/, '');
  const version = jiraApiVersion(normalizedBaseUrl);
  return {
    baseUrl: normalizedBaseUrl,
    url: `${normalizedBaseUrl}/rest/api/${version}/${path}`
  };
}

async function jiraRequest({ baseUrl, email, token, path, fetchImpl, failureMessages }) {
  const request = jiraUrl(baseUrl, path);
  let response;
  try {
    response = await fetchImpl(request.url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`,
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });
  } catch {
    throw new IntegrationError('Could not reach Jira. Check the URL and network connection.', 502);
  }
  if (response.status === 401) throw new IntegrationError(failureMessages.authentication, 401);
  if (response.status === 403) throw new IntegrationError(failureMessages.permission, 403);
  if (response.status === 404 && failureMessages.notFound) {
    throw new IntegrationError(failureMessages.notFound, 404);
  }
  if (!response.ok) {
    throw new IntegrationError(`Jira returned an unexpected response (${response.status}).`, 502);
  }
  return { response, baseUrl: request.baseUrl };
}

export async function fetchJiraIssue({ baseUrl, email, token, issueKey, fetchImpl = fetch }) {
  const { response, baseUrl: normalizedBaseUrl } = await jiraRequest({
    baseUrl,
    email,
    token,
    path: `issue/${encodeURIComponent(issueKey)}?fields=*all&expand=names`,
    fetchImpl,
    failureMessages: {
      authentication: 'Jira authentication failed. Check the configured email and token.',
      permission: 'The configured Jira account does not have permission to read this issue.',
      notFound: 'The Jira issue was not found or is not available to this account.'
    }
  });
  try {
    return normalizeIssue(await response.json(), normalizedBaseUrl);
  } catch (error) {
    if (error instanceof IntegrationError) throw error;
    throw new IntegrationError('Jira returned an unreadable issue response.', 502);
  }
}

export async function testJiraConnection({ baseUrl, email, token, fetchImpl = fetch }) {
  await jiraRequest({
    baseUrl,
    email,
    token,
    path: 'myself',
    fetchImpl,
    failureMessages: {
      authentication: 'Jira authentication failed. Check the entered email and token.',
      permission: 'The Jira account could not access the connection check.'
    }
  });
}
