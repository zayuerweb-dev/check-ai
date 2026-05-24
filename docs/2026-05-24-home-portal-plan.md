# Home Portal (T3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the root `/` into a portal homepage (hero search + latest / popular / company / articles panels) and relocate the SPA compare tool to `/app/`, keeping the e2e suite green at every commit.

**Architecture:** `/index.html` becomes the zh portal (canonical `/`); `/en/index.html` becomes the en portal; the current SPA at `/index.html` moves to `/app/index.html`; `/zh/` becomes a 301 redirect to `/` (a markerless stub stays on disk so existing `/zh/` links + the nav audit still resolve). The sitewide "对比工具 / Compare" nav link (currently `/`) is repointed to `/app/` in the three generator templates and the hand-written pages. Latest/Popular panels are injected at build time from `data/models.json`.

**Tech Stack:** Static HTML/CSS/JS, Node ESM build scripts (`scripts/*.mjs`), Playwright e2e (`tests/e2e/*.spec.mjs`), `node --test` unit tests. Repo: `D:\Codex\check-ai` (run all commands there). Windows: commit with `git -c core.autocrlf=false`.

**Working dir & branch:** All work happens in `D:\Codex\check-ai` on branch `t3-home-portal` (already created; the design spec is already committed there). Every `git`/`node`/`npx` command below assumes cwd = `D:\Codex\check-ai`.

---

## File Structure

**Created:**
- `app/index.html` — the relocated SPA tool (copy of current root `index.html`, with canonical/og/ld+json pointing at `/app/`).
- `_redirects` — Cloudflare Pages redirect rules (`/zh/` → `/`).
- `tests/e2e/portal.spec.mjs` — new e2e for portal behavior.

**Modified:**
- `index.html` — was the SPA; becomes the zh portal.
- `en/index.html` — zh-hub-style page; becomes the en portal.
- `zh/index.html` — becomes a markerless redirect stub → `/`.
- `styles.css` — add portal panel styles (`.portal-*`).
- `scripts/build-model-pages.mjs` — `injectLatest` dedup + retarget zh→`index.html`; add `injectPopular`; add `MAKER_EN`; repoint nav/footer "对比工具" → `/app/`.
- `scripts/build-articles.mjs` — retarget zh article injection → `index.html`; repoint `navFor` "对比工具"/"Compare" → `/app/`.
- `scripts/build-compare-pages.mjs` — repoint `navHtml` "对比工具"/"Compare" → `/app/`.
- `scripts/build-sitemap.mjs` — add `/app/`; drop `/zh/`.
- `scripts/audit-nav.mjs` — no change expected (verify green); **do not** edit unless a task step says so.
- Hand-written nav pages: `about.html`, `contact.html`, `privacy.html`, `zh/about/index.html`, `zh/contact/index.html`, `topics/*/index.html` (6), `zh/topics/*/index.html` (6) — repoint first nav link `/` → `/app/`.
- `tests/e2e/helpers.mjs`, `tests/e2e/{compare,model-detail,model-search,search,i18n-nav,home}.spec.mjs` — retarget the tool from `/` to `/app/`.

---

## Task 1: Relocate the SPA to `/app/` (root still serves the tool)

This task creates the tool at `/app/` and migrates the e2e suite to it, **without** touching root `/` yet — so `/` and `/app/` both serve the tool and the suite stays green.

**Files:**
- Create: `app/index.html`
- Modify: `tests/e2e/helpers.mjs`
- Modify: `tests/e2e/compare.spec.mjs`, `tests/e2e/model-detail.spec.mjs`, `tests/e2e/model-search.spec.mjs`, `tests/e2e/search.spec.mjs`, `tests/e2e/i18n-nav.spec.mjs`, `tests/e2e/home.spec.mjs`

- [ ] **Step 1: Create `app/index.html` as a copy of the current root SPA**

```bash
mkdir -p app
cp index.html app/index.html
```

- [ ] **Step 2: Point the relocated tool's canonical/og/ld+json + home links at `/app/`**

In `app/index.html` only, replace the three SEO URL occurrences and the trust-bar home link. The current root `index.html` head contains (single line):
- `<link rel="canonical" href="https://checkaimodels.com/">`
- `<meta property="og:url" content="https://checkaimodels.com/">`
- `"url":"https://checkaimodels.com/"` (inside the WebApplication ld+json)
- hreflang lines: `<link rel="alternate" hreflang="en" href="https://checkaimodels.com/">` and the `zh` and `x-default` variants (all currently `/`)
- trust-bar: `<a href="/zh/">中文文章</a> · <a href="/about">About</a>`

