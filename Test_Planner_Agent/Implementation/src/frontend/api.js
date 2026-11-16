export async function postJson(path, body, fetchImpl = fetch) {
  const response = await fetchImpl(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  let result;
  try {
    result = await response.json();
  } catch {
    const contentType = response.headers.get('content-type') ?? '';
    const message = contentType.toLowerCase().includes('json')
      ? 'The API returned invalid JSON.'
      : `The API returned a non-JSON response (HTTP ${response.status}). Check that the backend is deployed and the API route is configured.`;
    throw new Error(message);
  }

  if (!response.ok) {
    throw new Error(result?.error || 'The request failed.');
  }
  return result;
}
