import { useState } from 'react';
import { postJson } from './api.js';

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
        <p className="eyebrow">CONNECTIONS</p>
        <h1 id="settings-title">Settings</h1>
      </header>
      {notice && <p className={`notice ${notice.kind}`} role="status">{notice.text}</p>}
      <div className="settings-grid">
        <section className="settings-card">
          <div className="card-title">
            <span className="icon-tile" aria-hidden="true">J</span>
            <div><h2>Jira Connection</h2><p>Test temporary account credentials.</p></div>
          </div>
          <form onSubmit={(event) => {
            event.preventDefault();
            testConnection('jira', () => postJson('/api/settings/test-jira', jira));
          }}>
            <label>Jira domain or URL<input name="baseUrl" type="url" value={jira.baseUrl} onChange={updateJira} placeholder="https://your-domain.atlassian.net" required /></label>
            <label>Email ID<input name="email" type="email" value={jira.email} onChange={updateJira} autoComplete="off" required /></label>
            <label>API token<input name="token" type="password" value={jira.token} onChange={updateJira} autoComplete="new-password" required /></label>
            <button type="submit" className="secondary-button" disabled={Boolean(pending)}>
              {pending === 'jira' ? 'Testing…' : 'Test Connection'}
            </button>
          </form>
        </section>

        <section className="settings-card">
          <div className="card-title">
            <span className="icon-tile groq" aria-hidden="true">G</span>
            <div><h2>Groq Configuration</h2><p>Test the configured Groq model.</p></div>
          </div>
          <form onSubmit={(event) => {
            event.preventDefault();
            testConnection('groq', () => postJson('/api/settings/test-groq', { apiKey: groqApiKey }));
          }}>
            <label>Groq API token<input type="password" value={groqApiKey} onChange={(event) => setGroqApiKey(event.target.value)} autoComplete="new-password" required /></label>
            <p className="field-note">The test uses the model configured on the server and does not save this key.</p>
            <button type="submit" className="secondary-button" disabled={Boolean(pending)}>
              {pending === 'groq' ? 'Testing…' : 'Test Groq'}
            </button>
          </form>
        </section>
      </div>
      <p className="settings-footnote">Credential fields are temporary. Active generation uses server-side environment configuration.</p>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState('builder');
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
        <button className="brand" onClick={() => setPage('builder')}>
          <span className="brand-mark">TS</span>
          <span>Test Strategy <span className="brand-muted">Builder</span></span>
        </button>
        <button className={`nav-link ${page === 'builder' ? 'active' : ''}`} onClick={() => setPage('builder')}>Builder</button>
        <button className={`nav-link ${page === 'settings' ? 'active' : ''}`} onClick={() => setPage('settings')}>Settings</button>
        <span className="topbar-spacer" />
        <span className="status-pill"><span /> Jira read-only</span>
      </nav>

      {page === 'settings' ? <SettingsPage /> : (
        <section className="builder-view">
          <header className="hero">
            <p className="eyebrow">QA WORKSPACE</p>
            <h1>Turn a Jira issue into a <span>test strategy.</span></h1>
            <p className="hero-copy">Grounded in the issue details. Ready for a QA owner to review.</p>
          </header>
          <div className="builder-layout">
            <section className="request-card">
              <div className="card-title">
                <span className="icon-tile" aria-hidden="true">↗</span>
                <div><h2>Jira ticket</h2><p>Enter the issue key to retrieve its requirements.</p></div>
              </div>
              <form className="issue-form" onSubmit={generate}>
                <label htmlFor="issue-key">Issue Id</label>
                <div className="issue-input-row">
                  <input id="issue-key" value={issueKey} onChange={(event) => setIssueKey(event.target.value)} placeholder="e.g. QA-123" autoComplete="off" required disabled={pending} />
                  <button type="submit" disabled={pending || !issueKey.trim()}>
                    {pending ? 'Generating…' : 'Generate strategy'} <span aria-hidden="true">→</span>
                  </button>
                </div>
                <p className="field-note">The issue key is sent to the backend for read-only retrieval.</p>
              </form>
              {pending && <div className="loading-state" role="status"><span className="spinner" />Retrieving Jira details and drafting the strategy…</div>}
              {error && <div className="error-state" role="alert"><strong>Could not generate the strategy</strong><span>{error}</span></div>}
            </section>

            <section className={`result-card ${result ? 'has-result' : ''}`} aria-live="polite">
              {result ? (
                <>
                  <div className="result-heading">
                    <div><p className="eyebrow">DRAFT TEST STRATEGY</p><h2>{result.issue.key}: {result.issue.summary}</h2></div>
                    <a href={result.issue.sourceUrl} target="_blank" rel="noreferrer">View Jira ↗</a>
                  </div>
                  <pre className="strategy-content">{result.strategy}</pre>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-illustration" aria-hidden="true"><span>✓</span><i /><i /><i /></div>
                  <h2>Your Test Strategy will appear here</h2>
                  <p>Submit a Jira issue ID to generate a structured strategy using the supplied template.</p>
                  <span className="draft-label">DRAFT — pending human review</span>
                </div>
              )}
            </section>
          </div>
          <footer className="page-footer">Strategies are AI-generated drafts. Verify source details and review before sign-off.</footer>
        </section>
      )}
    </main>
  );
}
