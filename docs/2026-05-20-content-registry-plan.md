# Content Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `data/articles.json` the single source of truth for article metadata + zh/en correspondence, with `scripts/build-articles.mjs` assembling each article's `index.html` from registry + hand-written `body.html`, and regenerating the zh/en hub article lists.

**Architecture:** Registry (JSON) + body fragments (HTML) → build script → committed `index.html` artifacts. Hub lists injected between HTML markers. Pure static, zero new dependencies (Node built-ins only).

**Tech Stack:** Node ESM (`.mjs`), `node:fs`. No markdown lib, no framework. Validation via `scripts/audit-nav.mjs` (already exists).

---

## Schema refinements discovered during planning

Inspecting the existing articles revealed three fields the spec schema omitted; the registry must carry them for a faithful migration (no SEO regression):

- **`faq`** (per language): array of `{ "q": "...", "a": "..." }`. Every one of the 6 articles has a `FAQPage` JSON-LD block. Template emits it when present.
- **Distinct title/desc strings** (per language): the existing articles use up to four variants. Model them with sensible defaults:
  - `title` — the `<h1>` text (required)
  - `metaTitle` — the `<title>` text minus the ` | Check.AI` suffix (optional; defaults to `title`). Template always appends ` | Check.AI`.
  - `headline` — the `Article` JSON-LD headline (optional; defaults to `title`)
  - `description` — meta description (required)
  - `ogTitle` (optional; defaults to `metaTitle`), `ogDescription` (optional; defaults to `description`)
- **`related`** (per language): `{ "href": "...", "label": "..." }` for the hand-picked second footer link (e.g. `/zh/topics/long-context-ai-models/` → `长上下文模型选型指南`). Optional; if absent, footer shows only the home link.

The `lead` paragraph (`<p class="seo-lead">`) and TOC stay inside `body.html` (article prose).

---

## File Structure

| File | Responsibility |
|---|---|
| `data/articles.json` | Registry: array of article objects (metadata, faq, related, distribution, per-lang status) |
| `scripts/build-articles.mjs` | Reads registry + body fragments → writes article `index.html` files; injects hub lists |
| `zh/articles/<slug>/body.html` | zh prose fragment: from `<p class="seo-lead">` through last node before `</main>` |
| `en/articles/<slug>/body.html` | en prose fragment (created only when an en version is authored; none in this plan) |
| `zh/articles/<slug>/index.html` | GENERATED (committed, never hand-edited) |
| `zh/index.html` | hub: article `<ul>` wrapped in `<!-- ARTICLES:start -->`/`<!-- ARTICLES:end -->` |
| `en/index.html` | hub: article section wrapped in the same markers |

---

## Task 1: Extract body fragments from the 6 existing articles

**Files:**
- Create: `zh/articles/<slug>/body.html` × 6

- [ ] **Step 1: Extract each body fragment**

For each of the 6 slugs (china-ai-models-landscape-2026, claude-opus-4-7-review-2026, deepseek-r1-vs-gpt-5-cost-2026, gpt-5-vs-claude-coding-2026, local-llm-deployment-guide-2026, rag-vs-long-context-vs-fine-tune-2026), run this Node one-liner which copies the inner `<main>` content starting at the `<p class="seo-lead">` line (i.e. excludes the eyebrow `<p>` and the `<h1>`, which become template-generated) up to but not including `</main>`:

```bash
cd /d/Codex/check-ai
for s in china-ai-models-landscape-2026 claude-opus-4-7-review-2026 deepseek-r1-vs-gpt-5-cost-2026 gpt-5-vs-claude-coding-2026 local-llm-deployment-guide-2026 rag-vs-long-context-vs-fine-tune-2026; do
  node -e '
    const fs=require("fs");const f=process.argv[1];let s=fs.readFileSync(f+"/index.html","utf8");
    const main=s.match(/<main class="seo-main">([\s\S]*?)<\/main>/)[1];
    // drop the eyebrow <p> and the <h1>; body starts at <p class="seo-lead">
    const i=main.indexOf("<p class=\"seo-lead\">");
    const body=main.slice(i).trim()+"\n";
    fs.writeFileSync(f+"/body.html", body);
    console.log("wrote", f+"/body.html", body.length, "bytes");
  ' "zh/articles/$s"
done
```

- [ ] **Step 2: Verify each body.html starts with the lead and contains no eyebrow/h1**

