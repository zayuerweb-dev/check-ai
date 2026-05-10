#!/usr/bin/env node
// Generate /compare/{a}-vs-{b}/ static pages for every pair of tracked models.
// Run: node scripts/build-compare-pages.mjs

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const MODELS = [
  {
    slug: 'gpt-5-5', platform: 'openai', id: 'gpt-5.5', name: 'GPT-5.5', vendor: 'OpenAI',
    input: 5, output: 30, context: 1_100_000, release: '2026-04-23',
    capabilities: ['reasoning', 'code', 'vision'],
    swebench: 65, humaneval: 96, lmarena: 1442,
    open: false,
    strengths: 'Frontier reasoning, broad ecosystem, strong tool use, multimodal in/out.',
    weaknesses: 'Premium pricing, occasional over-editing in agent loops.',
    bestFor: 'Hard reasoning, ambiguous specs, system design, agent planners.',
  },
  {
    slug: 'gpt-5-5-pro', platform: 'openai', id: 'gpt-5.5-pro', name: 'GPT-5.5 Pro', vendor: 'OpenAI',
    input: 30, output: 180, context: 1_100_000, release: '2026-04-23',
    capabilities: ['reasoning', 'code', 'vision'],
    swebench: 70, humaneval: 97, lmarena: 1465,
    open: false,
    strengths: 'Top-tier reasoning, asks better clarifying questions, deepest analysis.',
    weaknesses: '6× the price of GPT-5.5 standard, slow.',
    bestFor: 'High-stakes one-off problems, system design, math research.',
  },
  {
    slug: 'claude-sonnet-4-6', platform: 'anthropic', id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', vendor: 'Anthropic',
    input: 3, output: 15, context: 1_000_000, release: '2026-03-12',
    capabilities: ['reasoning', 'code', 'vision'],
    swebench: 70, humaneval: 94, lmarena: 1438,
    open: false,
    strengths: 'Best agentic coding, restrained edits, strong tool calling, default in Cursor / Cline / Aider.',
    weaknesses: 'Pricier than DeepSeek; slower than Haiku tier.',
    bestFor: 'Agentic coding, multi-file refactors, structured output, Cursor power-users.',
  },
  {
    slug: 'gemini-2-5-pro', platform: 'google', id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', vendor: 'Google',
    input: 1.25, output: 10, context: 2_000_000, release: '2025-06-17',
    capabilities: ['reasoning', 'code', 'vision'],
    swebench: 60, humaneval: 92, lmarena: 1420,
    open: false,
    strengths: 'Largest context window (2M), strong multimodal, generous AI Studio free tier.',
    weaknesses: 'Recall drops past 500K, weaker on agentic edits than Claude / GPT.',
    bestFor: 'Whole-repo Q&A, long PDFs, multimodal, free prototyping.',
  },
  {
    slug: 'grok-4', platform: 'xai', id: 'grok-4', name: 'Grok 4', vendor: 'xAI',
    input: 3, output: 15, context: 256_000, release: '2025-07-09',
    capabilities: ['reasoning', 'web'],
    swebench: 55, humaneval: 90, lmarena: 1400,
    open: false,
    strengths: 'Real-time X/Twitter access, strong math, edgy persona.',
    weaknesses: 'Thin IDE/tool ecosystem, weaker code than Claude/GPT-5.',
    bestFor: 'Breaking news, social analysis, math, X-integrated workflows.',
  },
  {
    slug: 'deepseek-r1', platform: 'deepseek', id: 'deepseek-r1', name: 'DeepSeek R1', vendor: 'DeepSeek',
    input: 0.55, output: 2.19, context: 128_000, release: '2025-01-20',
    capabilities: ['reasoning', 'code', 'cheap'],
    swebench: 52, humaneval: 93, lmarena: 1418,
    open: true,
    strengths: 'Best price-to-quality, open weights, strong math + code, self-hostable.',
    weaknesses: 'Weaker tool calling, smaller context, China-hosted official API.',
    bestFor: 'Cost-sensitive production, batch jobs, self-hosted privacy use.',
  },
  {
    slug: 'qwen3-max', platform: 'alibaba', id: 'qwen3-max', name: 'Qwen3 Max', vendor: 'Alibaba',
    input: 1, output: 4, context: 1_000_000, release: '2025-09-05',
    capabilities: ['reasoning', 'code', 'vision'],
    swebench: 50, humaneval: 91, lmarena: 1410,
    open: true,
    strengths: 'Best Chinese-language quality, multilingual, 1M context, fast in Asia.',
    weaknesses: 'Smaller English ecosystem, fewer integrations.',
    bestFor: 'Chinese / multilingual products, Asia-region deployments, multilingual RAG.',
  },
  {
    slug: 'mistral-large', platform: 'mistral', id: 'mistral-large', name: 'Mistral Large', vendor: 'Mistral',
    input: 2, output: 6, context: 128_000, release: '2025-02-01',
    capabilities: ['code'],
    swebench: 45, humaneval: 88, lmarena: 1380,
    open: true,
    strengths: 'EU-hosted, Apache-licensed open variants, solid tool use, predictable.',
    weaknesses: 'Behind frontier on reasoning benchmarks.',
    bestFor: 'EU compliance, on-prem deployments, mid-range workloads.',
  },
];