Edit `app/index.html` so each becomes the `/app/` form:
- canonical → `https://checkaimodels.com/app/`
- og:url → `https://checkaimodels.com/app/`
- ld+json `"url"` → `https://checkaimodels.com/app/`
- hreflang `en`, `zh`, `x-default` → `https://checkaimodels.com/app/`
- trust-bar `<a href="/zh/">中文文章</a>` → `<a href="/">中文首页</a>`

(Use Edit with `replace_all: false` on the unique `https://checkaimodels.com/"` strings within `app/index.html`; the canonical/og/ld variants differ in surrounding text so target each precisely. Leave the root `index.html` untouched in this task.)

- [ ] **Step 3: Migrate the e2e helper to `/app/`**

`tests/e2e/helpers.mjs` currently loads the SPA at `/?lang=`. Open it and change the `ready()` navigation target from `/?lang=${lang}` to `/app/?lang=${lang}`. Exact edit:

```js
// before
await page.goto(`/?lang=${lang}`);
// after
await page.goto(`/app/?lang=${lang}`);
```

(If `ready` uses a different exact string, change the `/` SPA path to `/app/` while preserving the `?lang=` query and any waits.)

- [ ] **Step 4: Retarget tool-loading specs from `/` to `/app/`**

In each of `compare.spec.mjs`, `model-detail.spec.mjs`, `model-search.spec.mjs`, `search.spec.mjs`, `i18n-nav.spec.mjs`, replace direct SPA navigations:
- `page.goto('/')` → `page.goto('/app/')`
- `page.goto('/?` ... `')` (e.g. `/?lang=en`, `/?compare=...`) → `page.goto('/app/?` ... `')`
- any `waitForURL(/\/\?.../)` that expects the tool at root → expect `/app/?...`

Do **not** change navigations that target `/zh/`, `/en/`, `/topics/`, `/compare/`, `/models/` — only the bare-root tool navigations move.

In `home.spec.mjs`, change only the first test's `await page.goto('/?q=gpt-5.5')` → `await page.goto('/app/?q=gpt-5.5')`. Leave the two `/zh/` tests as-is for now (root still serves the SPA, so the `/zh/` form's `action="/"` still lands on the tool — those tests are rewritten in Task 2/3).

- [ ] **Step 5: Run the full e2e suite — expect green**

Run: `npm run test:e2e`
Expected: all specs pass. Both `/` (untouched root SPA) and `/app/` (new copy) serve the tool; helper + retargeted specs now hit `/app/`.

- [ ] **Step 6: Commit**

```bash
git -c core.autocrlf=false add app/index.html tests/e2e/helpers.mjs tests/e2e/compare.spec.mjs tests/e2e/model-detail.spec.mjs tests/e2e/model-search.spec.mjs tests/e2e/search.spec.mjs tests/e2e/i18n-nav.spec.mjs tests/e2e/home.spec.mjs
git -c core.autocrlf=false commit -m "feat(t3): relocate SPA tool to /app/ and migrate e2e suite"
```

---

## Task 2: Build the zh portal at `/` + `/zh/` redirect

Replace the root SPA with the portal. After this task, `/` = portal, `/app/` = tool, `/zh/` → `/`.

**Files:**
- Modify: `index.html` (overwrite with portal)
- Modify: `zh/index.html` (overwrite with redirect stub)
- Create: `_redirects`
- Modify: `styles.css` (append portal styles)
- Modify: `tests/e2e/home.spec.mjs`
- Create: `tests/e2e/portal.spec.mjs`

- [ ] **Step 1: Append portal panel styles to `styles.css`**

Append at end of `styles.css` (one line is fine; expanded here for clarity):

```css
/* T3 portal panels */
.portal-hero{text-align:center;padding:8px 0 18px}
.portal-hero h1{font-size:clamp(30px,5vw,46px);line-height:1.08;color:var(--ink);margin:0 0 10px}
.portal-grid{display:grid;gap:12px;grid-template-columns:repeat(3,1fr)}
.portal-grid.cols4{grid-template-columns:repeat(4,1fr)}
.portal-card{border:1px solid var(--line);background:var(--paper);border-radius:8px;padding:13px 14px;display:block}
.portal-card:hover{border-color:var(--accent);background:#fbfffd}
.portal-card strong{display:block;color:var(--ink);font-size:16px}
.portal-card .maker{color:var(--muted);font-size:13px}
.portal-card .when{color:#0c6f68;font-size:12px;font-weight:700;margin-top:4px;display:block}
.company-row{display:flex;flex-wrap:wrap;gap:8px}
.company-chip{border:1px solid #8ec7bd;background:#e8f5f1;color:#0c6f68;border-radius:999px;padding:7px 14px;font-weight:700;font-size:14px;display:inline-block}
.company-chip:hover{background:#dcefe9}
@media(max-width:760px){.portal-grid,.portal-grid.cols4{grid-template-columns:1fr 1fr}}
```

- [ ] **Step 2: Overwrite `index.html` with the zh portal**

