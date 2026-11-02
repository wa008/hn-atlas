import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CATEGORY_IDS} from '../lib/categories.js';

test('Directory data and categories are well-formed', async () => {
  const data = JSON.parse(await readFile(new URL('../data/sites.json', import.meta.url), 'utf8'));
  assert.equal(typeof data.reviewedOn, 'string');
  assert.deepEqual(data.categories.map(c => c.id).sort(), [...CATEGORY_IDS].sort());
  for (const site of data.sites) {
    assert(site.id && /^[a-z0-9-]+$/.test(site.id), `Invalid site ID: ${site.id}`);
    assert(site.name, `Site missing name: ${site.id}`);
    assert(site.url && site.url.startsWith('http'), `Invalid URL for ${site.id}`);
    assert(CATEGORY_IDS.includes(site.category), `Invalid category for ${site.id}: ${site.category}`);
    assert(site.description && site.description.length <= 100, `Description too long or missing for ${site.id}`);
  }
});
