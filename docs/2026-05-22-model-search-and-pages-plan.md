# Model Search + Revive Model Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 1787 `/models/<slug>/` pages findable (unified search → in-SPA modal + 「查看完整页」link) and turn a curated ~80-model subset into rich, Chinese, indexable SEO pages while the long tail stays `noindex` but searchable.

**Architecture:** A shared pure rule (`scripts/lib/model-subset.mjs`) decides which models are indexable; `build-model-pages.mjs` rewrites every page to Chinese with data-driven unique blocks and emits `index`/`noindex` per the rule plus a `data/model-slugs.json` manifest; `build-sitemap.mjs` adds only the indexable subset; `app.js` gains a separator-insensitive model search that renders a 模型 results group and a 「查看完整页」link in the existing detail modal (shown only when the page exists, per the manifest).

**Tech Stack:** Node ESM (`.mjs`), `node:test` (built-in, zero-dep) for unit tests, Playwright for e2e. No new deps. Data source for pages: `data/models.json`; the SPA reads `/data/models-dev.json`.

---

## File Structure

| File | Responsibility |
|---|---|
| `scripts/lib/model-subset.mjs` | NEW. Pure rule: `qualityProxy(listing)`, `isIndexable(group, allGroups)`, brand allowlist. Shared by build-model-pages + build-sitemap so they agree. |
| `tests/unit/model-subset.test.mjs` | NEW. `node --test` unit tests for the rule. |
| `scripts/build-model-pages.mjs` | REWRITE. zh output, data-driven blocks, peer table, zh verdict (template + optional override), per-page robots, writes `data/model-slugs.json`. |
| `data/model-pages.json` | NEW (optional). `{ "<slug>": { "verdictZh": "..." } }` hand-written overrides for top models. May be an empty `{}` to start. |
| `data/model-slugs.json` | GENERATED. `[{ "slug","name","indexable" }]` — the SPA reads it to know which pages exist + are indexable. |
| `scripts/build-sitemap.mjs` | MODIFY. Include indexable model pages from the manifest; keep the long tail out. |
| `app.js` | MODIFY. `canonSlug()`, fetch manifest, `filteredModels()`, render 模型 group, 「查看完整页」link in `openModel`, link model rows. |
| `tests/e2e/model-search.spec.mjs` | NEW. search → 模型 group → modal → 完整页 link → page 200. |
| `index.html` | MODIFY. bump `app.js` cache-bust. |
| `models/<slug>/index.html` | REGENERATED (committed). |

---

## Task 1: Indexable-subset rule + unit test

**Files:**
- Create: `scripts/lib/model-subset.mjs`
- Test: `tests/unit/model-subset.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/model-subset.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/unit/model-subset.test.mjs`
Expected: FAIL — `Cannot find module '../../scripts/lib/model-subset.mjs'`.

- [ ] **Step 3: Write the rule**

Create `scripts/lib/model-subset.mjs`:

```javascript
// Shared rule for which model pages are indexable (rich + in sitemap) vs the
// noindex long tail. Pure functions so build-model-pages and build-sitemap agree.

export const MAJOR_BRANDS = new Set([
  'openai', 'anthropic', 'google', 'deepseek', 'xai', 'qwen', 'alibaba',
  'mistral', 'meta', 'llama', 'moonshot', 'zhipu',
]);

const TOP_PER_BRAND = 6;
const RECENT_MONTHS = 9;
const HARD_CAP = 80;

// A context/capability-derived score (mirrors the SPA's quality heuristic so
// ranking is consistent). data/models.json has no stored quality field.
export function qualityProxy(listing) {
  const ctx = Number(listing?.limit?.context ?? 0);
  const caps = listing?.capabilities || [];
  const ctxBoost = ctx > 0 ? Math.min(12, Math.round(Math.log10(ctx) * 2)) : 0;
  const reasoning = caps.includes('reasoning') ? 6 : 0;
  const tools = caps.includes('tools') ? 3 : 0;
  return Math.max(60, Math.min(98, 70 + ctxBoost + reasoning + tools));
}

function bestOf(group) {
  return [...group.listings].sort(
    (a, b) => (a.price?.input ?? Infinity) - (b.price?.input ?? Infinity),
  )[0];
}

function brandOf(group) {
  return bestOf(group).platform;
}

function isRecent(group) {
  const d = Date.parse(bestOf(group).release_date || '');
  if (Number.isNaN(d)) return false;
  const cutoff = Date.now() - RECENT_MONTHS * 30 * 24 * 60 * 60 * 1000;
  return d >= cutoff;
}

// Returns the Set of slugs that are indexable, computed once over all groups.
export function indexableSlugs(allGroups) {
  const byBrand = new Map();
  for (const g of allGroups) {
    const brand = brandOf(g);
    if (!MAJOR_BRANDS.has(brand)) continue;
    if (!byBrand.has(brand)) byBrand.set(brand, []);
    byBrand.get(brand).push(g);
  }
  const picked = new Set();
  for (const [, groups] of byBrand) {
    const ranked = [...groups].sort((a, b) => qualityProxy(bestOf(b)) - qualityProxy(bestOf(a)));
    ranked.forEach((g, i) => { if (i < TOP_PER_BRAND || isRecent(g)) picked.add(g.slug); });
  }
  // Hard cap: keep highest quality across the picked set.
  if (picked.size > HARD_CAP) {
    const ordered = allGroups
      .filter((g) => picked.has(g.slug))
      .sort((a, b) => qualityProxy(bestOf(b)) - qualityProxy(bestOf(a)))
      .slice(0, HARD_CAP)
      .map((g) => g.slug);
    return new Set(ordered);
  }
  return picked;
}

// Convenience single-group check (used by tests). O(n) per call — for bulk use
// indexableSlugs(allGroups) once instead.
export function isIndexable(group, allGroups) {
  return indexableSlugs(allGroups).has(group.slug);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/unit/model-subset.test.mjs`