Write `index.html` (root) as the zh portal below. Note: `brand-link` stays `/zh/` (the nav audit expects zh brand = `/zh/`, and `/zh/` resolves to the stub file from Step 4); the "对比工具" nav link is `/app/`; the hero search posts to `/app/`; a head script redirects old tool deep-links. `LATEST` and `POPULAR` marker blocks are placeholders here and get filled by the build in Task 4.

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Check.AI — AI 模型对比与选型：GPT-5、Claude、Gemini、DeepSeek</title>
<meta name="description" content="中立、有时效、可追溯的 AI 模型对比首页。最新模型、热门模型、按公司浏览，一键进入对比工具。GPT-5、Claude Sonnet 4.6、Gemini、Grok、DeepSeek、Qwen、Mistral。">
<link rel="canonical" href="https://checkaimodels.com/">
<link rel="alternate" hreflang="zh" href="https://checkaimodels.com/">
<link rel="alternate" hreflang="en" href="https://checkaimodels.com/en/">
<link rel="alternate" hreflang="x-default" href="https://checkaimodels.com/">
<meta property="og:title" content="Check.AI — AI 模型对比与选型">
<meta property="og:description" content="中立、有时效、可追溯的 AI 模型对比首页。">
<meta property="og:type" content="website">
<meta property="og:url" content="https://checkaimodels.com/">
<link rel="stylesheet" href="/styles.css?v=20260524-1">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>(function(){var s=location.search;if(/[?&](compare|q|lang)=/.test(s)){location.replace('/app/'+s);}})();</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","inLanguage":"zh-CN","name":"Check.AI","url":"https://checkaimodels.com/","description":"AI 模型、API 价格与选型对比数据库。"}
</script>
</head>
<body class="seo-page">
<header class="seo-header"><a class="brand-link" href="/zh/">Check.AI</a><nav><a href="/app/">对比工具</a><a href="/zh/about/">关于</a><a href="/zh/contact/">联系</a><a href="/en/">EN</a></nav></header>
<main class="seo-main">
<section class="portal-hero">
<p class="eyebrow">AI 模型选型数据库 · 2026 年 5 月更新</p>
<h1>挑 AI 模型，先来 Check 一下</h1>
<p class="seo-lead">对比 60+ 平台、1700+ 模型的能力、价格与上下文。一句话搜，直接进对比工具。</p>
<form class="home-search" action="/app/" method="get" role="search">
<input type="search" name="q" placeholder="搜公司或模型…  例如 Claude、GPT-5、DeepSeek" aria-label="搜索 AI 公司或模型">
<button type="submit">对比 →</button>
</form>
</section>

<section class="seo-card">
<h2>最新模型</h2>
<!-- LATEST:start -->
<ul></ul>
<!-- LATEST:end -->
</section>

<section class="seo-card">
<h2>热门模型</h2>
<!-- POPULAR:start -->
<div class="portal-grid cols4"></div>
<!-- POPULAR:end -->
</section>

<section class="seo-card">
<h2>按公司浏览</h2>
<div class="company-row">
<a class="company-chip" href="/app/?q=OpenAI">OpenAI</a>
<a class="company-chip" href="/app/?q=Anthropic">Anthropic</a>
<a class="company-chip" href="/app/?q=Google">Google</a>
<a class="company-chip" href="/app/?q=DeepSeek">DeepSeek</a>
<a class="company-chip" href="/app/?q=xAI">xAI</a>
<a class="company-chip" href="/app/?q=Qwen">阿里 Qwen</a>
<a class="company-chip" href="/app/?q=Moonshot">月之暗面 Kimi</a>
<a class="company-chip" href="/app/?q=Mistral">Mistral</a>
</div>
</section>

<section class="seo-card">
<h2>按场景选模型</h2>
<ul>
<li><a class="section-link" href="/zh/topics/best-ai-models-for-coding/">2026 年写代码最强 AI 模型对比</a></li>
<li><a class="section-link" href="/zh/topics/cheapest-ai-api-models/">2026 年最便宜的 AI API 模型</a></li>
<li><a class="section-link" href="/zh/topics/long-context-ai-models/">长上下文 AI 模型（Gemini 2M、Claude 1M）</a></li>
<li><a class="section-link" href="/zh/topics/ai-models-with-web-access/">支持联网搜索的 AI 模型</a></li>
<li><a class="section-link" href="/zh/topics/ai-models-for-writing/">写作最强的 AI 模型</a></li>
<li><a class="section-link" href="/zh/topics/open-source-ai-models/">开源 AI 模型对比（DeepSeek、Qwen、Llama）</a></li>
</ul>
</section>

