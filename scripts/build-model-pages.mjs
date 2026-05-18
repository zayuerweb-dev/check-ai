#!/usr/bin/env node
// Generate /models/{canonical-slug}/index.html for every unique model in
// data/models.json. Dedupes models across providers (same canonical name
// becomes one page with a provider-pricing comparison table).
// Run: node scripts/build-model-pages.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';

const data = JSON.parse(readFileSync('data/models.json', 'utf8'));
const providersIndex = Object.fromEntries((data.providers || []).map((p) => [p.key, p]));

function canonSlug(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[\s\-_./]+/g, '-')
    .replace(/-(latest|preview|chat|instruct|001|002|003|exp|experimental)$/i, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function fmtMoney(n) {
  if (n == null) return '—';
  if (n === 0) return '$0';
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}`;
  return `$${n.toFixed(2).replace(/\.?0+$/, '')}`;
}
function fmtCtx(n) {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}
function fmtDate(s) { return s || '—'; }
function escAttr(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const MIN_CONTEXT = 4000;

const groups = new Map();
for (const m of data.models || []) {
  if (!m.name) continue;
  const ctx = m.limit?.context || 0;
  if (ctx < MIN_CONTEXT) continue;
  const price = m.price?.input;
  if (price == null) continue;
  const slug = canonSlug(m.name);
  if (!slug) continue;
  if (!groups.has(slug)) groups.set(slug, { slug, displayName: m.name, listings: [] });
  groups.get(slug).listings.push(m);
}

console.log(`[build-models] ${groups.size} unique canonical models from ${data.models.length} raw`);

function bestListing(listings) {
  // canonical "best representative": the listing with lowest input price among non-null
  return [...listings].sort((a, b) => (a.price?.input ?? Infinity) - (b.price?.input ?? Infinity))[0];
}

function summarizeCapabilities(listings) {
  const caps = new Set();
  for (const l of listings) for (const c of l.capabilities || []) caps.add(c);
  return [...caps];
}

function describe(listings, best) {
  const caps = summarizeCapabilities(listings);
  const tags = [];
  if (caps.includes('reasoning')) tags.push('reasoning');
  if (caps.includes('tools')) tags.push('tool calling');
  if (caps.includes('vision')) tags.push('multimodal vision');
  if (caps.includes('audio')) tags.push('audio');
  if (caps.includes('open')) tags.push('open weights');
  const tagStr = tags.length ? tags.join(', ') : 'text generation';
  const ctx = fmtCtx(best.limit?.context);
  const provs = new Set(listings.map((l) => l.platform));
  return { caps, tags, tagStr, ctx, provCount: provs.size };
}

function vendorOf(platformKey) {
  const p = providersIndex[platformKey];
  return p?.name || platformKey;
}

function relatedSlugs(thisSlug, allSlugs) {
  // Pick up to 5 related canonical slugs that share a prefix word.
  const prefix = thisSlug.split('-')[0];
  return [...allSlugs]
    .filter((s) => s !== thisSlug && s.startsWith(prefix))
    .slice(0, 5);
}

function pageHtml(group, allSlugs) {
  const { slug, displayName, listings } = group;
  const best = bestListing(listings);
  const meta = describe(listings, best);
  const url = `https://checkaimodels.com/models/${slug}/`;
  const title = `${displayName}: Price, Context, Providers (2026)`;
  const desc = `${displayName} API reference: ${meta.ctx} context, from ${fmtMoney(best.price?.input)} / 1M input tokens. Available on ${meta.provCount} provider${meta.provCount === 1 ? '' : 's'}. Capabilities: ${meta.tagStr}.`;

  // Provider rows sorted by input price asc
  const rows = [...listings]
    .sort((a, b) => (a.price?.input ?? Infinity) - (b.price?.input ?? Infinity))
    .map((l) => `<tr>
<td>${escAttr(vendorOf(l.platform))}</td>
<td>${fmtMoney(l.price?.input)}</td>
<td>${fmtMoney(l.price?.output)}</td>
<td>${fmtCtx(l.limit?.context)}</td>
<td>${fmtDate(l.release_date)}</td>
</tr>`).join('\n');

  const compareKey = `${best.platform}:${best.id}`;
  const compareTool = `/?compare=${encodeURIComponent(compareKey)}`;

  const related = relatedSlugs(slug, allSlugs);
  const relatedHtml = related.length
    ? `<ul>${related.map((s) => `<li><a href="/models/${s}/">${s.replace(/-/g, ' ')}</a></li>`).join('')}</ul>`
    : '';

  const faq = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `How much does ${displayName} cost?`, acceptedAnswer: { '@type': 'Answer', text: `${fmtMoney(best.price?.input)} per 1M input tokens and ${fmtMoney(best.price?.output)} per 1M output tokens at the cheapest provider listing. Other providers may price it differently — see the comparison table on this page.` } },
      { '@type': 'Question', name: `What is the context window of ${displayName}?`, acceptedAnswer: { '@type': 'Answer', text: `${meta.ctx} tokens.` } },
      { '@type': 'Question', name: `Which providers offer ${displayName}?`, acceptedAnswer: { '@type': 'Answer', text: `${meta.provCount} provider${meta.provCount === 1 ? '' : 's'} list this model: ${[...new Set(listings.map((l) => vendorOf(l.platform)))].slice(0, 10).join(', ')}.` } },
      { '@type': 'Question', name: `What can ${displayName} do?`, acceptedAnswer: { '@type': 'Answer', text: `Capabilities: ${meta.tagStr}.${best.knowledge ? ' Knowledge cutoff: ' + best.knowledge + '.' : ''}` } },
    ],
  });

  const article = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description: desc,
    datePublished: '2026-05-10',
    dateModified: '2026-05-10',
    author: { '@type': 'Organization', name: 'Check.AI' },
    publisher: { '@type': 'Organization', name: 'Check.AI', url: 'https://checkaimodels.com/' },
    about: { '@type': 'SoftwareApplication', name: displayName, applicationCategory: 'AI model' },
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="robots" content="noindex,follow">
<title>${escAttr(title)} | Check.AI</title>
<meta name="description" content="${escAttr(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta property="og:title" content="${escAttr(displayName + ' (2026)')}">
<meta property="og:description" content="${escAttr(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<link rel="stylesheet" href="/styles.css?v=20260510-4">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">${article}</script>
<script type="application/ld+json">${faq}</script>
</head>
<body class="seo-page">
<header class="seo-header"><a class="brand-link" href="/">Check.AI</a><nav><a href="/">Compare tool</a><a href="/zh/">中文</a><a href="/topics/best-ai-models-for-coding/">Topics</a><a href="/about.html">About</a></nav></header>
<main class="seo-main">
<p class="eyebrow">Model reference · Synced ${data.models[0]?.last_updated || 'May 2026'}</p>
<h1>${escAttr(displayName)}</h1>
<p class="seo-lead"><strong>${escAttr(displayName)}</strong> is an AI model from <strong>${escAttr(vendorOf(best.platform))}</strong>. ${meta.ctx} context window. Capabilities: ${meta.tagStr}. Available on <strong>${meta.provCount} provider${meta.provCount === 1 ? '' : 's'}</strong>. Cheapest listing: ${fmtMoney(best.price?.input)} input / ${fmtMoney(best.price?.output)} output per 1M tokens.</p>