Expected: PASS — 5 tests pass.

- [ ] **Step 5: Add a `test:unit` script**

Modify `package.json` scripts block — add this line after `"test:e2e"`:

```json
    "test:unit": "node --test tests/unit/",
```

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/model-subset.mjs tests/unit/model-subset.test.mjs package.json
git -c core.autocrlf=false commit -m "feat(models): indexable-subset rule + unit tests"
```

---

## Task 2: Wire the subset into build-model-pages + emit slug manifest

**Files:**
- Modify: `scripts/build-model-pages.mjs`

This task only wires the rule + manifest + per-page robots. The Chinese rewrite is Task 3.

- [ ] **Step 1: Import the rule and compute the indexable set**

In `scripts/build-model-pages.mjs`, after the imports (line 8) add:

```javascript
import { indexableSlugs } from './lib/model-subset.mjs';
```

After `groups` is fully built (after line 55, before the `console.log` on line 57) add:

```javascript
const INDEXABLE = indexableSlugs([...groups.values()]);
```

- [ ] **Step 2: Make `pageHtml` robots-aware**

Change the `pageHtml(group, allSlugs)` signature (line 97) to:

```javascript
function pageHtml(group, allSlugs, indexable) {
```

Replace the robots meta line (line 152):

```javascript
<meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}">
```

Update the call site in `main()` (line 246):

```javascript
    writeFileSync(`${dir}/index.html`, pageHtml(g, slugs, INDEXABLE.has(slug)));
```

- [ ] **Step 3: Write the slug manifest**

In `main()`, after the write loop (after line 250 `console.log`), add:

```javascript
  const manifest = [...groups.values()].map((g) => ({
    slug: g.slug,
    name: g.displayName,
    indexable: INDEXABLE.has(g.slug),
  }));
  writeFileSync('data/model-slugs.json', JSON.stringify(manifest) + '\n');
  console.log(`[build-models] manifest: data/model-slugs.json (${manifest.length} slugs, ${manifest.filter((m) => m.indexable).length} indexable)`);
```

- [ ] **Step 4: Run and verify the manifest + robots split**

Run:
```bash
node scripts/build-model-pages.mjs
node -e "const a=JSON.parse(require('fs').readFileSync('data/model-slugs.json','utf8')); const idx=a.filter(m=>m.indexable).length; console.log('total',a.length,'indexable',idx); if(idx<10||idx>80) throw new Error('subset size off: '+idx);"
```
Expected: total ~ matches page count; indexable between 10 and 80. Spot check one indexable page has `index,follow` and one long-tail page has `noindex,follow`:
```bash
node -e "const a=JSON.parse(require('fs').readFileSync('data/model-slugs.json','utf8')); const fs=require('fs'); const yes=a.find(m=>m.indexable).slug, no=a.find(m=>!m.indexable).slug; const g=s=>fs.readFileSync('models/'+s+'/index.html','utf8').match(/robots\" content=\"([^\"]+)/)[1]; console.log(yes, g(yes)); console.log(no, g(no));"
```
Expected: indexable slug → `index,follow`; long-tail slug → `noindex,follow`.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-model-pages.mjs data/model-slugs.json
git -c core.autocrlf=false commit -m "feat(models): emit slug manifest + per-page index/noindex from subset rule"
```

