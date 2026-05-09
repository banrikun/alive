import { siteConfig } from './status-config.js';
import { getCurrentStatus, getHoursSince, interpolate } from './status.js';
import './styles.css';

const timestampUrl = '/timestamp.json';

const elements = {
  statusText: document.getElementById('statusText'),
  statusTextEn: document.getElementById('statusTextEn'),
  indicator: document.getElementById('indicator'),
};

const loadJson = async (url) => {
  const response = await fetch(`${url}?${Date.now()}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }

  return response.json();
};

const updateUI = (status, name) => {
  elements.statusText.textContent = interpolate(status.zh, name);
  elements.statusText.className = 'status-text';
  elements.statusTextEn.textContent = interpolate(status.en, name);
  elements.indicator.className = `status-indicator ${status.class}`;
};

const showError = (zhText, enText) => {
  elements.statusText.textContent = zhText;
  elements.statusText.className = 'status-text error';
  elements.statusTextEn.textContent = enText;
};

const updateStatus = async () => {
  try {
    const timestamp = await loadJson(timestampUrl);
    const hours = getHoursSince(timestamp.last_update);
    const status = getCurrentStatus(hours, siteConfig.statusConfig);

    updateUI(status, siteConfig.name);
  } catch {
    showError('无法加载状态', 'Unable to load status');
  }
};

updateStatus();
