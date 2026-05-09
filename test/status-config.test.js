import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { siteConfig } from '../src/config/status-config.js';

describe('status config', () => {
  it('keeps notify flags for GitHub Actions email decisions', () => {
    assert.deepEqual(
      siteConfig.statusConfig.map(({ hours, notify }) => ({ hours, notify })),
      [
        { hours: 0, notify: false },
        { hours: 24, notify: true },
        { hours: 72, notify: true },
        { hours: 168, notify: true },
        { hours: 720, notify: true },
      ],
    );
  });
});