---

## Task 3: Chinese localization + data-driven rich content

**Files:**
- Modify: `scripts/build-model-pages.mjs`
- Create: `data/model-pages.json`

This rewrites `pageHtml` and its helpers to emit Chinese pages with unique, data-driven blocks. The subset gets the full depth; the long tail uses the same template (it is also localized — only its robots differ).

- [ ] **Step 1: Create the (initially empty) override registry**

Create `data/model-pages.json`:

```json
{}
```

- [ ] **Step 2: Add data-driven helper functions**

In `scripts/build-model-pages.mjs`, after `relatedSlugs` (line 95) add these helpers. They compute per-model uniqueness from the full set of groups:

```javascript
const OVERRIDES = JSON.parse(readFileSync('data/model-pages.json', 'utf8'));

const ZH_BRAND = {
  openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google', deepseek: 'DeepSeek',
  xai: 'xAI', qwen: '阿里通义千问', alibaba: '阿里', mistral: 'Mistral',
  meta: 'Meta', llama: 'Meta Llama', moonshot: '月之暗面', zhipu: '智谱',
};
const ZH_CAP = {
  reasoning: '推理', tools: '工具调用', vision: '多模态视觉', audio: '音频', open: '开放权重',
};

function zhBrand(platform) { return ZH_BRAND[platform] || vendorOf(platform); }
function zhCaps(caps) {
  const out = caps.map((c) => ZH_CAP[c]).filter(Boolean);
  return out.length ? out.join('、') : '文本生成';
}

// percentile: fraction (0-100) of groups whose `metric(best)` is LESS than this
// group's. Used for "cheaper than X%" / "longer context than X%".
function percentile(allBests, value, lowerIsBetter) {
  const vals = allBests.filter((v) => v != null);
  if (!vals.length || value == null) return null;
  const below = vals.filter((v) => (lowerIsBetter ? v > value : v < value)).length;
  return Math.round((below / vals.length) * 100);
}

function priceTierZh(pct) {
  if (pct == null) return '中等';
  if (pct >= 66) return '偏便宜';
  if (pct >= 33) return '中等';
  return '偏贵';
}

// Pick up to 4 peers: same brand first, then nearest input price, by quality.
function peerGroups(group, allGroups) {
  const best = bestListing(group.listings);
  const brand = best.platform;
  const others = allGroups.filter((g) => g.slug !== group.slug);
  const sameBrand = others.filter((g) => bestListing(g.listings).platform === brand);
  const pool = sameBrand.length >= 3 ? sameBrand : others;
  return [...pool]
    .sort((a, b) => Math.abs((bestListing(a.listings).price?.input ?? 0) - (best.price?.input ?? 0))
      - Math.abs((bestListing(b.listings).price?.input ?? 0) - (best.price?.input ?? 0)))
    .slice(0, 4);
}

function verdictZh(group, best, meta, pricePct) {
  if (OVERRIDES[group.slug]?.verdictZh) return OVERRIDES[group.slug].verdictZh;
  const tier = priceTierZh(pricePct);
  const sceneByCap = best.capabilities?.includes('reasoning')
    ? '复杂推理、写代码和需要思考链的任务'
    : best.capabilities?.includes('vision')
      ? '图文理解和多模态场景'
      : '日常问答、写作和轻量集成';
  return `${group.displayName} 是 ${zhBrand(best.platform)} 的模型，主打${zhCaps(meta.caps ? [...meta.caps] : [])}。`
    + `它的上下文窗口为 ${meta.ctx}，价格在同类中${tier}`
    + `${pricePct != null ? `（比约 ${pricePct}% 的同类便宜）` : ''}。适合${sceneByCap}。`;
}
```

- [ ] **Step 3: Replace `pageHtml` with the Chinese, data-driven version**

Replace the entire `pageHtml` function (lines 97–230) with:

