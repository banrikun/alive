import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const mainCss = readFileSync(new URL('../src/styles/main.css', import.meta.url), 'utf8');

describe('page markup', () => {
  it('renders the avatar as a CSS background image container', () => {
    assert.equal(indexHtml.includes(`<${'img'}`), false);
    assert.equal(indexHtml.includes('avatar-photo'), false);
    assert.match(indexHtml, /<figure class="profile-avatar" role="img" aria-label="Br"><\/figure>/);
    assert.match(mainCss, /\.profile-avatar[\s\S]*background-image: url\("https:\/\/avatars\.githubusercontent\.com\/u\/7817228\?v=4"\)/);
    assert.match(mainCss, /\.profile-avatar[\s\S]*background-size: cover/);
  });
});