Run:
```bash
cd /d/Codex/check-ai
for s in china-ai-models-landscape-2026 claude-opus-4-7-review-2026 deepseek-r1-vs-gpt-5-cost-2026 gpt-5-vs-claude-coding-2026 local-llm-deployment-guide-2026 rag-vs-long-context-vs-fine-tune-2026; do
  head -c 25 "zh/articles/$s/body.html"; echo " <- $s";
  grep -c '<h1>\|class="eyebrow"' "zh/articles/$s/body.html" | sed 's/^/  eyebrow+h1 count: /';
done
```
Expected: each starts with `<p class="seo-lead">` and `eyebrow+h1 count: 0`.

- [ ] **Step 3: Commit**

```bash
cd /d/Codex/check-ai
git add zh/articles/*/body.html
git -c core.autocrlf=false commit -m "content-registry: extract article body fragments"
```

---

## Task 2: Build the registry data/articles.json

**Files:**
- Create: `data/articles.json`

- [ ] **Step 1: Extract metadata from each article into the registry**

Run this script, which reads each article's existing `<head>` to populate the registry faithfully (title, metaTitle, description, og*, headline, dates, author, faq, related footer link), setting `zh.status="published"` and `en.status="none"`:

```bash
cd /d/Codex/check-ai
node -e '
const fs=require("fs");
const slugs=["china-ai-models-landscape-2026","claude-opus-4-7-review-2026","deepseek-r1-vs-gpt-5-cost-2026","gpt-5-vs-claude-coding-2026","local-llm-deployment-guide-2026","rag-vs-long-context-vs-fine-tune-2026"];
const pick=(s,re)=> (s.match(re)||[])[1] || "";
const out=[];
for(const slug of slugs){
  const s=fs.readFileSync("zh/articles/"+slug+"/index.html","utf8");
  const metaTitleFull=pick(s,/<title>([^<]*)<\/title>/);
  const metaTitle=metaTitleFull.replace(/\s*\|\s*Check\.AI\s*$/,"");
  const description=pick(s,/<meta name="description" content="([^"]*)"/);
  const ogTitle=pick(s,/<meta property="og:title" content="([^"]*)"/);
  const ogDescription=pick(s,/<meta property="og:description" content="([^"]*)"/);
  const h1=pick(s,/<h1>([\s\S]*?)<\/h1>/).trim();
  const eyebrow=pick(s,/<p class="eyebrow">([\s\S]*?)<\/p>/);
  const topic=(eyebrow.split("·")[0]||"深度对比").trim();
  // Article JSON-LD
  const artBlock=(s.match(/"@type":"Article"[\s\S]*?\}\s*<\/script>/)||[])[0]||"";
  const headline=pick(artBlock,/"headline":"([^"]*)"/);
  const datePublished=pick(artBlock,/"datePublished":"([^"]*)"/);
  const dateModified=pick(artBlock,/"dateModified":"([^"]*)"/);
  const author=pick(artBlock,/"name":"([^"]*)"/)||"zayuerweb-dev";
  const authorUrl=pick(artBlock,/"url":"(https:\/\/github[^"]*)"/)||"https://github.com/zayuerweb-dev";
  // FAQ JSON-LD
  let faq=[];
  const faqBlock=(s.match(/"@type":"FAQPage"[\s\S]*?<\/script>/)||[])[0]||"";
  const qre=/"name":"((?:[^"\\]|\\.)*)","acceptedAnswer":\{"@type":"Answer","text":"((?:[^"\\]|\\.)*)"/g;
  let m; while((m=qre.exec(faqBlock))){ faq.push({q:JSON.parse(\'"\'+m[1]+\'"\'), a:JSON.parse(\'"\'+m[2]+\'"\')}); }
  // related footer link (the 2nd footer <a>, if any)
  const footer=pick(s,/<footer class="seo-footer">([\s\S]*?)<\/footer>/);
  const links=[...footer.matchAll(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g)];
  const rel=links[1]?{href:links[1][1],label:links[1][2]}:null;
  const zh={title:h1, metaTitle, description, ogTitle, ogDescription, headline, status:"published"};
  if(rel) zh.related=rel;
  if(faq.length) zh.faq=faq;
  out.push({slug, topic, author, authorUrl, written:datePublished, published:datePublished, modified:dateModified, zh, en:{status:"none"}});
}
fs.writeFileSync("data/articles.json", JSON.stringify(out,null,2)+"\n");
console.log("wrote data/articles.json with", out.length, "entries");
'
```

- [ ] **Step 2: Verify registry parses and has 6 entries with required fields**