```javascript
function pageHtml(group, allSlugs, indexable, allGroups) {
  const { slug, displayName, listings } = group;
  const best = bestListing(listings);
  const meta = describe(listings, best);
  const url = `https://checkaimodels.com/models/${slug}/`;

  const allInputs = allGroups.map((g) => bestListing(g.listings).price?.input);
  const allCtx = allGroups.map((g) => bestListing(g.listings).limit?.context);
  const pricePct = percentile(allInputs, best.price?.input, true);   // cheaper than X%
  const ctxPct = percentile(allCtx, best.limit?.context, false);     // longer than X%
  const ratio = best.price?.input > 0 ? (best.price.output / best.price.input).toFixed(1) : '—';

  const title = `${displayName}：价格、上下文、能力对比（2026）`;
  const desc = `${displayName} 中文资料：${meta.ctx} 上下文，最低 ${fmtMoney(best.price?.input)}/1M 输入 token，由 ${zhBrand(best.platform)} 提供。能力：${zhCaps([...meta.caps])}。`;

  const compareKey = `${best.platform}:${best.id}`;
  const compareTool = `/?compare=${encodeURIComponent(compareKey)}`;

  // Provider pricing rows
  const rows = [...listings]
    .sort((a, b) => (a.price?.input ?? Infinity) - (b.price?.input ?? Infinity))
    .map((l) => `<tr><td>${escAttr(zhBrand(l.platform))}</td><td>${fmtMoney(l.price?.input)}</td><td>${fmtMoney(l.price?.output)}</td><td>${fmtCtx(l.limit?.context)}</td><td>${fmtDate(l.release_date)}</td></tr>`).join('\n');

  // Peer comparison table
  const peers = peerGroups(group, allGroups);
  const peerRows = peers.map((g) => {
    const b = bestListing(g.listings);
    return `<tr><td><a href="/models/${g.slug}/">${escAttr(g.displayName)}</a></td><td>${escAttr(zhBrand(b.platform))}</td><td>${fmtMoney(b.price?.input)}</td><td>${fmtMoney(b.price?.output)}</td><td>${fmtCtx(b.limit?.context)}</td></tr>`;
  }).join('\n');

  const verdict = verdictZh(group, best, meta, pricePct);

  const related = relatedSlugs(slug, allSlugs);
  const relatedHtml = related.length
    ? `<ul>${related.map((s) => `<li><a href="/models/${s}/">${s.replace(/-/g, ' ')}</a></li>`).join('')}</ul>`
    : '';

  const faq = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: 'zh-CN',
    mainEntity: [
      { '@type': 'Question', name: `${displayName} 多少钱？`, acceptedAnswer: { '@type': 'Answer', text: `最低 ${fmtMoney(best.price?.input)}/1M 输入 token、${fmtMoney(best.price?.output)}/1M 输出 token（最便宜的供应商）。不同供应商价格不同，见本页价格表。` } },
      { '@type': 'Question', name: `${displayName} 的上下文窗口多大？`, acceptedAnswer: { '@type': 'Answer', text: `${meta.ctx} token。` } },
      { '@type': 'Question', name: `哪些平台提供 ${displayName}？`, acceptedAnswer: { '@type': 'Answer', text: `${meta.provCount} 个平台：${[...new Set(listings.map((l) => zhBrand(l.platform)))].slice(0, 10).join('、')}。` } },
      { '@type': 'Question', name: `${displayName} 能做什么？`, acceptedAnswer: { '@type': 'Answer', text: `能力：${zhCaps([...meta.caps])}。${best.knowledge ? '知识截止：' + best.knowledge + '。' : ''}` } },
    ],
  });

  const article = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'TechArticle', inLanguage: 'zh-CN',
    headline: title, description: desc,
    datePublished: '2026-05-10', dateModified: data.models[0]?.last_updated || '2026-05-10',
    author: { '@type': 'Organization', name: 'Check.AI' },
    publisher: { '@type': 'Organization', name: 'Check.AI', url: 'https://checkaimodels.com/' },
    about: { '@type': 'SoftwareApplication', name: displayName, applicationCategory: 'AI model' },
  });

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}">
<title>${escAttr(title)} | Check.AI</title>
<meta name="description" content="${escAttr(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="zh" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta property="og:title" content="${escAttr(displayName + '（2026）')}">
<meta property="og:description" content="${escAttr(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<link rel="stylesheet" href="/styles.css?v=20260522-1">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">${article}</script>
<script type="application/ld+json">${faq}</script>
</head>
<body class="seo-page">
<header class="seo-header"><a class="brand-link" href="/zh/">Check.AI</a><nav><a href="/">对比工具</a><a href="/zh/about/">关于</a><a href="/zh/contact/">联系</a></nav></header>
<main class="seo-main">
<p class="eyebrow">模型资料 · 数据同步于 ${data.models[0]?.last_updated || '2026 年 5 月'}</p>
<h1>${escAttr(displayName)}</h1>
<p class="seo-lead">${verdict}</p>

