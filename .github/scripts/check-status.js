import fs from 'node:fs';

import { generateEmailBody, readTimestampFile, shouldSendNotification } from '../../src/notification.js';
import { siteConfig } from '../../src/status-config.js';
import { getCurrentStatus, getHoursSince, interpolate } from '../../src/status.js';

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

const timestampPath = process.env.TIMESTAMP_PATH || 'timestamp.json';
const timestamp = readTimestampFile(timestampPath);

if (!timestamp) {
  setEnvVar('SHOULD_NOTIFY', 'false');
  console.log(`No timestamp data found at ${timestampPath}; skipping notification`);
  process.exit(0);
}

const testHours = process.env.TEST_HOURS;
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

  console.log('✅ Notification will be sent');
} else {
  setEnvVar('SHOULD_NOTIFY', 'false');
  console.log('ℹ️  No notification needed (either notify=false or outside notification window)');
}
