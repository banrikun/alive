import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it } from 'node:test';

describe('dependency boundaries', () => {
  it('deploys only current build files while preserving the published timestamp', () => {
    const workflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');

    assert.doesNotMatch(workflow, /keep_files:\s*true/);
    assert.match(workflow, /Restore published timestamp/);
    assert.match(workflow, /git fetch --depth=1 origin gh-pages:refs\/remotes\/origin\/gh-pages/);
    assert.match(workflow, /git show refs\/remotes\/origin\/gh-pages:timestamp\.json > dist\/timestamp\.json/);
  });

  it('keeps the deploy workflow free of low-value npm cache storage', () => {
    const workflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');

    assert.doesNotMatch(workflow, /cache:\s*npm/);
  });

  it('keeps workflow runs bounded and non-overlapping', () => {
    const deployWorkflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
    const statusWorkflow = fs.readFileSync('.github/workflows/status-check.yml', 'utf8');

    assert.match(deployWorkflow, /timeout-minutes:\s*10/);
    assert.match(statusWorkflow, /timeout-minutes:\s*5/);
    assert.match(statusWorkflow, /group:\s*status-check/);
  });

  it('keeps the status-check workflow independent from npm install steps', () => {
    const workflow = fs.readFileSync('.github/workflows/status-check.yml', 'utf8');

    assert.doesNotMatch(workflow, /npm ci|npm install/);
  });

  it('checks out only timestamp data from the published branch for status checks', () => {
    const workflow = fs.readFileSync('.github/workflows/status-check.yml', 'utf8');

    assert.match(workflow, /sparse-checkout:\s*\|\s*\n\s+timestamp\.json/);
    assert.match(workflow, /sparse-checkout-cone-mode:\s*false/);
  });

  it('does not depend on dayjs for simple timestamp calculations', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    assert.equal(packageJson.dependencies?.dayjs, undefined);
  });
});