<section class="seo-card">
<h2>速览</h2>
<ul>
<li><strong>最低输入价：</strong>${fmtMoney(best.price?.input)}/1M token（${escAttr(zhBrand(best.platform))}）${pricePct != null ? `，比约 ${pricePct}% 的同类便宜` : ''}</li>
<li><strong>最低输出价：</strong>${fmtMoney(best.price?.output)}/1M token</li>
<li><strong>输出/输入比：</strong>${ratio}×（输出贵几倍）</li>
<li><strong>上下文窗口：</strong>${meta.ctx} token${ctxPct != null ? `，比约 ${ctxPct}% 的同类更长` : ''}</li>
<li><strong>发布日期：</strong>${fmtDate(best.release_date)}</li>
${best.knowledge ? `<li><strong>知识截止：</strong>${escAttr(best.knowledge)}</li>` : ''}
<li><strong>能力：</strong>${zhCaps([...meta.caps])}</li>
<li><strong>可用平台数：</strong>${meta.provCount}</li>
</ul>
<p><a class="section-link" href="${compareTool}">→ 把 ${escAttr(displayName)} 加入对比工具</a></p>
</section>

<section class="seo-card">
<h2>各平台价格</h2>
<p>同一个模型，不同平台价格不同。最便宜的排在前面。</p>
<table>
<thead><tr><th>平台</th><th>输入/1M</th><th>输出/1M</th><th>上下文</th><th>上架</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
<p style="font-size:13px;color:var(--muted);margin-top:10px">价格每日同步自 <a href="https://models.dev" rel="noopener">models.dev</a> + 各家官方文档。</p>
</section>

${peerRows ? `<section class="seo-card">
<h2>同类对比</h2>
<p>和价位/厂商相近的模型放一起看。</p>
<table>
<thead><tr><th>模型</th><th>厂商</th><th>输入/1M</th><th>输出/1M</th><th>上下文</th></tr></thead>
<tbody>
${peerRows}
</tbody>
</table>
<p><a class="section-link" href="${compareTool}">→ 在对比工具里并排看完整六维</a></p>
</section>` : ''}

<section class="seo-card">
<h2>该不该选它</h2>
<p>${verdict}</p>
<ul>
<li><strong>先并排对比：</strong>在<a href="${compareTool}">对比工具</a>里和 1-2 个候选放一起，规模化时价格差比跑分更重要。</li>
<li><strong>挑满足延迟/SLA 的最便宜平台：</strong>同样的权重，不同平台价差很大。</li>
<li><strong>每 3 个月重估一次：</strong>前沿价格降得快，今天最便宜的下个季度未必。</li>
</ul>
</section>

${related.length ? `<section class="seo-card">
<h2>相关模型</h2>
${relatedHtml}
</section>` : ''}

<section class="seo-card">
<h2>常见问题</h2>
<p><strong>${escAttr(displayName)} 多少钱？</strong>最低 ${fmtMoney(best.price?.input)} 输入 / ${fmtMoney(best.price?.output)} 输出（每 1M token，最便宜平台）。其他平台见上表。</p>
<p><strong>上下文窗口多大？</strong>${meta.ctx} token。</p>
<p><strong>哪些平台提供？</strong>${[...new Set(listings.map((l) => zhBrand(l.platform)))].slice(0, 10).join('、')}${listings.length > 10 ? ' 等，见上方完整表格。' : '。'}</p>
<p><strong>数据来源？</strong>models.dev + 各家官方文档，每日同步。<a href="/zh/about/">关于数据</a>。</p>
</section>

</main>
<footer class="seo-footer"><a href="/zh/">返回中文首页</a> · <a href="/">打开对比工具</a></footer>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "df6bb0324e4c458fb4e8b979d3feed3c"}'></script>
</body>
</html>
`;
}
```

- [ ] **Step 4: Pass `allGroups` to `pageHtml` at the call site**

In `main()` update the call (currently `pageHtml(g, slugs, INDEXABLE.has(slug))`):

```javascript
    writeFileSync(`${dir}/index.html`, pageHtml(g, slugs, INDEXABLE.has(slug), [...groups.values()]));
```

(Hoist `const allGroups = [...groups.values()];` above the loop and pass `allGroups` to avoid rebuilding it each iteration.)

- [ ] **Step 5: Build and verify a page is Chinese, rich, and nav-correct**

Run:
```bash
node scripts/build-model-pages.mjs
node -e "const fs=require('fs');const a=JSON.parse(fs.readFileSync('data/model-slugs.json','utf8'));const s=a.find(m=>m.indexable).slug;const h=fs.readFileSync('models/'+s+'/index.html','utf8');console.log('slug',s);console.log('lang zh-CN?', h.includes('lang=\"zh-CN\"'));console.log('zh nav?', h.includes('/zh/about/'));console.log('peer table?', h.includes('同类对比'));console.log('robots', h.match(/robots\" content=\"([^\"]+)/)[1]);"
```
Expected: `lang zh-CN? true`, `zh nav? true`, `peer table? true`, `robots index,follow`.

