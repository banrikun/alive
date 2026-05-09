import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatDuration,
  getCurrentStatus,
  getHoursSince,
  interpolate,
} from '../src/status.js';

const statusConfig = [
  { hours: 0, zh: '${name} active', en: '${name} active', class: 'status-active', notify: false },
  { hours: 24, zh: '${name} resting', en: '${name} resting', class: 'status-resting', notify: true },
  { hours: 72, zh: '${name} disconnected', en: '${name} disconnected', class: 'status-disconnected', notify: true },
];

describe('status utilities', () => {
  it('selects the latest status threshold that does not exceed elapsed hours', () => {
    assert.equal(getCurrentStatus(0, statusConfig).class, 'status-active');
    assert.equal(getCurrentStatus(23.99, statusConfig).class, 'status-active');
    assert.equal(getCurrentStatus(24, statusConfig).class, 'status-resting');
    assert.equal(getCurrentStatus(120, statusConfig).class, 'status-disconnected');
  });

  it('interpolates the configured display name only when the placeholder is present', () => {
    assert.equal(interpolate('${name} is alive', 'Br'), 'Br is alive');
    assert.equal(interpolate('The past is gone', 'Br'), 'The past is gone');
  });

  it('calculates elapsed hours from an ISO timestamp', () => {
    const hours = getHoursSince('2026-05-09T00:00:00.000Z', new Date('2026-05-09T06:30:00.000Z'));

    assert.equal(hours, 6.5);
  });

  it('formats elapsed duration as days and hours', () => {
    assert.equal(formatDuration(6.5), '0 天 6 小时');
    assert.equal(formatDuration(73.2), '3 天 1 小时');
  });
});
