import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { generateEmailBody, shouldSendNotification } from '../.github/scripts/check-status.js';

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
});