const fmtMoney = (n) => `$${n.toFixed(2)}`;
const fmtCtx = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M` : `${Math.round(n / 1000)}K`;
const slugPair = (a, b) => [a.slug, b.slug].sort().join('-vs-');

function pickWinner(a, b, key, lowerWins = false) {
  if (a[key] === b[key]) return null;
  if (lowerWins) return a[key] < b[key] ? a : b;
  return a[key] > b[key] ? a : b;
}

function tldr(a, b) {
  const items = [];
  const cheaper = pickWinner(a, b, 'input', true);
  if (cheaper) items.push(`<li><strong>Cheaper:</strong> ${cheaper.name} (input ${fmtMoney(cheaper.input)} vs ${fmtMoney(cheaper === a ? b.input : a.input)} per 1M tokens).</li>`);
  const longer = pickWinner(a, b, 'context');
  if (longer) items.push(`<li><strong>Longer context:</strong> ${longer.name} at ${fmtCtx(longer.context)} vs ${fmtCtx(longer === a ? b.context : a.context)}.</li>`);
  const swe = pickWinner(a, b, 'swebench');
  if (swe) items.push(`<li><strong>Stronger on SWE-bench Verified:</strong> ${swe.name} (~${swe.swebench}% vs ~${(swe === a ? b.swebench : a.swebench)}%).</li>`);
  const arena = pickWinner(a, b, 'lmarena');
  if (arena) items.push(`<li><strong>Higher LMArena:</strong> ${arena.name} (${arena.lmarena} vs ${arena === a ? b.lmarena : a.lmarena}).</li>`);
  if (a.open !== b.open) items.push(`<li><strong>Open weights:</strong> ${a.open ? a.name : b.name} can be self-hosted.</li>`);
  return items.join('\n');
}

function specRow(label, va, vb) {
  return `<tr><td style="padding:8px">${label}</td><td style="padding:8px">${va}</td><td style="padding:8px">${vb}</td></tr>`;
}

function specTable(a, b) {
  return `<table style="width:100%;border-collapse:collapse;margin-top:8px">
