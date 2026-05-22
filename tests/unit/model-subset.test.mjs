import { test } from 'node:test';
import assert from 'node:assert/strict';
import { qualityProxy, isIndexable, MAJOR_BRANDS } from '../../scripts/lib/model-subset.mjs';

const g = (name, platform, ctx, caps = [], release = '2026-01-01') => ({
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  displayName: name,
  listings: [{ name, platform, id: name, limit: { context: ctx }, price: { input: 1, output: 2 }, capabilities: caps, release_date: release }],
});

test('qualityProxy rises with context and reasoning/tools', () => {
  const low = qualityProxy(g('a', 'openai', 8000).listings[0]);
  const high = qualityProxy(g('b', 'openai', 1_000_000, ['reasoning', 'tools']).listings[0]);
  assert.ok(high > low);
});

test('major-brand recent flagship is indexable', () => {
  const all = [g('GPT-5.5', 'openai', 400000, ['reasoning', 'tools'], '2026-05-01')];
  assert.equal(isIndexable(all[0], all), true);
});

test('unknown-brand model is not indexable', () => {
  const all = [g('Some Random Model', 'tinyco', 400000, ['reasoning'], '2026-05-01')];
  assert.equal(isIndexable(all[0], all), false);
});

test('old low-rank major-brand model is not indexable', () => {
  const flagships = Array.from({ length: 8 }, (_, i) =>
    g(`openai-flagship-${i}`, 'openai', 1_000_000, ['reasoning', 'tools'], '2026-05-01'));
  const stale = g('GPT-3', 'openai', 8000, [], '2022-01-01');
  const all = [...flagships, stale];
  assert.equal(isIndexable(stale, all), false);
});

test('MAJOR_BRANDS includes the core providers', () => {
  for (const b of ['openai', 'anthropic', 'google', 'deepseek', 'xai']) {
    assert.ok(MAJOR_BRANDS.has(b), `${b} should be a major brand`);
  }
});
