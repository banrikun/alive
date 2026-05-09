import { siteConfig } from '../config/status-config.js';
import { getCurrentStatus, getHoursSince, interpolate } from '../lib/status.js';
import { loadTimestamp } from './timestamp.js';
import '../styles/main.css';

const elements = {
  statusText: document.getElementById('statusText'),
  statusTextEn: document.getElementById('statusTextEn'),
  indicator: document.getElementById('indicator'),
};

const updateUI = (status, name) => {
  elements.statusText.textContent = interpolate(status.zh, name);
  elements.statusText.className = 'status-text';
  elements.statusTextEn.textContent = interpolate(status.en, name);
  elements.indicator.className = `status-indicator ${status.class}`;
};

const updateStatus = async () => {
  const timestamp = await loadTimestamp();
  const hours = getHoursSince(timestamp.last_update);
  const status = getCurrentStatus(hours, siteConfig.statusConfig);

  updateUI(status, siteConfig.name);
};

updateStatus();