- [ ] **Step 6: Nav audit (model pages now carry zh chrome → in scope)**

Run: `node scripts/audit-nav.mjs --static`
Expected: `0 problem(s)`. If a model page trips a rule, fix the nav/footer markup in `pageHtml` to match the canonical zh chrome (brand → `/zh/`, nav 对比工具·关于·联系).

- [ ] **Step 7: Commit**

```bash
git add scripts/build-model-pages.mjs data/model-pages.json models/
git -c core.autocrlf=false commit -m "feat(models): localize pages to zh + data-driven blocks, peer table, verdict"
```

---

## Task 4: Sitemap includes the indexable subset

**Files:**
- Modify: `scripts/build-sitemap.mjs`

Currently `WALK_DIRS` excludes `models/` entirely (line 21) and the comment explains why. We now include ONLY the indexable subset, read from the manifest.

- [ ] **Step 1: Read the manifest and append indexable model URLs**

In `scripts/build-sitemap.mjs`, inside `main()` after the existing `for (const d of WALK_DIRS) { walk(...) }` loop and before `const urls = [...]`, add:

```javascript
  // Include ONLY the indexable model subset (data/model-slugs.json), never the
  // noindex long tail. Keeps crawl budget on high-value pages.
  let modelUrls = [];
  try {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'data', 'model-slugs.json'), 'utf8'));
    modelUrls = manifest.filter((m) => m.indexable).map((m) => `${ORIGIN}/models/${m.slug}/`);
  } catch { /* manifest absent on first run — skip */ }
```

Add `readFileSync` to the imports at the top (line 7):

```javascript
import { readdirSync, writeFileSync, statSync, appendFileSync, readFileSync } from 'node:fs';
```

Change the `urls` construction (line 73) to fold in `modelUrls`:

```javascript
  const urls = [...new Set([...files.map(urlFromPath), ...modelUrls])].sort();
```

- [ ] **Step 2: Build and verify the subset is in the sitemap, long tail is not**

Run:
```bash
node scripts/build-model-pages.mjs && node scripts/build-sitemap.mjs
node -e "const fs=require('fs');const sm=fs.readFileSync('sitemap.xml','utf8');const a=JSON.parse(fs.readFileSync('data/model-slugs.json','utf8'));const yes=a.find(m=>m.indexable).slug,no=a.find(m=>!m.indexable).slug;console.log('indexable in sitemap?', sm.includes('/models/'+yes+'/'));console.log('long-tail in sitemap?', sm.includes('/models/'+no+'/'));"
```
Expected: `indexable in sitemap? true`, `long-tail in sitemap? false`.

- [ ] **Step 3: Commit**

```bash
git add scripts/build-sitemap.mjs sitemap.xml
git -c core.autocrlf=false commit -m "feat(seo): add indexable model subset to sitemap"
```

---

## Task 5: SPA unified search — 模型 group + 查看完整页 link

**Files:**
- Modify: `app.js`
- Test: `tests/e2e/model-search.spec.mjs`

- [ ] **Step 1: Write the failing e2e test**

Create `tests/e2e/model-search.spec.mjs`:

```javascript
import { test, expect } from '@playwright/test';
import { ready } from './helpers.mjs';

test.describe('model search', () => {
  test('typing a model name shows a 模型 results group', async ({ page }) => {
    await ready(page);
    await page.fill('#platformSearch', 'gpt-5.5');
    await expect(page.locator('#modelResults .model-result').first()).toBeVisible();
  });

  test('clicking a model result opens the detail modal with a 查看完整页 link', async ({ page }) => {
    await ready(page);
    await page.fill('#platformSearch', 'gpt-5.5');
    await page.locator('#modelResults .model-result').first().click();
    await expect(page.locator('#modelDetailModal')).toHaveClass(/open/);
    const link = page.locator('#modelDetailContent a.detail-fullpage');
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^\/models\/[a-z0-9-]+\/$/);
    const resp = await page.request.get(href);
    expect(resp.status()).toBe(200);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test model-search.spec.mjs`
Expected: FAIL — `#modelResults` does not exist yet.

- [ ] **Step 3: Add `canonSlug` + manifest load to `app.js`**

Near the top of `app.js`, after the state declarations (after line 117 `let lang = ...`), add:

