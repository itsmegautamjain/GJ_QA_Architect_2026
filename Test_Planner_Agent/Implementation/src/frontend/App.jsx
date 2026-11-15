import { useState } from 'react';

async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'The request failed.');
  return result;
}

function SettingsPage() {
  const [jira, setJira] = useState({ baseUrl: '', email: '', token: '' });
  const [groqApiKey, setGroqApiKey] = useState('');
  const [pending, setPending] = useState('');
  const [notice, setNotice] = useState(null);

  async function testConnection(name, action) {
    setPending(name);
    setNotice(null);
    try {
      const result = await action();
      setNotice({ kind: 'success', text: result.message });
    } catch (error) {
      setNotice({ kind: 'error', text: error.message });
    } finally {
      setPending('');
    }
  }

  function updateJira(event) {
    setJira({ ...jira, [event.target.name]: event.target.value });
  }

  return (
    <section className="settings-view" aria-labelledby="settings-title">
      <header className="section-heading">
        <div>
          <p className="eyebrow">CONNECTIONS</p>
          <h1 id="settings-title">Settings</h1>
        </div>
      </header>
      {notice && <p className={`notice ${notice.kind}`} role="status">{notice.text}</p>}
      <div className="settings-grid">
        <section className="settings-card">
          <div className="card-title">
            <span className="icon-tile" aria-hidden="true">J</span>
            <div><h2>Jira Connection</h2><p>Test an account without saving credentials.</p></div>
          </div>
          <form onSubmit={(event) => {
            event.preventDefault();
            testConnection('jira', () => postJson('/api/settings/test-jira', jira));
          }}>
            <label>Jira URL<input name="baseUrl" type="url" value={jira.baseUrl} onChange={updateJira} placeholder="https://your-domain.atlassian.net" required /></label>
            <label>Email<input name="email" type="email" value={jira.email} onChange={updateJira} autoComplete="off" required /></label>
            <label>API token<input name="token" type="password" value={jira.token} onChange={updateJira} autoComplete="new-password" required /></label>
            <button type="submit" className="secondary-button" disabled={Boolean(pending)}>
              {pending === 'jira' ? 'Testing…' : 'Test Connection'}
            </button>
          </form>
        </section>

        <section className="settings-card">
          <div className="card-title">
            <span className="icon-tile groq" aria-hidden="true">G</span>
            <div><h2>LLM Configuration</h2><p>Groq cloud connection</p></div>
          </div>
          <form onSubmit={(event) => {
            event.preventDefault();
            testConnection('groq', () => postJson('/api/settings/test-groq', { apiKey: groqApiKey }));
          }}>
            <label>Groq API key<input type="password" value={groqApiKey} onChange={(event) => setGroqApiKey(event.target.value)} autoComplete="new-password" required /></label>
            <p className="field-note">The test checks the model configured in the backend environment.</p>
            <button type="submit" className="secondary-button" disabled={Boolean(pending)}>
              {pending === 'groq' ? 'Testing…' : 'Test Groq.com'}
            </button>
          </form>
        </section>
      </div>
      <p className="settings-footnote">These fields are temporary and are not saved. Active generation uses credentials in the server-side .env file.</p>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState('planner');
  const [issueKey, setIssueKey] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function generate(event) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    setResult(null);
    try {
      setResult(await postJson('/api/generate', { issueKey }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setPage('planner'); }}>
          <span className="brand-mark">TP</span>
          <span>Test Plan <span className="brand-muted">Studio</span></span>
        </a>
        <button className={`nav-link ${page === 'planner' ? 'active' : ''}`} onClick={() => setPage('planner')}>Planner</button>
        <button className={`nav-link ${page === 'settings' ? 'active' : ''}`} onClick={() => setPage('settings')}>Settings</button>
        <span className="topbar-spacer" />
        <span className="status-pill"><span /> Jira test planning</span>
      </nav>

      {page === 'settings' ? <SettingsPage /> : (
        <section className="planner-view">
          <header className="hero">
            <p className="eyebrow">QA WORKSPACE</p>
            <h1>Turn a Jira issue into a <span>test plan.</span></h1>
            <p className="hero-copy">Grounded in the issue details. Ready for a QA owner to review.</p>
          </header>
          <div className="planner-layout">
            <section className="request-card">
              <div className="card-title">
                <span className="icon-tile" aria-hidden="true">↗</span>
                <div><h2>Jira ticket</h2><p>Enter the issue key to retrieve its requirements.</p></div>
              </div>
              <form className="issue-form" onSubmit={generate}>
                <label htmlFor="issue-key">Issue ID</label>
                <div className="issue-input-row">
                  <input id="issue-key" value={issueKey} onChange={(event) => setIssueKey(event.target.value)} placeholder="e.g. QA-123" autoComplete="off" required disabled={pending} />
                  <button type="submit" disabled={pending || !issueKey.trim()}>{pending ? 'Generating…' : 'Generate plan'} <span aria-hidden="true">→</span></button>
                </div>
                <p className="field-note">The issue key is sent to the backend for read-only retrieval.</p>
              </form>
              {pending && <div className="loading-state" role="status"><span className="spinner" />Retrieving Jira details and drafting the plan…</div>}
              {error && <div className="error-state" role="alert"><strong>Could not generate the plan</strong><span>{error}</span></div>}
            </section>

            <section className={`result-card ${result ? 'has-result' : ''}`} aria-live="polite">
              {result ? (
                <>
                  <div className="result-heading">
                    <div><p className="eyebrow">DRAFT TEST PLAN</p><h2>{result.issue.key}: {result.issue.summary}</h2></div>
                    <a href={result.issue.sourceUrl} target="_blank" rel="noreferrer">View Jira ↗</a>
                  </div>
                  <pre className="plan-content">{result.plan}</pre>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-illustration" aria-hidden="true"><span>✓</span><i /><i /><i /></div>
                  <h2>Your test plan will appear here</h2>
                  <p>Submit a Jira issue ID to draft a structured plan using the approved template.</p>
                  <span className="draft-label">DRAFT — pending human review</span>
                </div>
              )}
            </section>
          </div>
          <footer className="page-footer">Plans are AI-generated drafts. Verify source details and review before sign-off.</footer>
        </section>
      )}
    </main>
  );
}