<section class="seo-card">
<h2>深度对比</h2>
<!-- ARTICLES:start -->
<ul></ul>
<!-- ARTICLES:end -->
<p style="color:var(--muted);margin-top:8px">每周新增一篇深度对比。</p>
</section>

<section class="seo-card">
<h2>关于数据</h2>
<p>价格、上下文、能力数据来自厂商官网与开源 <a href="https://models.dev" target="_blank" rel="noopener">models.dev</a> 数据集，每周核对一次。跑分来自 LMArena、SWE-bench、HumanEval、MMLU 等公开评测以及厂商自报。深度对比的编辑判断由 Check.AI 撰写。</p>
</section>
</main>
<footer class="seo-footer"><a href="/en/">English version</a> · <a href="/zh/about/">关于</a></footer>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "df6bb0324e4c458fb4e8b979d3feed3c"}'></script>
</body>
</html>
```

- [ ] **Step 3: Create `_redirects` (Cloudflare Pages)**

Write `_redirects` at repo root:

```
/zh/   /   301
```

- [ ] **Step 4: Overwrite `zh/index.html` with a markerless redirect stub**

The stub must (a) exist on disk so generated pages' `brand-link="/zh/"` resolve in `audit-nav.mjs`, and (b) have **no** `<header class="seo-header">` so the audit skips it. Write `zh/index.html`:

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>Check.AI</title>
<link rel="canonical" href="https://checkaimodels.com/">
<meta http-equiv="refresh" content="0; url=/">
<script>location.replace('/' + location.search);</script>
</head>
<body><p>正在跳转到 <a href="/">Check.AI 首页</a>…</p></body>
</html>
```

- [ ] **Step 5: Rewrite the zh tests in `home.spec.mjs`**

Replace the three tests in `tests/e2e/home.spec.mjs` with portal-aware versions:

```js
import { test, expect } from '@playwright/test';

test.describe('home portal', () => {
  test('portal hero search routes to /app/ with the query', async ({ page }) => {
    await page.goto('/');
    await page.fill('.home-search input[name="q"]', 'claude');
    await page.locator('.home-search button[type="submit"]').click();
    await page.waitForURL(/\/app\/\?q=claude/);
    await page.waitForSelector('#platformList .platform-card');
    await expect(
      page.locator('#platformList .platform-card strong', { hasText: 'Anthropic' }).first(),
    ).toBeVisible();
  });

  test('old /?q= deep link client-redirects to /app/', async ({ page }) => {
    await page.goto('/?q=gpt-5.5');
    await page.waitForURL(/\/app\/\?q=gpt-5\.5/);
    await expect(page.locator('#platformSearch')).toHaveValue('gpt-5.5');
  });

  test('portal shows latest + popular sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2', { hasText: '最新模型' })).toBeVisible();
    await expect(page.locator('h2', { hasText: '热门模型' })).toBeVisible();
  });
});
```

- [ ] **Step 6: Create `tests/e2e/portal.spec.mjs` (panel link integrity)**

