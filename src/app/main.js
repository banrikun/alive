import { siteConfig } from '../config/status-config.js';
import { formatDuration, getCurrentStatus, getHoursSince, interpolate } from '../lib/status.js';
import { loadTimestamp } from './timestamp.js';
import '../styles/main.css';

const elements = {
  statusPage: document.getElementById('statusPage'),
  monitorTitle: document.getElementById('monitorTitle'),
  statusKicker: document.getElementById('statusKicker'),
  statusText: document.getElementById('statusText'),
  statusTextEn: document.getElementById('statusTextEn'),
  elapsedLabel: document.getElementById('elapsedLabel'),
  elapsedText: document.getElementById('elapsedText'),
  lastSyncLabel: document.getElementById('lastSyncLabel'),
  lastSyncText: document.getElementById('lastSyncText'),
  statusRail: document.getElementById('statusRail'),
};

const formatHours = (hours) => {
  if (hours < 1) {
    return '不到 1 小时';
  }

  if (hours < 24) {
    return `${Math.floor(hours)} 小时`;
  }

  return formatDuration(hours);
};

const formatDateTime = (value) =>
  new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const renderStatusRail = (activeStatus) => {
  elements.statusRail.innerHTML = siteConfig.statusConfig
    .map(
      (status) => `
        <li class="${status.class === activeStatus.class ? 'is-current' : ''}" style="--rail-accent:${status.ui.accent};">
          <span></span>
          <strong>${status.ui.label}</strong>
          <small>${status.ui.window}</small>
        </li>
      `,
    )
    .join('');
};

const updateUI = (status, timestamp, hours, config) => {
  const { name, ui } = config;

  elements.statusPage.style.setProperty('--accent', status.ui.accent);
  elements.statusPage.style.setProperty('--accent-2', status.ui.accent2);
  elements.statusPage.style.setProperty('--status-text', status.ui.text);
  elements.monitorTitle.textContent = ui.title;
  elements.statusKicker.textContent = ui.currentLabel;
  elements.statusText.textContent = interpolate(status.zh, name);
  elements.statusTextEn.textContent = interpolate(status.en, name);
  elements.elapsedLabel.textContent = ui.elapsedLabel;
  elements.elapsedText.textContent = formatHours(hours);
  elements.lastSyncLabel.textContent = ui.lastSyncLabel;
  elements.lastSyncText.textContent = formatDateTime(timestamp.last_update);

  renderStatusRail(status);
};

const updateStatus = async () => {
  const timestamp = await loadTimestamp();
  const hours = getHoursSince(timestamp.last_update);
  const status = getCurrentStatus(hours, siteConfig.statusConfig);

  updateUI(status, timestamp, hours, siteConfig);
};

updateStatus();