<section class="seo-card">
<h2>Quick facts</h2>
<ul>
<li><strong>Cheapest input:</strong> ${fmtMoney(best.price?.input)} per 1M tokens (${escAttr(vendorOf(best.platform))})</li>
<li><strong>Cheapest output:</strong> ${fmtMoney(best.price?.output)} per 1M tokens</li>
<li><strong>Context window:</strong> ${meta.ctx} tokens</li>
<li><strong>Max output:</strong> ${fmtCtx(best.limit?.output)} tokens</li>
<li><strong>Release date:</strong> ${fmtDate(best.release_date)}</li>
${best.knowledge ? `<li><strong>Knowledge cutoff:</strong> ${escAttr(best.knowledge)}</li>` : ''}
<li><strong>Capabilities:</strong> ${meta.tagStr}</li>
<li><strong>Provider count:</strong> ${meta.provCount}</li>
</ul>
<p><a class="section-link" href="${compareTool}">→ Add ${escAttr(displayName)} to the comparison tool</a></p>
</section>

<section class="seo-card">
<h2>Provider pricing</h2>
<p>Same model, different providers, different prices. Cheapest first.</p>
<table>
<thead><tr><th>Provider</th><th>Input / 1M</th><th>Output / 1M</th><th>Context</th><th>Listed</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
<p style="font-size:13px;color:var(--muted);margin-top:10px">Prices synced daily from <a href="https://models.dev" rel="noopener">models.dev</a> + provider docs.</p>
</section>