Run:
```bash
cd /d/Codex/check-ai
node -e 'const a=require("./data/articles.json"); if(!Array.isArray(a)||a.length!==6) throw new Error("expected 6"); for(const x of a){ for(const k of ["slug","topic","author","published","modified"]) if(!x[k]) throw new Error("missing "+k+" in "+x.slug); if(x.zh.status!=="published") throw new Error("zh not published: "+x.slug); if(!x.zh.title||!x.zh.description) throw new Error("zh title/desc missing: "+x.slug);} console.log("registry OK: 6 entries, all required fields present");'
```
Expected: `registry OK: 6 entries, all required fields present`.

- [ ] **Step 3: Commit**

```bash
cd /d/Codex/check-ai
git add data/articles.json
git -c core.autocrlf=false commit -m "content-registry: add data/articles.json (6 zh articles)"
```

---

## Task 3: Write scripts/build-articles.mjs (article page assembly)

**Files:**
- Create: `scripts/build-articles.mjs`

- [ ] **Step 1: Write the build script**

Create `scripts/build-articles.mjs` with this content:

```javascript
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
  // Canonical nav. Page-aware language toggle only if the other lang is published.
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
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
    headline, description: c.description,
    datePublished: art.published, dateModified: art.modified,
    author: { '@type': 'Person', name: art.author, url: art.authorUrl, sameAs: [art.authorUrl] },
    publisher: { '@type': 'Organization', name: 'Check.AI', url: 'https://checkaimodels.com/' },
  });
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

// --- inject hub lists (Task 4 adds the markers; this is a no-op until then) ---
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
injectHub('zh/index.html', 'zh');
injectHub('en/index.html', 'en');

if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `articles_written=${written}\n`);
```

- [ ] **Step 2: Run it and verify it regenerates the 6 zh pages without crashing**

Run:
```bash
cd /d/Codex/check-ai
node scripts/build-articles.mjs
```
Expected: `[build-articles] wrote 6 article pages` (hub injection lines appear after Task 4 adds markers).

- [ ] **Step 3: Verify a regenerated page has correct head + nav + no EN toggle**

Run:
```bash
cd /d/Codex/check-ai
grep -o '<header class="seo-header">.*</header>' zh/articles/rag-vs-long-context-vs-fine-tune-2026/index.html
grep -c 'FAQPage' zh/articles/rag-vs-long-context-vs-fine-tune-2026/index.html
grep -o '<title>[^<]*' zh/articles/rag-vs-long-context-vs-fine-tune-2026/index.html
```
Expected: nav = `对比工具·关于·联系` with NO EN link (en.status=none); FAQPage count `1`; title ends with ` | Check.AI`.

- [ ] **Step 4: Confirm git diff on the 6 pages is content-equivalent (whitespace/attr-order only)**

Run:
```bash
cd /d/Codex/check-ai
git diff --stat zh/articles/
```
Review: the diffs should be limited to formatting/ordering, not lost content (spot-check the rag article diff with `git diff zh/articles/rag-vs-long-context-vs-fine-tune-2026/index.html | head -60`). If a section of prose is missing, the body extraction in Task 1 was wrong — fix and rerun.

- [ ] **Step 5: Commit**

```bash
cd /d/Codex/check-ai
git add scripts/build-articles.mjs zh/articles/*/index.html
git -c core.autocrlf=false commit -m "content-registry: add build-articles.mjs + regenerate 6 zh articles"
```

---

## Task 4: Add hub markers + regenerate hub lists

**Files:**
- Modify: `zh/index.html` (wrap the 深度对比 `<ul>` in markers)
- Modify: `en/index.html` (wrap the Head-to-head/article section in markers)

- [ ] **Step 1: Add markers around the zh hub article list**

In `zh/index.html`, the 深度对比 section currently has a `<ul>...</ul>` listing the 6 articles (after `<h2>深度对比</h2>`). Wrap exactly that `<ul>...</ul>` so it reads:
```html
<h2>深度对比</h2>
<!-- ARTICLES:start -->
<ul>
... (existing 6 <li> lines) ...
</ul>
<!-- ARTICLES:end -->
<p style="color:var(--muted);margin-top:8px">每周新增一篇深度对比。</p>
```
Use the Edit tool: set `old_string` to the existing `<ul>\n...6 li...\n</ul>` block and `new_string` to the same block wrapped with the two marker comments.

- [ ] **Step 2: Add markers in en/index.html**

