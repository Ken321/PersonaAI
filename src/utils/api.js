export const API_BASE = import.meta.env.VITE_API_BASE || '';

export function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}

function getOpenAIKey() {
  return localStorage.getItem('openai_api_key') || '';
}

export function authHeaders(extra = {}) {
  const headers = { Authorization: `Bearer ${getToken()}`, ...extra };
  const openaiKey = getOpenAIKey();
  if (openaiKey) headers['X-OpenAI-Api-Key'] = openaiKey;
  return headers;
}
