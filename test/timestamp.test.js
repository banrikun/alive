import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { loadTimestamp } from '../src/app/timestamp.js';

describe('timestamp loading', () => {
  it('falls back to the current time when timestamp data is not available', async () => {
    const timestamp = await loadTimestamp({
      fetchJson: async () => {
        throw new Error('not found');
      },
      now: new Date('2026-05-09T06:30:00.000Z'),
    });

    assert.deepEqual(timestamp, {
      last_update: '2026-05-09T06:30:00.000Z',
    });
  });

  it('keeps valid timestamp data returned by the server', async () => {
    const timestamp = await loadTimestamp({
      fetchJson: async () => ({ last_update: '2026-05-09T00:00:00.000Z' }),
      now: new Date('2026-05-09T06:30:00.000Z'),
    });

    assert.deepEqual(timestamp, {
      last_update: '2026-05-09T00:00:00.000Z',
    });
  });
});
