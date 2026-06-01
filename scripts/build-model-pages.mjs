#!/usr/bin/env node
// Generate /models/{canonical-slug}/index.html for every unique model in
// data/models.json. Dedupes models across providers (same canonical name
// becomes one page with a provider-pricing comparison table).
// Run: node scripts/build-model-pages.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { indexableSlugs, brandOfName } from './lib/model-subset.mjs';

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
  // 0 here means "not priced yet" (a freshly-listed model models.dev hasn't
  // priced), not "free" — showing "$0" on a frontier model is misleading.
  if (!n) return '未公开';
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

const INDEXABLE = indexableSlugs([...groups.values()]);

console.log(`[build-models] ${groups.size} unique canonical models from ${data.models.length} raw`);

function bestListing(listings) {
  // "best representative" = lowest REAL input price. Treat 0/null as "no price":
  // resellers/free tiers (e.g. GitHub Copilot) list frontier models at $0, which
  // must not masquerade as the cheapest. Fall back to any listing when none are
  // priced, so release_date / context still resolve.
  const priced = [...listings].filter((l) => l.price?.input > 0);
  if (priced.length) return priced.sort((a, b) => a.price.input - b.price.input)[0];
  return listings[0];
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

function injectLatest(file, lang) {
  if (!existsSync(file)) return;
  let html = readFileSync(file, 'utf8');
  const START = '<!-- LATEST:start -->', END = '<!-- LATEST:end -->';
  if (!html.includes(START) || !html.includes(END)) return;
  const latest = [...groups.values()]
    .map((g) => ({ g, best: bestListing(g.listings) }))
    .filter((x) => x.best && x.best.release_date)
    .sort((a, b) => Date.parse(b.best.release_date) - Date.parse(a.best.release_date))
    .slice(0, 8);
  const relWord = lang === 'zh' ? '发布 ' : 'released ';
  const items = latest.map(({ g, best }) =>
    `<li><a class="section-link" href="/models/${g.slug}/">${escAttr(g.displayName)}</a> <span style="color:var(--muted);font-size:13px">${relWord}${best.release_date}</span></li>`).join('\n');
  const block = `<ul>\n${items}\n</ul>`;
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n${block}\n${END}`);
  writeFileSync(file, html);
  console.log(`[build-models] injected ${lang} latest-models into ${file}`);
}

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
// The MAKER, inferred from the model name — NOT the cheapest-listing platform
// (a model's cheapest seller is often a reseller/cloud, e.g. GPT-5.5 on GitHub
// Copilot). Used for "X 是 ... 的模型" attribution; the price table still shows sellers.
const MAKER_ZH = {
  openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google', deepseek: 'DeepSeek',
  xai: 'xAI', qwen: '阿里通义千问', mistral: 'Mistral', moonshot: '月之暗面',
  zhipu: '智谱', minimax: 'MiniMax', meta: 'Meta',
};
function makerZh(name) { return MAKER_ZH[brandOfName(name)] || ''; }
const MAKER_EN = {
  openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google', deepseek: 'DeepSeek',
  xai: 'xAI', qwen: 'Alibaba (Qwen)', mistral: 'Mistral', moonshot: 'Moonshot AI',
  zhipu: 'Zhipu', minimax: 'MiniMax', meta: 'Meta',
};
function makerEn(name) { return MAKER_EN[brandOfName(name)] || ''; }
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
  const maker = makerZh(group.displayName);
  return `${group.displayName} ${maker ? '是 ' + maker + ' 的模型，' : '是一款 AI 模型，'}主打${zhCaps(meta.caps ? [...meta.caps] : [])}。`
    + `它的上下文窗口为 ${meta.ctx}，价格在同类中${tier}`
    + `${pricePct != null ? `（比约 ${pricePct}% 的同类便宜）` : ''}。适合${sceneByCap}。`;
}

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
  const makerName = makerZh(displayName);
  const priceBit = best.price?.input > 0
    ? `输入 ${fmtMoney(best.price.input)} / 输出 ${fmtMoney(best.price?.output)}（每 1M token，最便宜 ${zhBrand(best.platform)}）`
    : '多平台价格见下方对比表';
  const desc = `${displayName}${makerName ? `（${makerName}）` : ''} 中文资料与实时对比：${meta.ctx} 上下文，${priceBit}，能力 ${zhCaps([...meta.caps])}。在 Check.AI 查完整价格表、同类模型横向对比与六维能力评分。`;

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

function ensureDir(p) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }

function injectHomeLatest(file) {
  if (!existsSync(file)) return;
  let html = readFileSync(file, 'utf8');
  const START = '<!-- HOME_LATEST:start -->', END = '<!-- HOME_LATEST:end -->';
  if (!html.includes(START) || !html.includes(END)) return;
  const norm = (s) => s.toLowerCase().replace(/^[^:]+:\s*/, '').replace(/[^a-z0-9]/g, '');
  const seen = new Set();
  const latest = [];
  // Only the curated flagship set (INDEXABLE already dedups regional / Fast /
  // variant entries by family), so "最新动态" shows newest notable models —
  // not a flood of Opus 4.8 (JP)/(AU)/(Fast) or obscure one-offs.
  for (const x of [...groups.values()].filter((g) => INDEXABLE.has(g.slug))
    .map((g) => ({ g, best: bestListing(g.listings) }))
    .filter((x) => x.best && x.best.release_date)
    .sort((a, b) => Date.parse(b.best.release_date) - Date.parse(a.best.release_date))) {
    const key = norm(x.g.displayName);
    if (seen.has(x.g.slug) || seen.has(key)) continue;
    seen.add(x.g.slug); seen.add(key);
    latest.push(x);
    if (latest.length >= 6) break;
  }
  const cards = latest.map(({ g, best }) => {
    const m = makerZh(g.displayName);
    const d = String(best.release_date).slice(5);
    return `<a class="home-newsc" href="/models/${g.slug}/"><span><strong>${escAttr(g.displayName)}</strong>${m ? `<span class="maker">${escAttr(m)}</span>` : ''}</span><span class="when">${d} 新发布</span></a>`;
  }).join('\n');
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n<div class="home-news">\n${cards}\n</div>\n${END}`);
  writeFileSync(file, html);
  console.log(`[build-models] injected home latest into ${file}`);
}

