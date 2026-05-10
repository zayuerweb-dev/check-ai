#!/usr/bin/env node
// Sync model data from models.dev → data/models-dev.json (raw) + data/models.json (transformed).
// Runs in GitHub Actions daily; commits when content changes.

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SOURCE = 'https://models.dev/api.json';
const RAW_PATH = 'data/models-dev.json';
const OUT_PATH = 'data/models.json';
const META_PATH = 'data/sync-meta.json';

function ensureDir(p) {
  const d = dirname(p);
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
}

function readJsonSafe(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

function pickPrice(model) {
  // models.dev cost structure: { input, output, cache_read?, cache_write? }
  const c = model.cost || {};
  return {
    input: c.input ?? null,
    output: c.output ?? null,
    cache_read: c.cache_read ?? null,
    cache_write: c.cache_write ?? null,
  };
}

function pickContext(model) {
  const l = model.limit || {};
  return {
    context: l.context ?? null,
    output: l.output ?? null,
  };
}

function pickCapabilities(model) {
  const mod = model.modalities || {};
  const inputs = Array.isArray(mod.input) ? mod.input : [];
  const out = [];
  if (inputs.includes('text')) out.push('text');
  if (inputs.includes('image')) out.push('vision');
  if (inputs.includes('audio')) out.push('audio');
  if (inputs.includes('video')) out.push('video');
  if (model.tool_call) out.push('tools');
  if (model.reasoning) out.push('reasoning');
  if (model.open_weights) out.push('open');
  return out;
}

function transform(raw) {
  const providers = [];
  const models = [];
  for (const [providerKey, provider] of Object.entries(raw)) {
    providers.push({
      key: providerKey,
      name: provider.name || providerKey,
      doc: provider.doc || null,
      env: Array.isArray(provider.env) ? provider.env : [],
      api: provider.api || null,
      models_count: Object.keys(provider.models || {}).length,
    });
    for (const [modelId, model] of Object.entries(provider.models || {})) {
      models.push({
        platform: providerKey,
        id: modelId,
        name: model.name || modelId,
        price: pickPrice(model),
        limit: pickContext(model),
        capabilities: pickCapabilities(model),
        release_date: model.release_date || null,
        knowledge: model.knowledge || null,
        last_updated: model.last_updated || null,
      });
    }
  }
  return { providers, models };
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function main() {
  console.log(`[sync] Fetching ${SOURCE}`);
  const res = await fetch(SOURCE, {
    headers: { 'User-Agent': 'check-ai-sync/1.0 (+https://checkaimodels.com)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${SOURCE}`);
  const raw = await res.json();

  ensureDir(RAW_PATH);
  ensureDir(OUT_PATH);

  const transformed = transform(raw);
  console.log(
    `[sync] Got ${transformed.providers.length} providers, ${transformed.models.length} models`
  );

  // Compare with existing — only write if changed.
  const oldRaw = readJsonSafe(RAW_PATH);
  const oldOut = readJsonSafe(OUT_PATH);
  const rawChanged = !deepEqual(oldRaw, raw);
  const outChanged = !deepEqual(oldOut, transformed);

  if (rawChanged) writeFileSync(RAW_PATH, JSON.stringify(raw, null, 2) + '\n');
  if (outChanged) writeFileSync(OUT_PATH, JSON.stringify(transformed, null, 2) + '\n');

  const meta = {
    source: SOURCE,
    fetched_at: new Date().toISOString(),
    providers_count: transformed.providers.length,
    models_count: transformed.models.length,
    raw_changed: rawChanged,
    out_changed: outChanged,
  };
  writeFileSync(META_PATH, JSON.stringify(meta, null, 2) + '\n');

  console.log(
    `[sync] raw_changed=${rawChanged} out_changed=${outChanged}. meta written to ${META_PATH}`
  );

  // Summary line for GitHub Actions step output (machine-readable).
  if (process.env.GITHUB_OUTPUT) {
    const fs = await import('node:fs');
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `changed=${rawChanged || outChanged}\nproviders=${transformed.providers.length}\nmodels=${transformed.models.length}\n`
    );
  }
}

main().catch((err) => {
  console.error('[sync] failed:', err);
  process.exit(1);
});
