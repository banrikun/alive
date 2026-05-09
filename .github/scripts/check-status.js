import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteConfig } from '../../src/config/status-config.js';
import {
  formatDuration,
  formatIsoTimestamp,
  getCurrentStatus,
  getHoursSince,
  interpolate,
} from '../../src/lib/status.js';

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
  const lastUpdate = formatIsoTimestamp(timestamp.last_update);

  return `${zhText}

${enText}

Last update: ${lastUpdate}
Time elapsed: ${formatDuration(hours)}`;
};

const setEnvVar = (key, value) => {
  if (!process.env.GITHUB_ENV) {
    console.log(`${key}=${value}`);
    return;
  }

  fs.appendFileSync(process.env.GITHUB_ENV, `${key}=${value}\n`);
};

const setMultilineEnvVar = (key, value) => {
  if (!process.env.GITHUB_ENV) {
    console.log(`${key}=`);
    console.log(value);
    return;
  }

  const delimiter = `EOF_${key}`;
  fs.appendFileSync(process.env.GITHUB_ENV, `${key}<<${delimiter}\n${value}\n${delimiter}\n`);
};

export const runStatusCheck = ({
  timestampPath = process.env.TIMESTAMP_PATH || 'timestamp.json',
  testHours = process.env.TEST_HOURS,
} = {}) => {
  const timestamp = readTimestampFile(timestampPath);

  if (!timestamp) {
    setEnvVar('SHOULD_NOTIFY', 'false');
    console.log(`No timestamp data found at ${timestampPath}; skipping notification`);
    return;
  }

  const hours = testHours ? parseFloat(testHours) : getHoursSince(timestamp.last_update);

  console.log(`Hours since last update: ${hours.toFixed(2)}`);

  const currentStatus = getCurrentStatus(hours, siteConfig.statusConfig);
  const statusText = interpolate(currentStatus.zh, siteConfig.name);

  console.log(`Current status: ${statusText}`);
  console.log(`Notify flag in config: ${currentStatus.notify}`);
  console.log(`Status starts at: ${currentStatus.hours}h`);
  console.log(`Notification window: ${currentStatus.hours}h - ${currentStatus.hours + 24}h`);

  const shouldNotify = shouldSendNotification(hours, siteConfig.statusConfig);
  console.log(`Current hours (${hours.toFixed(2)}) in notification window: ${shouldNotify}`);

  if (shouldNotify) {
    const emailSubject = `Status Alert: ${statusText}`;
    const emailBody = generateEmailBody(siteConfig.name, currentStatus, timestamp, hours);

    setEnvVar('SHOULD_NOTIFY', 'true');
    setEnvVar('EMAIL_SUBJECT', emailSubject);
    setMultilineEnvVar('EMAIL_BODY', emailBody);

    console.log('Notification will be sent');
    return;
  }

  setEnvVar('SHOULD_NOTIFY', 'false');
  console.log('No notification needed (either notify=false or outside notification window)');
};

const isDirectRun = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isDirectRun) {
  runStatusCheck();
}
