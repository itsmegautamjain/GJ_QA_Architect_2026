export function readConfig(env = process.env) {
  return {
    jiraBaseUrl: env.JIRA_BASE_URL?.trim().replace(/\/+$/, ''),
    jiraEmail: env.JIRA_EMAIL?.trim(),
    jiraToken: env.JIRA_TOKEN,
    groqApiKey: env.GROQ_API_KEY,
    groqModel: env.GROQ_MODEL?.trim()
  };
}

export function missingGenerationConfig(config) {
  return [
    ['JIRA_BASE_URL', config.jiraBaseUrl],
    ['JIRA_EMAIL', config.jiraEmail],
    ['JIRA_TOKEN', config.jiraToken],
    ['GROQ_API_KEY', config.groqApiKey],
    ['GROQ_MODEL', config.groqModel]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
}
