export async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
  });

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  try {
    data = text.trim() ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Invalid API response (HTTP ${response.status})`);
  }

  if (!response.ok) {
    const error = new Error(data?.message || `API error (HTTP ${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
}