```javascript
let modelSlugSet = new Set();
function canonSlug(name) {
  return String(name).toLowerCase().trim()
    .replace(/[\s\-_./]+/g, '-')
    .replace(/-(latest|preview|chat|instruct|001|002|003|exp|experimental)$/i, '')
    .replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
async function loadModelSlugs() {
  try {
    const r = await fetch('/data/model-slugs.json', { cache: 'no-cache' });
    if (r.ok) modelSlugSet = new Set((await r.json()).map((m) => m.slug));
  } catch (_) { /* manifest optional */ }
}
```

- [ ] **Step 4: Call `loadModelSlugs()` during init**

`loadLive()` (line 501) is the data bootstrap. Add a call to `loadModelSlugs()` — find where `loadLive()` is invoked at the bottom of the file (search `loadLive(`) and add `loadModelSlugs();` right after it (fire-and-forget; the link guard tolerates an empty set until it resolves).

- [ ] **Step 5: Add `filteredModels()` and render the 模型 group**

After `filteredPlatforms()` (line 522) add:

```javascript
function filteredModels() {
  const norm = (s) => s.toLowerCase().replace(/[\s\-_]+/g, '');
  const q = norm($('platformSearch').value);
  if (!q) return [];
  return models
    .filter((m) => norm(`${m.name} ${m.id} ${m.platform} ${m.capabilities.map(capText).join(' ')}`).includes(q))
    .sort((a, b) => score(b).average - score(a).average)
    .slice(0, 12);
}
```

In `renderList()` (line 523), after the line that sets `$('platformList').innerHTML = list.map(...)` (line 532) and before the `.platform-card` click binding (line 533), insert the model group render:

```javascript
  const mResults = filteredModels();
  const mr = $('modelResults');
  if (mr) {
    mr.innerHTML = mResults.length
      ? `<p class="results-group-label">${tx('models')}</p>` + mResults.map((m) =>
          `<button class="model-result" data-key="${keyOf(m)}"><strong>${m.name}</strong><span>${pName(m.platform)} · ${money(m.input)} · ${m.capabilities.map(capText).join(' ')}</span></button>`).join('')
      : '';
    mr.querySelectorAll('.model-result').forEach((b) => b.onclick = () => openModel(b.dataset.key));
  }
```

- [ ] **Step 6: Add the `#modelResults` container to `index.html`**

In `index.html`, the platform list is `<div id="platformList" class="platform-list"></div>`. Add a sibling right after it:

```html
<div id="modelResults" class="model-results"></div>
```