<section class="seo-card">
<h2>How to use this model</h2>
<p>If you're picking ${escAttr(displayName)} for a project, the three things that matter most:</p>
<ul>
<li><strong>Compare it side-by-side</strong> with one or two alternatives in the <a href="${compareTool}">live comparison tool</a>. Pricing differences matter more than benchmarks at scale.</li>
<li><strong>Pick the cheapest provider that meets your latency / SLA need.</strong> Big spread across providers for the same weights.</li>
<li><strong>Re-evaluate every 3 months.</strong> Frontier prices drop fast; a model that's cheapest today may not be in a quarter.</li>
</ul>
</section>

${related.length ? `<section class="seo-card">
<h2>Related models</h2>
${relatedHtml}
</section>` : ''}

<section class="seo-card">
<h2>FAQ</h2>
<p><strong>How much does ${escAttr(displayName)} cost?</strong> ${fmtMoney(best.price?.input)} input / ${fmtMoney(best.price?.output)} output per 1M tokens at the cheapest listing. See the table above for other providers.</p>
<p><strong>What is the context window?</strong> ${meta.ctx} tokens.</p>
<p><strong>Which providers offer it?</strong> ${[...new Set(listings.map((l) => vendorOf(l.platform)))].slice(0, 10).join(', ')}${listings.length > 10 ? ', and others — see the full table above.' : '.'}</p>
<p><strong>Where do these numbers come from?</strong> models.dev + provider documentation, synced daily. <a href="/about.html">About the data</a>.</p>
</section>

</main>
<footer class="seo-footer"><a href="/">Open the interactive comparison tool</a> · <a href="/zh/">中文</a></footer>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "df6bb0324e4c458fb4e8b979d3feed3c"}'></script>
</body>
</html>
`;
}

function ensureDir(p) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }

function main() {
  const slugs = [...groups.keys()];

  // Clear out the existing hand-curated stubs - we have richer data now.
  if (existsSync('models')) rmSync('models', { recursive: true, force: true });

  const urls = [];
  let written = 0;
  for (const slug of slugs) {
    const dir = `models/${slug}`;
    ensureDir(dir);
    const g = groups.get(slug);
    writeFileSync(`${dir}/index.html`, pageHtml(g, slugs));
    urls.push(`https://checkaimodels.com/models/${slug}/`);
    written++;
  }
  console.log(`[build-models] wrote ${written} pages`);

  // Write sitemap fragment for piping into sitemap.xml later
  const sitemapFrag = urls
    .map((u) => `  <url><loc>${u}</loc><lastmod>2026-05-10</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`)
    .join('\n');
  writeFileSync('/tmp/models-sitemap-fragment.xml', sitemapFrag + '\n');
  console.log(`[build-models] sitemap fragment: /tmp/models-sitemap-fragment.xml (${urls.length} URLs)`);
}

main();