In `en/index.html`, the "Head-to-head comparisons" card lists compare-page links and a "Chinese only" note. The article list belongs in its own area; add an empty marker pair right before the closing `</section>` of the deep-dives note so generated en article items have a home:
```html
<!-- ARTICLES:start -->
<!-- ARTICLES:end -->
```
(Place it where en article links should appear. With 0 en articles published, the injector emits the "Chinese-only" paragraph.)

- [ ] **Step 3: Run the build and verify injection**

Run:
```bash
cd /d/Codex/check-ai
node scripts/build-articles.mjs
grep -c 'ARTICLES:start' zh/index.html en/index.html
grep -A8 'ARTICLES:start' zh/index.html | grep -c 'section-link'
```
Expected: marker present in both files; zh shows 6 `section-link` items between markers.

- [ ] **Step 4: Verify the zh hub list order matches registry order**

Run:
```bash
cd /d/Codex/check-ai
node -e 'const a=require("./data/articles.json").map(x=>x.slug); const fs=require("fs"); const h=fs.readFileSync("zh/index.html","utf8"); const block=h.match(/ARTICLES:start[\s\S]*?ARTICLES:end/)[0]; const got=[...block.matchAll(/articles\/([a-z0-9-]+)\//g)].map(m=>m[1]); console.log("registry:",a.join(",")); console.log("hub:     ",got.join(",")); if(JSON.stringify(a)!==JSON.stringify(got)) throw new Error("order mismatch"); console.log("order OK");'
```
Expected: `order OK`.

- [ ] **Step 5: Commit**

```bash
cd /d/Codex/check-ai
git add zh/index.html en/index.html
git -c core.autocrlf=false commit -m "content-registry: hub article lists generated from registry"
```

---

## Task 5: Validate with audit-nav + final integration

**Files:**
- None created; validates Tasks 1-4.

- [ ] **Step 1: Run the nav audit**

Run:
```bash
cd /d/Codex/check-ai
node scripts/audit-nav.mjs --static
```
Expected: `0 problem(s)`. The regenerated article pages must obey nav rules: brand → /zh/, nav `对比工具·关于·联系`, no language toggle (en.status=none for all), no dead links.

- [ ] **Step 2: Verify no orphaned hand-edited metadata remains**

Run:
```bash
cd /d/Codex/check-ai
node scripts/build-articles.mjs
git status --short zh/articles/ zh/index.html en/index.html
```
Expected: empty (re-running the build produces no diff — confirms idempotency and that committed pages match the registry).

- [ ] **Step 3: Document the workflow in README or a short note**

Append to `README.md` under a "Editing articles" note (use Edit tool to add after the existing editorial deep-dives list):
```markdown

### Editing articles
Articles are data-driven. To add or edit one:
1. Edit `data/articles.json` (metadata, faq, dates, status).
2. Write/edit `zh/articles/<slug>/body.html` (prose only — no eyebrow/h1).
3. Run `node scripts/build-articles.mjs` to regenerate pages + hub lists.
Never hand-edit `zh/articles/*/index.html` — it is generated.
```

- [ ] **Step 4: Commit**

```bash
cd /d/Codex/check-ai
git add README.md
git -c core.autocrlf=false commit -m "content-registry: document article authoring workflow"
```

---

## Self-Review

**Spec coverage:**
- Spec A (file structure) → Tasks 1-4 create registry, body fragments, build script, hub markers. ✓
- Spec B (schema) → Task 2 builds data/articles.json; planning added faq/og/headline/related (documented above). ✓
- Spec C (build-articles assembly) → Task 3 full script (head, JSON-LD from registry, page-aware nav, eyebrow date-formatted, footer). ✓
- Spec D (hub correspondence via en.status) → Task 3 `navFor`/`hreflangFor` gate the toggle on status; Task 4 hub injector filters by status. ✓
- Spec E (migration + boundaries + audit) → Task 1 extraction, Task 3 Step 4 content-equivalence check, Task 5 audit-nav + idempotency. ✓

**Placeholder scan:** No TBD/TODO. Body extraction uses a concrete substring rule (`<p class="seo-lead">` → before `</main>`), not a placeholder. ✓

**Type/name consistency:** `status` values (`published`/`none`) consistent across Task 2 data and Task 3 gates. Marker strings `<!-- ARTICLES:start -->`/`<!-- ARTICLES:end -->` identical in Task 3 injector and Task 4. CSS version `20260520-1` matches the rest of the site. Field names (`metaTitle`, `ogTitle`, `headline`, `related`, `faq`) consistent between Task 2 extraction and Task 3 rendering. ✓