This asserts the company chip routes to the tool. (Latest/Popular card links are asserted in Task 4 after they're injected.)

```js
import { test, expect } from '@playwright/test';

test.describe('portal panels', () => {
  test('company chip routes to /app/?q=', async ({ page }) => {
    await page.goto('/');
    const chip = page.locator('.company-chip', { hasText: 'OpenAI' }).first();
    await expect(chip).toHaveAttribute('href', '/app/?q=OpenAI');
  });

  test('tool nav link points to /app/', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.seo-header nav a', { hasText: '对比工具' })).toHaveAttribute('href', '/app/');
  });
});
```

- [ ] **Step 7: Run the e2e suite — expect green**

Run: `npm run test:e2e`
Expected: all specs pass, including the rewritten `home.spec.mjs` and new `portal.spec.mjs`. (`compare`/`model-*`/`search` already hit `/app/` from Task 1.)

If any spec navigates to `/zh/` expecting hub content (e.g. `i18n-nav.spec.mjs` clicking a language toggle from `/zh/`, or asserting `/zh/` shows the old hub), it will now fail — `/zh/` is a markerless redirect stub. Update such navigations to start from `/` instead of `/zh/`, since `/` is the zh home now.

- [ ] **Step 8: Commit**

```bash
git -c core.autocrlf=false add index.html zh/index.html _redirects styles.css tests/e2e/home.spec.mjs tests/e2e/portal.spec.mjs
git -c core.autocrlf=false commit -m "feat(t3): portal at / with hero+company panels; /zh/ -> / redirect"
```

---

## Task 3: Build the en portal at `/en/`

Upgrade the existing en hub into the en portal: hero search → `/app/`, add POPULAR markers, repoint nav "Compare" → `/app/`, and point the 中文 toggle + hreflang zh at `/` (the new zh home).

**Files:**
- Modify: `en/index.html`
- Modify: `tests/e2e/i18n-nav.spec.mjs` (only if it asserts the en→zh toggle target)

- [ ] **Step 1: Edit `en/index.html` head — hreflang zh + nav toggle target**

In `en/index.html`:
- Change `<link rel="alternate" hreflang="zh" href="https://checkaimodels.com/zh/">` → `href="https://checkaimodels.com/"`.
- In the `seo-header` nav, change the trailing `<a href="/zh/">中文</a>` → `<a href="/">中文</a>`.
- In the `seo-footer`, change `<a href="/zh/">中文版</a>` → `<a href="/">中文版</a>`.

- [ ] **Step 2: Edit `en/index.html` nav — Compare → /app/**

Change the first nav anchor `<a href="/">Compare</a>` → `<a href="/app/">Compare</a>` (line 23 region).

- [ ] **Step 3: Edit `en/index.html` hero — search posts to /app/**

The hero form currently is `<form class="home-search" action="/" method="get" role="search">` with a hidden `<input type="hidden" name="lang" value="en">`. Change `action="/"` → `action="/app/"` (keep the hidden `lang=en` input so the tool opens in English).

- [ ] **Step 4: Add a POPULAR marker block to `en/index.html`**

Immediately after the existing `<!-- LATEST:end --></section>` (the "Latest models" card), insert a new card with POPULAR markers:

```html
<section class="seo-card">
<h2>Popular models</h2>
<!-- POPULAR:start -->
<div class="portal-grid cols4"></div>
<!-- POPULAR:end -->
</section>
```

- [ ] **Step 5: Add a company panel to `en/index.html`**

After the POPULAR section, insert:

```html
<section class="seo-card">
<h2>Browse by company</h2>
<div class="company-row">
<a class="company-chip" href="/app/?q=OpenAI">OpenAI</a>
<a class="company-chip" href="/app/?q=Anthropic">Anthropic</a>
<a class="company-chip" href="/app/?q=Google">Google</a>
<a class="company-chip" href="/app/?q=DeepSeek">DeepSeek</a>
<a class="company-chip" href="/app/?q=xAI">xAI</a>
<a class="company-chip" href="/app/?q=Qwen">Qwen</a>
<a class="company-chip" href="/app/?q=Moonshot">Moonshot</a>
<a class="company-chip" href="/app/?q=Mistral">Mistral</a>
</div>
</section>
```

- [ ] **Step 6: Run e2e (defer the full nav audit to Task 5)**

Do **not** run `audit-nav.mjs` here. Between this task and Task 5 the zh pages have mixed tool-link targets — the root + en portals now say `/app/` while the other hand-written pages (`zh/about`, `zh/contact`, `zh/topics/*`, generated pages) still say `/`. The audit's cross-page nav-identity check would (correctly) flag that drift. The audit is expected green only after Task 5 repoints everything.

Run: `npm run test:e2e`
Expected: green. If `i18n-nav.spec.mjs` asserts the en page's 中文 link target was `/zh/`, update that assertion to `/`.

- [ ] **Step 7: Commit**

```bash
git -c core.autocrlf=false add en/index.html tests/e2e/i18n-nav.spec.mjs
git -c core.autocrlf=false commit -m "feat(t3): en portal at /en/ (hero->/app/, popular+company panels, zh home->/)"
```

---

## Task 4: Build-time injection — Latest (dedup) + Popular

Retarget the zh injections to root `index.html`, de-duplicate Latest, and add a Popular injector that fills the `POPULAR` markers from the flagship indexable set.

**Files:**
- Modify: `scripts/build-model-pages.mjs`
- Modify: `scripts/build-articles.mjs`
- Modify: `tests/e2e/portal.spec.mjs` (add card-link assertions)

- [ ] **Step 1: Retarget the zh Latest injection to root `index.html`**

In `scripts/build-model-pages.mjs`, the `main()` calls (currently lines ~371-372):

```js
  injectLatest('zh/index.html', 'zh');
  injectLatest('en/index.html', 'en');
```

Change the zh target to the root portal:

```js
  injectLatest('index.html', 'zh');
  injectLatest('en/index.html', 'en');
```

- [ ] **Step 2: De-duplicate the Latest list**

In `injectLatest` (lines ~100-117), the `latest` array currently slices the top 8 after sorting by date. Replace the `.slice(0, 8)` tail with a de-dup that collapses by slug AND by normalized display name (so "Qwen 3.7 Max" and "Qwen3.7 Max" count once), then takes 8. Replace:

```js
  const latest = [...groups.values()]
    .map((g) => ({ g, best: bestListing(g.listings) }))
    .filter((x) => x.best && x.best.release_date)
    .sort((a, b) => Date.parse(b.best.release_date) - Date.parse(a.best.release_date))
    .slice(0, 8);
```

with:

```js
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const seenLatest = new Set();
  const latest = [];
  for (const x of [...groups.values()]
    .map((g) => ({ g, best: bestListing(g.listings) }))
    .filter((x) => x.best && x.best.release_date)
    .sort((a, b) => Date.parse(b.best.release_date) - Date.parse(a.best.release_date))) {
    const key = norm(x.g.displayName);
    if (seenLatest.has(x.g.slug) || seenLatest.has(key)) continue;
    seenLatest.add(x.g.slug); seenLatest.add(key);
    latest.push(x);
    if (latest.length >= 8) break;
  }
```

- [ ] **Step 3: Add `MAKER_EN` and extend Popular injection — add the injector**

Near `MAKER_ZH` / `makerZh` (lines ~134-139) in `scripts/build-model-pages.mjs`, add an English maker map and helper:

```js
const MAKER_EN = {
  openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google', deepseek: 'DeepSeek',
  xai: 'xAI', qwen: 'Alibaba (Qwen)', mistral: 'Mistral', moonshot: 'Moonshot AI',
  zhipu: 'Zhipu', minimax: 'MiniMax', meta: 'Meta',
};
function makerEn(name) { return MAKER_EN[brandOfName(name)] || ''; }
```

Then add an `injectPopular` function next to `injectLatest`. It fills the `POPULAR` markers with up to 8 cards from the flagship indexable set (`INDEXABLE`, the `Set` of slugs already computed at line ~58), ordered by the same `groups` iteration, each card linking to `/models/<slug>/`:

```js
function injectPopular(file, lang) {
  if (!existsSync(file)) return;
  let html = readFileSync(file, 'utf8');
  const START = '<!-- POPULAR:start -->', END = '<!-- POPULAR:end -->';
  if (!html.includes(START) || !html.includes(END)) return;
  const picked = [...groups.values()].filter((g) => INDEXABLE.has(g.slug)).slice(0, 8);
  const maker = lang === 'zh' ? makerZh : makerEn;
  const cards = picked.map((g) => {
    const m = maker(g.displayName);
    return `<a class="portal-card" href="/models/${g.slug}/"><strong>${escAttr(g.displayName)}</strong>${m ? `<span class="maker">${escAttr(m)}</span>` : ''}</a>`;
  }).join('\n');
  const block = `<div class="portal-grid cols4">\n${cards}\n</div>`;
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n${block}\n${END}`);
  writeFileSync(file, html);
  console.log(`[build-models] injected ${lang} popular-models into ${file}`);
}
```

(Verify `INDEXABLE` is in scope at module level — it's defined at line ~58 as `const INDEXABLE = indexableSlugs([...groups.values()]);`. If it's scoped inside `main()`, hoist the `injectPopular` calls into `main()` after `INDEXABLE` is defined, or pass `INDEXABLE` as a parameter. `escAttr` is the same helper `injectLatest` uses.)

- [ ] **Step 4: Call `injectPopular` for both portals**

In `main()`, right after the two `injectLatest` calls:

```js
  injectPopular('index.html', 'zh');
  injectPopular('en/index.html', 'en');
```

- [ ] **Step 5: Retarget zh article injection to root `index.html`**

In `scripts/build-articles.mjs`, find where it injects the article list between `<!-- ARTICLES:start -->` / `<!-- ARTICLES:end -->` (grep `ARTICLES:start` in that file). It currently writes to `zh/index.html` for zh and `en/index.html` for en. Change the zh target from `zh/index.html` to `index.html`. (Exact variable/path depends on the file; change only the zh hub path, leave en.)

- [ ] **Step 6: Run the builds and verify the markers are filled**

```bash
node scripts/build-model-pages.mjs
node scripts/build-articles.mjs
```

Then verify (Grep, not commit-yet): `index.html` has `<li>` items inside LATEST, `<a class="portal-card"` items inside POPULAR, and `<li>` article links inside ARTICLES; `en/index.html` likewise. Confirm Latest has no duplicate display names (no two "Qwen … Max").

- [ ] **Step 7: Verify build idempotency**

Re-run both builds; `git diff --stat` should show **no** change on the second run:

```bash
node scripts/build-model-pages.mjs && node scripts/build-articles.mjs
git diff --stat
```

Expected: empty diff (idempotent).

- [ ] **Step 8: Add card-link integrity assertions to `tests/e2e/portal.spec.mjs`**

Append:

```js
test.describe('portal injected cards', () => {
  test('a latest card links to a real model page', async ({ page }) => {
    await page.goto('/');
    const href = await page.locator('.seo-card', { hasText: '最新模型' })
      .locator('a.section-link').first().getAttribute('href');
    expect(href).toMatch(/^\/models\/.+\/$/);
    const resp = await page.goto(href);
    expect(resp.status()).toBe(200);
  });

  test('a popular card links to a real model page', async ({ page }) => {
    await page.goto('/');
    const href = await page.locator('.portal-card').first().getAttribute('href');
    expect(href).toMatch(/^\/models\/.+\/$/);
    const resp = await page.goto(href);
    expect(resp.status()).toBe(200);
  });
});
```

- [ ] **Step 9: Run e2e — expect green**

Run: `npm run test:e2e`
Expected: green, including the new card-link tests.

- [ ] **Step 10: Commit (stage explicitly — generated model pages will also be dirty)**

Only stage the portal pages + scripts + tests here; the regenerated `models/**` churn is committed in Task 5 where the nav change forces a full regen anyway. If `git status` shows `models/**` changed by Step 6, restore them so this commit stays focused:

```bash
git checkout -- models/ sitemap.xml 2>/dev/null || true
git -c core.autocrlf=false add index.html en/index.html scripts/build-model-pages.mjs scripts/build-articles.mjs tests/e2e/portal.spec.mjs
git -c core.autocrlf=false commit -m "feat(t3): inject latest (deduped) + popular panels into portals"
```

(Note: the `git checkout -- models/` here discards only deterministic build output that Task 5 regenerates and commits. Do not discard `index.html`/`en/index.html`.)

---

## Task 5: Repoint "对比工具 / Compare" nav → `/app/` sitewide

The tool nav link is `/` in three generator templates and ~19 hand-written pages. Repoint all to `/app/`, regenerate, and verify the audit.

**Files:**
- Modify generators: `scripts/build-articles.mjs`, `scripts/build-model-pages.mjs`, `scripts/build-compare-pages.mjs`
- Modify hand-written: `about.html`, `contact.html`, `privacy.html`, `zh/about/index.html`, `zh/contact/index.html`, `topics/{best-ai-models-for-coding,ai-models-for-writing,ai-models-with-web-access,cheapest-ai-api-models,long-context-ai-models,open-source-ai-models}/index.html`, `zh/topics/{same 6 slugs}/index.html`

- [ ] **Step 1: build-articles.mjs `navFor` — both languages**

In `scripts/build-articles.mjs` `navFor()` (lines ~13-20), change:
- zh template: `<a href="/">对比工具</a>` → `<a href="/app/">对比工具</a>`
- en template: `<a href="/">Compare</a>` → `<a href="/app/">Compare</a>`

- [ ] **Step 2: build-model-pages.mjs — nav (line ~266) and footer (line ~335)**

- Nav: `<a class="brand-link" href="/zh/">Check.AI</a><nav><a href="/">对比工具</a>` → `…<nav><a href="/app/">对比工具</a>`
- Footer: `<a href="/">打开对比工具</a>` → `<a href="/app/">打开对比工具</a>`

- [ ] **Step 3: build-compare-pages.mjs `navHtml` (lines ~323-325)**

- zh: `<a href="/">对比工具</a>` → `<a href="/app/">对比工具</a>`
- en: `<a href="/">Compare</a>` → `<a href="/app/">Compare</a>`

- [ ] **Step 4: Hand-written pages — repoint the first nav anchor**

In each hand-written file below, the first `<nav>` anchor is the tool link. Change `<a href="/">Compare</a>` (en pages) or `<a href="/">对比工具</a>` (zh pages) → the `/app/` form. Files:
- `about.html`, `contact.html`, `privacy.html` → `<a href="/app/">Compare</a>`
- `zh/about/index.html`, `zh/contact/index.html` → `<a href="/app/">对比工具</a>`
- `topics/<slug>/index.html` (6 files) → `<a href="/app/">Compare</a>`
- `zh/topics/<slug>/index.html` (6 files) → `<a href="/app/">对比工具</a>`

Use Edit per file targeting the exact `<a href="/">…</a>` first nav anchor (the strings are byte-identical within a language, so `replace_all:false` on the unique-in-file `<nav><a href="/">` prefix works).

- [ ] **Step 5: Regenerate all generated pages**

```bash
node scripts/build-articles.mjs
node scripts/build-model-pages.mjs
node scripts/build-compare-pages.mjs
```

- [ ] **Step 6: Run the full nav audit (all pages, not just static)**

Run: `node scripts/audit-nav.mjs`
Expected: `0 problem(s)`. This confirms every page's "对比工具/Compare" now points to `/app/` (which exists), brand-links resolve (incl. `/zh/` stub), the toggle/hreflang pairs match, and the nav signature is consistent within each language.

If the audit reports `zh nav drift`, it means some page still has `对比工具 -> /`; grep for `<a href="/">对比工具</a>` and `<a href="/">Compare</a>` across the repo (excluding `app/index.html`, which is the SPA and legitimately differs) and fix stragglers, then re-run Step 5-6.

- [ ] **Step 7: Run e2e — expect green**

Run: `npm run test:e2e`
Expected: green.

- [ ] **Step 8: Commit (this includes the large generated-page regen)**

```bash
git -c core.autocrlf=false add scripts/build-articles.mjs scripts/build-model-pages.mjs scripts/build-compare-pages.mjs about.html contact.html privacy.html zh/about/index.html zh/contact/index.html topics/ zh/topics/ zh/articles/ en/articles/ compare/ models/
git -c core.autocrlf=false commit -m "feat(t3): repoint tool nav link to /app/ sitewide + regenerate"
```

---

## Task 6: Sitemap + final validation

**Files:**
- Modify: `scripts/build-sitemap.mjs`

- [ ] **Step 1: Add `/app/` and drop `/zh/` in the sitemap builder**

In `scripts/build-sitemap.mjs`:
- Add `'app'` to `WALK_DIRS` (line ~21) so `app/index.html` emits `https://checkaimodels.com/app/`. (App has a single `index.html`, so the walk picks it up.)
- After the URL list is assembled and before write (around the dedupe/sort at line ~81), filter out the now-redirecting zh hub:

```js
const FILTERED = urls.filter((u) => u !== `${ORIGIN}/zh/`);
```

and write `FILTERED` instead of `urls`. (Confirm the variable name `urls` matches the file; adjust if it's named differently.)
- Optionally add an `/app/` branch to `priorityFor` (e.g. `0.8 weekly`); not required.

- [ ] **Step 2: Regenerate the sitemap and verify**

```bash
node scripts/build-sitemap.mjs
```

Grep `sitemap.xml`: confirm it contains `<loc>https://checkaimodels.com/app/</loc>` and `<loc>https://checkaimodels.com/</loc>`, and does **not** contain `<loc>https://checkaimodels.com/zh/</loc>`.

- [ ] **Step 3: Sitemap idempotency**

Re-run `node scripts/build-sitemap.mjs`; `git diff --stat sitemap.xml` should be empty on the second run.

- [ ] **Step 4: Full gate — audit + unit + e2e**

```bash
node scripts/audit-nav.mjs
npm run test:unit
npm run test:e2e
```

Expected: audit `0 problem(s)`; unit tests pass; all e2e specs pass.

- [ ] **Step 5: Commit**

```bash
git -c core.autocrlf=false add scripts/build-sitemap.mjs sitemap.xml
git -c core.autocrlf=false commit -m "feat(t3): sitemap adds /app/, drops redirecting /zh/"
```

- [ ] **Step 6: Open the PR**

```bash
git push -u origin t3-home-portal
gh pr create --title "T3: home portal at / + tool relocated to /app/" --body "$(cat <<'EOF'
## Summary
- `/` is now a portal homepage: hero search (→ `/app/`), Latest models, Popular models, Browse by company, articles, topics, about-data.
- SPA compare tool relocated `/` → `/app/` (assets unchanged, absolute paths). Old `/?compare=` / `/?q=` / `/?lang=` deep links client-redirect to `/app/`.
- `/zh/` 301-redirects to `/` (markerless stub kept on disk for link/audit resolution).
- "对比工具 / Compare" nav link repointed to `/app/` sitewide (generators + hand-written pages).
- Latest panel de-duplicated; new Popular panel from the flagship indexable set.
- Sitemap adds `/app/`, drops `/zh/`.

## Test plan
- [ ] `node scripts/audit-nav.mjs` → 0 problems
- [ ] `npm run test:unit` passes
- [ ] `npm run test:e2e` passes (portal routing, deep-link redirect, card link integrity)
- [ ] Build idempotency: re-running build scripts yields no diff
- [ ] POST-DEPLOY (Gate B): curl 200 on `/`, `/app/`, `/en/`; `/zh/` 301s to `/`; portal renders Latest/Popular; a Latest and a Popular card open a real model page

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Notes for the implementer

- **CRLF:** always `git -c core.autocrlf=false add/commit`. Generated dirs (`models/`, `compare/`, `sitemap.xml`) churn line endings otherwise.
- **Generated-file churn:** Tasks 4-5 regenerate `models/**` (~1787 pages) and `compare/**`. Stage those dirs explicitly (the commands do). Don't `git add -A`.
- **Don't touch `app/index.html`'s nav** to match the seo-header nav — it's the SPA, not an seo-page; `audit-nav.mjs` skips it (no `seo-header`). Leave it.
- **`indexableSlugs` scope:** if `INDEXABLE` is local to `main()` in `build-model-pages.mjs`, pass it into `injectPopular` rather than referencing a global.
- **POST-DEPLOY (Gate B) is mandatory** before declaring done: after Cloudflare deploys, curl `/`, `/app/`, `/en/` for 200, confirm `/zh/` 301→`/`, and eyeball the portal's Latest/Popular render live.