(Find `id="platformList"` and insert `<div id="modelResults" class="model-results"></div>` immediately after that element's closing `</div>`.)

- [ ] **Step 7: Add the 查看完整页 link in `openModel`**

In `openModel()` (line 599), inside the `.detail-actions` block (lines 648–651), add the full-page link as the first action. Replace the `.detail-actions` div with:

```javascript
    <div class='detail-actions'>
      ${modelSlugSet.has(canonSlug(m.name)) ? `<a class='detail-cta detail-fullpage' href='/models/${canonSlug(m.name)}/'>${tx('viewFullPage')} →</a>` : ''}
      ${p.website ? `<a class='detail-cta' href='${p.website}' target='_blank' rel='noopener nofollow'>${tx('officialDocs')} ↗</a>` : ''}
      <button class='detail-cta detail-cta-compare' type='button' id='detailCompareBtn'>${tx('compareThisModel')} →</button>
    </div>
```

- [ ] **Step 8: Add the `viewFullPage` i18n string**

Each language object in `app.js` (lines ~3–44) needs a `viewFullPage` key. Add to each:
- zh (line ~9 block): `viewFullPage: '查看完整页',`
- en: `viewFullPage: 'Full page',`
- ja: `viewFullPage: '詳細ページ',`
- ko: `viewFullPage: '전체 페이지',`
- es: `viewFullPage: 'Página completa',`

(Add the key alongside the existing `officialDocs` key in each language object.)

- [ ] **Step 9: Add minimal CSS for the model results group**

In `styles.css`, after the `.model-chip` rules (around line 225) add:

```css
.model-results{display:flex;flex-direction:column;gap:6px;margin-top:10px}
.results-group-label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:6px 0 2px;font-weight:500}
.model-result{text-align:left;border:1px solid var(--line);background:var(--paper);border-radius:10px;padding:8px 12px;cursor:pointer;display:flex;flex-direction:column;gap:2px;font-family:var(--sans)}
.model-result:hover{border-color:var(--ink)}
.model-result strong{font-size:14px}
.model-result span{font-size:12px;color:var(--muted)}
.detail-fullpage{background:var(--accent-2);border-color:var(--accent-2)}
```

- [ ] **Step 10: Run the e2e test to verify it passes**

Run: `npx playwright test model-search.spec.mjs`
Expected: PASS — both tests green. (The static server serves `/data/model-slugs.json` and `/models/<slug>/` so the link + 200 check work.)

- [ ] **Step 11: Bump the cache-bust + commit**

In `index.html` bump `app.js?v=20260522-1` → `app.js?v=20260522-2` and `styles.css?v=20260522-1` → `styles.css?v=20260522-2` (both app.js and styles.css changed).

```bash
git add app.js index.html styles.css tests/e2e/model-search.spec.mjs
git -c core.autocrlf=false commit -m "feat(search): unified model search group + 查看完整页 link to model pages"
```

---

## Task 6: De-orphan — link model rows on the main page to their pages

**Files:**
- Modify: `app.js`

The main-page Models tab renders rows via `row(m)` / `bindRows`. Add a small 「页」link per row so model pages get an internal link from the platform view too (helps the indexable subset).

- [ ] **Step 1: Find the `row(m)` renderer**

Run: `grep -n "function row(" app.js` to locate it. The model name cell is the first `<td>`.

- [ ] **Step 2: Add a full-page link to the model-name cell (only when the page exists)**

In `row(m)`, in the cell that prints `m.name`, append (after the name text, inside the same cell):

```javascript
${modelSlugSet.has(canonSlug(m.name)) ? ` <a class="row-page-link" href="/models/${canonSlug(m.name)}/" onclick="event.stopPropagation()" title="${tx('viewFullPage')}">↗</a>` : ''}
```

(The `event.stopPropagation()` prevents the row's `openModel` click from also firing when the link is clicked.)

- [ ] **Step 3: Add CSS for the row link**

In `styles.css` near the model-results rules add:

```css
.row-page-link{color:var(--muted);text-decoration:none;font-size:12px}
.row-page-link:hover{color:var(--accent)}
```

- [ ] **Step 4: Verify in a browser via the e2e server**

Run: `npm run test:e2e` (the existing model-detail spec exercises the models tab; confirm nothing breaks). Expected: all specs pass.

- [ ] **Step 5: Commit**

```bash
git add app.js styles.css
git -c core.autocrlf=false commit -m "feat(models): link model rows to their pages (de-orphan)"
```

---

## Task 7: Full validation + regenerate

**Files:** none created — validates Tasks 1–6.

- [ ] **Step 1: Regenerate everything from the current data**

```bash
node scripts/build-model-pages.mjs && node scripts/build-sitemap.mjs
```

- [ ] **Step 2: Unit + e2e + nav audit all green**

```bash
node --test tests/unit/
node scripts/audit-nav.mjs --static
npm run test:e2e
```
Expected: unit tests pass; `audit: 0 problem(s)`; all e2e specs pass.

- [ ] **Step 3: Idempotency — re-running the build produces no diff**

```bash
node scripts/build-model-pages.mjs && node scripts/build-sitemap.mjs
git status --short models/ data/model-slugs.json sitemap.xml
```
Expected: empty (the build is deterministic).

- [ ] **Step 4: Commit any regenerated artifacts**

```bash
git add models/ data/model-slugs.json sitemap.xml
git -c core.autocrlf=false commit -m "chore(models): regenerate pages + sitemap" || echo "nothing to commit"
```

- [ ] **Step 5: Open the PR**

```bash
git push -u origin model-search-and-pages
gh pr create --title "Model search + revive model pages (zh, data-driven, curated-subset indexing)" --body "Implements docs/2026-05-22-model-search-and-pages-design.md. Unified model search → detail modal + 查看完整页 link; model pages localized to zh with data-driven blocks + peer tables; curated ~subset set to index + added to sitemap, long tail stays noindex. Unit + e2e + nav audit green."
```

---

## Self-review notes (addressed)

- **Spec coverage:** display-C (Task 5 modal link), indexing-subset (Tasks 1,2,4), unified grouped search (Task 5), zh + data-driven + peer + verdict (Task 3), de-orphan (Tasks 5,6), testing (Tasks 1,5,7). All spec sections map to a task.
- **Type/name consistency:** `indexableSlugs`/`isIndexable`, `canonSlug` (identical in build-model-pages and app.js), `modelSlugSet`, `#modelResults`/`.model-result`, `detail-fullpage`, `viewFullPage` i18n key are used consistently across tasks.
- **Cache-bust:** model pages reference `styles.css?v=20260522-1` (Task 3) and the SPA bumps to `-2` (Task 5); both are intentional and independent (model pages are separate documents).
