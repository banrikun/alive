import fs from 'node:fs';

import { formatDuration, getCurrentStatus, interpolate } from './status.js';

export const readTimestampFile = (timestampPath) => {
  try {
    return JSON.parse(fs.readFileSync(timestampPath, 'utf8'));
  } catch {
    return null;
  }
};

export const shouldSendNotification = (hours, statusConfig) => {
  const currentStatus = getCurrentStatus(hours, statusConfig);

  if (!currentStatus.notify) {
    return false;
  }

  const notificationWindowStart = currentStatus.hours;
  const notificationWindowEnd = currentStatus.hours + 24;

  return hours >= notificationWindowStart && hours < notificationWindowEnd;
};

export const generateEmailBody = (name, status, timestamp, hours) => {
  const zhText = interpolate(status.zh, name);
  const enText = interpolate(status.en, name);
  const lastUpdate = new Date(timestamp.last_update).toISOString();

  return `${zhText}

${enText}

Last update: ${lastUpdate}
Time elapsed: ${formatDuration(hours)}`;
};
