import { normalizeTimestamp } from '../lib/status.js';

export const timestampUrl = '/timestamp.json';

export const fetchTimestampJson = async (url = timestampUrl) => {
  const response = await fetch(`${url}?${Date.now()}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }

  return response.json();
};

export const loadTimestamp = async ({
  url = timestampUrl,
  fetchJson = fetchTimestampJson,
  now = new Date(),
} = {}) => {
  try {
    return normalizeTimestamp(await fetchJson(url), now);
  } catch {
    return normalizeTimestamp(null, now);
  }
};
