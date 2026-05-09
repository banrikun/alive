import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it } from 'node:test';

describe('dependency boundaries', () => {
  it('keeps the status-check workflow independent from npm install steps', () => {
    const workflow = fs.readFileSync('.github/workflows/status-check.yml', 'utf8');

    assert.doesNotMatch(workflow, /npm ci|npm install/);
  });

  it('does not depend on dayjs for simple timestamp calculations', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    assert.equal(packageJson.dependencies?.dayjs, undefined);
  });
});
