// Build article index.html files + hub article lists from data/articles.json
// + per-article body.html fragments. Run: node scripts/build-articles.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { appendFileSync } from 'node:fs';

const ROOT = process.cwd();
const CSS = '/styles.css?v=20260520-1';
const registry = JSON.parse(readFileSync('data/articles.json', 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const zhDate = (iso) => { const [y, m, d] = iso.split('-'); return `${y} 年 ${+m} 月 ${+d} 日`; };

function navFor(lang, slug, art) {
  if (lang === 'zh') {
    const en = art.en && art.en.status === 'published' ? `<a href="/en/articles/${slug}/">EN</a>` : '';
    return `<header class="seo-header"><a class="brand-link" href="/zh/">Check.AI</a><nav><a href="/">对比工具</a><a href="/zh/about/">关于</a><a href="/zh/contact/">联系</a>${en}</nav></header>`;
  }
  const zh = art.zh && art.zh.status === 'published' ? `<a href="/zh/articles/${slug}/">中文</a>` : '';
  return `<header class="seo-header"><a class="brand-link" href="/en/">Check.AI</a><nav><a href="/">Compare</a><a href="/about">About</a><a href="/privacy.html">Privacy</a><a href="/contact">Contact</a>${zh}</nav></header>`;
}

function hreflangFor(lang, slug, art) {
  const base = 'https://checkaimodels.com';
  const zhUrl = `${base}/zh/articles/${slug}/`;
  const enUrl = `${base}/en/articles/${slug}/`;
  const selfUrl = lang === 'zh' ? zhUrl : enUrl;
  const out = [`<link rel="canonical" href="${selfUrl}">`];
  out.push(`<link rel="alternate" hreflang="${lang}" href="${selfUrl}">`);
  if (lang === 'zh' && art.en && art.en.status === 'published') out.push(`<link rel="alternate" hreflang="en" href="${enUrl}">`);
  if (lang === 'en' && art.zh && art.zh.status === 'published') out.push(`<link rel="alternate" hreflang="zh" href="${zhUrl}">`);
  out.push(`<link rel="alternate" hreflang="x-default" href="${selfUrl}">`);
  return out.join('\n');
}

function articleJsonLd(lang, art, c) {
  const headline = c.headline || c.title;
  const obj = {
    '@context': 'https://schema.org', '@type': 'Article', inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
    headline, description: c.description,
    datePublished: art.published, dateModified: art.modified,
    author: { '@type': 'Person', name: art.author, url: art.authorUrl, sameAs: [art.authorUrl] },
    publisher: { '@type': 'Organization', name: 'Check.AI', url: 'https://checkaimodels.com/' },
  };
  if (c.sources && c.sources.length) {
    obj.citation = c.sources.map((s) => ({ '@type': 'CreativeWork', name: s.claim, url: s.url }));
  }
  return JSON.stringify(obj);
}

function faqJsonLd(lang, faq) {
  if (!faq || !faq.length) return '';
  const json = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  });
  return `\n<script type="application/ld+json">${json}</script>`;
}

function footerFor(lang, c) {
  const home = lang === 'zh' ? '<a href="/zh/">返回中文首页</a>' : '<a href="/en/">Back to home</a>';
  const rel = c.related ? ` · <a href="${c.related.href}">${esc(c.related.label)}</a>` : '';
  return `<footer class="seo-footer">${home}${rel}</footer>`;
}

function sourcesSection(lang, c) {
  if (!c.sources || !c.sources.length) return '';
  const label = lang === 'zh' ? '参考来源' : 'Sources';
  const items = c.sources.map((s) =>
    `<li><a href="${esc(s.url)}" target="_blank" rel="noopener nofollow">${esc(s.claim)}</a>${s.checked ? ` <span style="color:var(--muted)">· ${esc(s.checked)}</span>` : ''}</li>`
  ).join('\n');
  return `\n<section class="seo-card"><h2>${label}</h2><ul>\n${items}\n</ul></section>`;
}

function renderArticle(lang, art) {
  const c = art[lang];
  const slug = art.slug;
  const metaTitle = c.metaTitle || c.title;
  const ogTitle = c.ogTitle || metaTitle;
  const ogDescription = c.ogDescription || c.description;
  const body = readFileSync(`${lang}/articles/${slug}/body.html`, 'utf8').trim();
  const eyebrowAuthor = `<a href="${art.authorUrl}" rel="author">@${art.author}</a>`;
  const eyebrow = lang === 'zh'
    ? `${art.topic} · ${zhDate(art.published)} · 作者 ${eyebrowAuthor}`
    : `${art.topic} · ${art.published} · by ${eyebrowAuthor}`;
  return `<!doctype html>
<html lang="${lang === 'zh' ? 'zh-CN' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(metaTitle)} | Check.AI</title>
<meta name="description" content="${esc(c.description)}">
${hreflangFor(lang, slug, art)}
<meta property="og:title" content="${esc(ogTitle)}">
<meta property="og:description" content="${esc(ogDescription)}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://checkaimodels.com/${lang}/articles/${slug}/">
<link rel="stylesheet" href="${CSS}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">${articleJsonLd(lang, art, c)}</script>${faqJsonLd(lang, c.faq)}
</head>
<body class="seo-page">
${navFor(lang, slug, art)}
<main class="seo-main">
<p class="eyebrow">${eyebrow}</p>
<h1>${esc(c.title)}</h1>
${body}
${sourcesSection(lang, c)}
</main>
${footerFor(lang, c)}
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "df6bb0324e4c458fb4e8b979d3feed3c"}'></script>
</body>
</html>
`;
}

let written = 0;
for (const art of registry) {
  for (const lang of ['zh', 'en']) {
    if (!art[lang] || art[lang].status !== 'published') continue;
    if (!existsSync(`${lang}/articles/${art.slug}/body.html`)) { console.error(`MISSING body: ${lang}/articles/${art.slug}/body.html`); process.exit(1); }
    writeFileSync(`${lang}/articles/${art.slug}/index.html`, renderArticle(lang, art));
    written++;
  }
}
console.log(`[build-articles] wrote ${written} article pages`);

// --- inject hub lists ---
function injectHub(file, lang) {
  if (!existsSync(file)) return;
  let html = readFileSync(file, 'utf8');
  const START = '<!-- ARTICLES:start -->', END = '<!-- ARTICLES:end -->';
  if (!html.includes(START) || !html.includes(END)) return;
  const items = registry.filter((a) => a[lang] && a[lang].status === 'published')
    .map((a) => `<li><a class="section-link" href="/${lang}/articles/${a.slug}/">${esc(a[lang].title)}</a></li>`).join('\n');
  const block = items
    ? `<ul>\n${items}\n</ul>`
    : (lang === 'en' ? '<p style="color:var(--muted)">Editorial deep-dives are Chinese-only right now — <a href="/zh/">read them here</a>.</p>' : '');
  const re = new RegExp(`${START}[\\s\\S]*?${END}`);
  html = html.replace(re, `${START}\n${block}\n${END}`);
  writeFileSync(file, html);
  console.log(`[build-articles] injected ${lang} hub list into ${file}`);
}
injectHub('index.html', 'zh');
injectHub('en/index.html', 'en');

if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `articles_written=${written}\n`);