<thead><tr style="border-bottom:1px solid var(--line)"><th style="text-align:left;padding:8px">Spec</th><th style="text-align:left;padding:8px">${a.name}</th><th style="text-align:left;padding:8px">${b.name}</th></tr></thead>
<tbody>
${specRow('Vendor', a.vendor, b.vendor)}
${specRow('Input price (per 1M tokens)', fmtMoney(a.input), fmtMoney(b.input))}
${specRow('Output price', fmtMoney(a.output), fmtMoney(b.output))}
${specRow('Context window', fmtCtx(a.context), fmtCtx(b.context))}
${specRow('Release date', a.release, b.release)}
${specRow('SWE-bench Verified', `~${a.swebench}%`, `~${b.swebench}%`)}
${specRow('HumanEval', `~${a.humaneval}%`, `~${b.humaneval}%`)}
${specRow('LMArena (approx)', a.lmarena, b.lmarena)}
${specRow('Open weights', a.open ? 'Yes' : 'No', b.open ? 'Yes' : 'No')}
${specRow('Capabilities', a.capabilities.join(', '), b.capabilities.join(', '))}
</tbody>
</table>`;
}

function faqJson(a, b) {
  const cheaper = pickWinner(a, b, 'input', true);
  const longer = pickWinner(a, b, 'context');
  const swe = pickWinner(a, b, 'swebench');
  const cheaperLine = cheaper
    ? `${cheaper.name} is cheaper at ${fmtMoney(cheaper.input)} input / ${fmtMoney(cheaper.output)} output per 1M tokens, vs ${fmtMoney(cheaper === a ? b.input : a.input)} / ${fmtMoney(cheaper === a ? b.output : a.output)}.`
    : `Both list at the same input price.`;
  const longerLine = longer
    ? `${longer.name} supports ${fmtCtx(longer.context)} context vs ${fmtCtx(longer === a ? b.context : a.context)}.`
    : `Both support the same context window.`;
  const sweLine = swe
    ? `${swe.name} scores higher on SWE-bench Verified (~${swe.swebench}% vs ~${swe === a ? b.swebench : a.swebench}%).`
    : 'Both score similarly on SWE-bench Verified.';
  const cases = [
    { q: `Which is cheaper, ${a.name} or ${b.name}?`, a: cheaperLine },
    { q: `Which has longer context?`, a: longerLine },
    { q: `Which is better for coding agents?`, a: sweLine + ' Tool-use stability also favors the higher SWE-bench scorer in most cases.' },
    { q: `When should I pick ${a.name}?`, a: `${a.bestFor} Strengths: ${a.strengths}` },
    { q: `When should I pick ${b.name}?`, a: `${b.bestFor} Strengths: ${b.strengths}` },
  ];
  const entities = cases.map((c) => ({
    '@type': 'Question',
    name: c.q,
    acceptedAnswer: { '@type': 'Answer', text: c.a },
  }));
  return JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities });
}

function articleJson(a, b, title) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: `Side-by-side comparison of ${a.name} and ${b.name}: pricing, context window, benchmarks, and recommendations.`,
    datePublished: '2026-05-10',
    dateModified: '2026-05-10',
    author: { '@type': 'Organization', name: 'Check.AI' },
    publisher: { '@type': 'Organization', name: 'Check.AI', url: 'https://checkaimodels.com/' },
  });
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function pageHtml(a, b) {
  const title = `${a.name} vs ${b.name}: Price, Context, Benchmarks (2026)`;
  const desc = `Side-by-side: ${a.name} vs ${b.name}. Compare API pricing, context window, SWE-bench / HumanEval / LMArena scores, and which model wins on which task.`;
  const slug = slugPair(a, b);
  const url = `https://checkaimodels.com/compare/${slug}/`;
  const compareUrl = `/?compare=${a.platform}:${a.id},${b.platform}:${b.id}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title} | Check.AI</title>
<meta name="description" content="${escAttr(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta property="og:title" content="${escAttr(title)}">
<meta property="og:description" content="${escAttr(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<link rel="stylesheet" href="/styles.css?v=20260510-2">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">${articleJson(a, b, title)}</script>
<script type="application/ld+json">${faqJson(a, b)}</script>
</head>
<body class="seo-page">
<header class="seo-header"><a class="brand-link" href="/">Check.AI</a><nav><a href="/">Compare tool</a><a href="/zh/">中文</a><a href="/about.html">About</a></nav></header>
<main class="seo-main">
<p class="eyebrow">Model comparison · Updated May 2026</p>
<h1>${title}</h1>
<p class="seo-lead">A direct, dated comparison of <strong>${a.name}</strong> (${a.vendor}) and <strong>${b.name}</strong> (${b.vendor}). Every number below is sourced from the official provider docs and public benchmarks. If you need to make this decision today, the verdict is at the top.</p>

<section class="seo-card">
<h2>30-second verdict</h2>
<ul>
${tldr(a, b)}
</ul>
<p><a class="section-link" href="${compareUrl}">→ Open both side-by-side in the Check.AI comparison tool</a></p>
</section>

<section class="seo-card">
<h2>Specs side-by-side</h2>
${specTable(a, b)}
<p style="margin-top:12px;font-size:13px;color:var(--muted)">Pricing from official ${a.vendor} and ${b.vendor} docs. Benchmark numbers from SWE-bench Verified, HumanEval, and LMArena public leaderboards as of May 2026.</p>
</section>

<section class="seo-card">
<h2>${a.name} — strengths and weaknesses</h2>
<p><strong>Strengths.</strong> ${a.strengths}</p>
<p><strong>Weaknesses.</strong> ${a.weaknesses}</p>
<p><strong>Best for.</strong> ${a.bestFor}</p>
</section>

<section class="seo-card">
<h2>${b.name} — strengths and weaknesses</h2>
<p><strong>Strengths.</strong> ${b.strengths}</p>
<p><strong>Weaknesses.</strong> ${b.weaknesses}</p>
<p><strong>Best for.</strong> ${b.bestFor}</p>
</section>

<section class="seo-card">
<h2>Which one should you pick?</h2>
<p><strong>Pick ${a.name} if:</strong> ${a.bestFor.toLowerCase()}</p>
<p><strong>Pick ${b.name} if:</strong> ${b.bestFor.toLowerCase()}</p>
<p><strong>Use both if:</strong> you're building an agent or content pipeline. Route the high-stakes / hard-reasoning calls to whichever scores higher on the axis you care about, and the bulk / cheap calls to the other. Most production AI products run a 2-3 model router rather than betting on one.</p>
</section>

<section class="seo-card">
<h2>Try them side-by-side</h2>
<p>The Check.AI comparison tool lets you put both models in one table with all the numbers, switch capability filters, and share the resulting URL with your team.</p>
<p><a class="section-link" href="${compareUrl}">→ Compare ${a.name} and ${b.name} in the live tool</a></p>
</section>

<section class="seo-card">
<h2>Related</h2>
<ul>
<li><a href="/topics/best-ai-models-for-coding/">Best AI models for coding (2026)</a></li>
<li><a href="/topics/cheapest-ai-api-models/">Cheapest AI API models (2026)</a></li>
<li><a href="/topics/long-context-ai-models/">Long context AI models (2026)</a></li>
<li><a href="/zh/articles/gpt-5-vs-claude-coding-2026/">GPT-5 vs Claude（中文深度对比）</a></li>
<li><a href="/zh/articles/deepseek-r1-vs-gpt-5-cost-2026/">DeepSeek R1 vs GPT-5 性价比（中文）</a></li>
</ul>
</section>

</main>
<footer class="seo-footer"><a href="/">Open the interactive comparison tool</a></footer>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "df6bb0324e4c458fb4e8b979d3feed3c"}'></script>
</body>
</html>
`;
}

function ensureDir(p) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }

function main() {
  const sorted = [...MODELS].sort((x, y) => x.slug.localeCompare(y.slug));
  let count = 0;
  const urls = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i], b = sorted[j];
      const slug = slugPair(a, b);
      const dir = `compare/${slug}`;
      ensureDir(dir);
      writeFileSync(`${dir}/index.html`, pageHtml(a, b));
      urls.push(`https://checkaimodels.com/compare/${slug}/`);
      count++;
    }
  }
  console.log(`[build-compare] wrote ${count} pages`);
  // Print sitemap fragment for easy copy-paste.
  for (const u of urls) {
    console.log(`  <url><loc>${u}</loc><lastmod>2026-05-10</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
  }
}

main();
