import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { generateEmailBody, runStatusCheck, shouldSendNotification } from '../.github/scripts/check-status.js';

const statusConfig = [
  { hours: 0, zh: '${name} active', en: '${name} active', class: 'status-active', notify: false },
  { hours: 24, zh: '${name} resting', en: '${name} resting', class: 'status-resting', notify: true },
  { hours: 72, zh: '${name} disconnected', en: '${name} disconnected', class: 'status-disconnected', notify: true },
];

describe('GitHub Actions status check utilities', () => {
  it('notifies only inside the first 24 hours of a notifiable status window', () => {
    assert.equal(shouldSendNotification(23.99, statusConfig), false);
    assert.equal(shouldSendNotification(24, statusConfig), true);
    assert.equal(shouldSendNotification(47.99, statusConfig), true);
    assert.equal(shouldSendNotification(48, statusConfig), false);
    assert.equal(shouldSendNotification(72, statusConfig), true);
  });

  it('generates email content from status config and timestamp data', () => {
    const body = generateEmailBody(
      'Br',
      statusConfig[1],
      { last_update: '2026-05-09T00:00:00.000Z' },
      25,
    );

    assert.match(body, /Br resting/);
    assert.match(body, /Last update: 2026-05-09T00:00:00.000Z/);
    assert.match(body, /Time elapsed: 1 天 1 小时/);
  });

  it('keeps normal no-notification logs concise', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alive-status-'));
    const timestampPath = path.join(tmpDir, 'timestamp.json');
    fs.writeFileSync(timestampPath, JSON.stringify({ last_update: '2026-05-09T00:00:00.000Z' }));

    const logs = [];
    const originalLog = console.log;
    console.log = (message = '') => logs.push(String(message));

    try {
      runStatusCheck({ timestampPath, testHours: '1' });
    } finally {
      console.log = originalLog;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    assert(logs.some((line) => line.includes('Status check: 1.00h since last update')));
    assert(logs.some((line) => line.includes('No notification needed')));
    assert(!logs.some((line) => line.includes('Notify flag in config')));
    assert(!logs.some((line) => line.includes('Notification window')));
  });
});
