import express from 'express';
import { missingGenerationConfig } from './config.js';
import { fetchJiraIssue, IntegrationError, isValidIssueKey, testJiraConnection } from './jira.js';
import { generateStrategy } from './strategy.js';

function requiredText(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new IntegrationError(`${label} is required.`, 400);
  }
  return value.trim();
}

export function createApp({
  config,
  template,
  fetchImpl = fetch,
  getIssue = fetchJiraIssue,
  makeStrategy = generateStrategy,
  checkJira = testJiraConnection
}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.post('/api/generate', async (request, response) => {
    try {
      const issueKey = requiredText(request.body?.issueKey, 'Jira issue ID').toUpperCase();
      if (!isValidIssueKey(issueKey)) {
        throw new IntegrationError('Enter a valid Jira issue ID, such as QA-123.', 400);
      }
      const missing = missingGenerationConfig(config);
      if (missing.length) {
        throw new IntegrationError(`Server configuration is incomplete: ${missing.join(', ')}.`, 503);
      }
      const issue = await getIssue({
        baseUrl: config.jiraBaseUrl,
        email: config.jiraEmail,
        token: config.jiraToken,
        issueKey,
        fetchImpl
      });
      const strategy = await makeStrategy({
        issue,
        template,
        apiKey: config.groqApiKey,
        model: config.groqModel,
        fetchImpl
      });
      response.json({ issue, strategy });
    } catch (error) {
      const status = error instanceof IntegrationError ? error.status : 500;
      response.status(status).json({
        error: error instanceof IntegrationError
          ? error.message
          : 'An unexpected error occurred while generating the test strategy.'
      });
    }
  });

  app.post('/api/settings/test-jira', async (request, response) => {
    try {
      const baseUrl = requiredText(request.body?.baseUrl, 'Jira URL').replace(/\/+$/, '');
      const email = requiredText(request.body?.email, 'Jira email');
      const token = requiredText(request.body?.token, 'Jira API token');
      await checkJira({ baseUrl, email, token, fetchImpl });
      response.json({ message: 'Jira connection successful.' });
    } catch (error) {
      const status = error instanceof IntegrationError ? error.status : 500;
      response.status(status).json({
        error: error instanceof IntegrationError ? error.message : 'Jira connection test failed unexpectedly.'
      });
    }
  });

  app.post('/api/settings/test-groq', async (request, response) => {
    try {
      const apiKey = requiredText(request.body?.apiKey, 'Groq API key');
      if (!config.groqModel) {
        throw new IntegrationError('Server configuration is incomplete: GROQ_MODEL.', 503);
      }
      const result = await fetchImpl('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000)
      });
      if (result.status === 401 || result.status === 403) {
        throw new IntegrationError('Groq authentication failed. Check the entered API key.', 401);
      }
      if (!result.ok) {
        throw new IntegrationError(`Groq connection check failed (${result.status}).`, 502);
      }
      const models = await result.json();
      if (!models.data?.some(({ id }) => id === config.groqModel)) {
        throw new IntegrationError('Groq is reachable, but the configured GROQ_MODEL is not available for this API key.', 400);
      }
      response.json({ message: 'Groq connection successful.' });
    } catch (error) {
      const status = error instanceof IntegrationError ? error.status : 502;
      response.status(status).json({
        error: error instanceof IntegrationError ? error.message : 'Could not complete the Groq connection test.'
      });
    }
  });

  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.parse.failed') return response.status(400).json({ error: 'Request body must be valid JSON.' });
    if (error?.type === 'entity.too.large') return response.status(413).json({ error: 'Request body is too large.' });
    return response.status(500).json({ error: 'An unexpected server error occurred.' });
  });
  return app;
}
