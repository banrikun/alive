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

  it('keeps UI display copy in the compiled status config', () => {
    assert.equal(siteConfig.ui.title, 'ALIVE STATUS');

    assert.deepEqual(
      siteConfig.statusConfig.map(({ ui }) => ({
        label: ui.label,
        window: ui.window,
      })),
      [
        { label: '在线活动', window: '0-24 小时' },
        { label: '长时间休息', window: '1-3 天' },
        { label: '连接延迟', window: '3-7 天' },
        { label: '静默观察', window: '7-30 天' },
        { label: '归档状态', window: '30 天以上' },
      ],
    );
  });
});