function injectHomePopular(file) {
  if (!existsSync(file)) return;
  let html = readFileSync(file, 'utf8');
  const START = '<!-- HOME_POPULAR:start -->', END = '<!-- HOME_POPULAR:end -->';
  if (!html.includes(START) || !html.includes(END)) return;
  const picked = [...groups.values()].filter((g) => INDEXABLE.has(g.slug)).slice(0, 6);
  const cards = picked.map((g, i) => {
    const m = makerZh(g.displayName);
    return `<a class="home-popi" href="/models/${g.slug}/"><span class="rk">${i + 1}</span><strong>${escAttr(g.displayName)}</strong>${m ? `<span class="maker">${escAttr(m)}</span>` : ''}</a>`;
  }).join('\n');
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n<div class="home-pop">\n${cards}\n</div>\n${END}`);
  writeFileSync(file, html);
  console.log(`[build-models] injected home popular into ${file}`);
}

function main() {
  const slugs = [...groups.keys()];

  // Clear out the existing hand-curated stubs - we have richer data now.
  if (existsSync('models')) rmSync('models', { recursive: true, force: true });

  const allGroups = [...groups.values()];
  const urls = [];
  let written = 0;
  for (const slug of slugs) {
    const dir = `models/${slug}`;
    ensureDir(dir);
    const g = groups.get(slug);
    writeFileSync(`${dir}/index.html`, pageHtml(g, slugs, INDEXABLE.has(slug), allGroups));
    urls.push(`https://checkaimodels.com/models/${slug}/`);
    written++;
  }
  console.log(`[build-models] wrote ${written} pages`);

  const manifest = [...groups.values()].map((g) => ({
    slug: g.slug,
    name: g.displayName,
    indexable: INDEXABLE.has(g.slug),
  }));
  writeFileSync('data/model-slugs.json', JSON.stringify(manifest) + '\n');
  console.log(`[build-models] manifest: data/model-slugs.json (${manifest.length} slugs, ${manifest.filter((m) => m.indexable).length} indexable)`);

  injectLatest('zh/index.html', 'zh');
  injectLatest('en/index.html', 'en');
  injectHomeLatest('index.html');
  injectHomePopular('index.html');

  // Write sitemap fragment for piping into sitemap.xml later
  const sitemapFrag = urls
    .map((u) => `  <url><loc>${u}</loc><lastmod>2026-05-10</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`)
    .join('\n');
  writeFileSync('/tmp/models-sitemap-fragment.xml', sitemapFrag + '\n');
  console.log(`[build-models] sitemap fragment: /tmp/models-sitemap-fragment.xml (${urls.length} URLs)`);
}

main();
