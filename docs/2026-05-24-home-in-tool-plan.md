# Home-in-tool (T3 v2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make the SPA compare tool the homepage at `/` with its default center view = a home dashboard (latest/popular/topics/articles), a 「🏠 主页」 button in the left rail, and a single rail search — reversing the portal-at-`/` approach from #62.

**Architecture:** Revert #62 (restores tool-at-`/`, the `/zh/` `/en/` hubs, and `对比工具→/` nav across all generated pages with zero regeneration), then layer: a static `#home` dashboard section in `index.html` that the SPA shows by default and hides when a company is selected; `app.js` gains a view state + 主页 button; the deduped Latest/Popular injectors (from #62) are re-added targeting the home section; `/zh/` and `/app/` 301-redirect to `/`.

**Tech Stack:** Static HTML/CSS, vanilla JS SPA (`app.js`), Node ESM build scripts, Playwright e2e, `node --test`. Repo: `D:\Codex\check-ai` (run all commands there). Repo `core.autocrlf=true` — commit with PLAIN `git add`/`git commit` (NOT `-c core.autocrlf=false`); after staging, scan `git diff --cached --stat` for any whole-file rewrite (line-ending flip) and `git add --renormalize <file>` if found.

**Branch:** `t3-home-in-tool` (already created off main; the design spec is committed there). HEAD is currently `f7ea2d42`'s child (the spec commit). All work continues on this branch.

---

## File Structure

**Reverted (by Task 1, then NOT re-touched):** the `/` portal page, `/app/index.html`, the `对比工具→/app/` nav in generators + ~25 hand-written pages, `tests/e2e/portal.spec.mjs`, sitemap's `/app/`. The revert restores the pre-#62 SPA `index.html`, `/zh/` + `/en/` hubs, and `对比工具→/` nav.

**Created:**
- `_redirects` — `/zh/ → /` and `/app/ → /` (301).
- `tests/e2e/home-view.spec.mjs` — new e2e for the home view + 主页 button.

**Modified:**
- `index.html` (the SPA tool) — add the static `#home` dashboard section (hero + topics + `HOME_LATEST`/`HOME_POPULAR`/`HOME_ARTICLES` markers) inside the workspace; add `#homeButton` to the rail.
- `styles.css` — home dashboard card styles + the home-view show/hide rules.
- `app.js` — view state (`home`/`detail`), `setView`, `#homeButton` wiring, default-to-home init, switch-to-detail on company select.
- `scripts/build-model-pages.mjs` — re-add deduped `injectLatest` + `injectPopular` + `MAKER_EN`/`makerEn` (from #62), retargeted at `index.html`'s `HOME_LATEST`/`HOME_POPULAR` markers (and keep the `/en/` hub's `LATEST`/`POPULAR`).
- `scripts/build-articles.mjs` — fill `index.html`'s `HOME_ARTICLES` markers (in addition to the `/zh/` `/en/` hubs).
- `scripts/build-sitemap.mjs` — drop `/zh/` (now a redirect); keep `/` + `/en/`; no `/app/`.
- `zh/index.html` — replaced by a markerless redirect stub → `/` (mirrors #62's stub).
- `en/index.html` — language toggle 中文 + hreflang zh point at `/` (not `/zh/`).
- `.gitattributes` — re-add (`* text=auto eol=lf` + binary exemptions); removed by the revert.

---

## Task 1: Revert #62

Restore the tool-at-`/` baseline in one commit. This brings back the SPA `index.html`, the `/zh/` `/en/` hubs, `对比工具→/` nav on every generated + hand-written page (no regeneration needed), and removes `/app/`.

**Files:** (all handled by `git revert`)

- [ ] **Step 1: Revert the squash commit**

`#62` merged as squash commit `f7ea2d42`. Revert it:

```bash
git revert --no-edit f7ea2d42
```

Expected: a clean revert (f7ea2d42 is the main tip parent; nothing conflicts). If git reports conflicts, STOP and report — do not hand-resolve blindly.

- [ ] **Step 2: Sanity-check the restored state**

```bash
test -f index.html && grep -c 'id="platformList"' index.html   # expect 1 (SPA restored at /)
test -f app/index.html && echo "app still exists (BAD)" || echo "app/ gone (good)"
test -f zh/index.html && grep -c 'seo-header' zh/index.html      # expect 1 (zh hub restored)
grep -c '<a href="/">对比工具</a>' scripts/build-model-pages.mjs  # expect 1 (nav back to /)
```

Expected: `index.html` is the SPA (has `#platformList`); `app/index.html` gone; `zh/index.html` is the hub again; generators link `对比工具→/`.

- [ ] **Step 3: Run e2e to confirm the reverted baseline is green**

Run: `npm run test:e2e`
Expected: green. (The revert also restored the pre-#62 test suite — `portal.spec.mjs` is gone, `home.spec.mjs` is the pre-#62 version that tests the `/zh/` hub. All should pass against the restored state.)

- [ ] **Step 4: The revert commit is already made by `git revert --no-edit`.** Verify:

```bash
git log --oneline -1   # should read: Revert "T3: home portal at / + tool relocated to /app/ (#62)"
```

---

## Task 2: Add the static `#home` dashboard to `index.html` + styles

Add the home dashboard markup (shown by default, build-injected lists) and the 主页 button. No behavior yet — that's Task 3. The markers are empty here; Task 4 fills them.

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Add the `#homeButton` to the left rail**

In `index.html`, the rail has the brand block then the search box. Find the search box label:
```html
<label class="search-box"><span data-i18n="search">搜索</span><input id="platformSearch" type="search" placeholder="OpenAI, Claude, Gemini..."></label>
```
Immediately BEFORE that `<label class="search-box">`, insert the home button:
```html
<button id="homeButton" class="home-button active" type="button"><span class="home-ico" aria-hidden="true">🏠</span> <span data-i18n="home">主页</span></button>
```

- [ ] **Step 2: Add the `#home` dashboard section in the workspace**

In `index.html`, the workspace is `<main class="workspace">` containing `<header class="topbar">…</header>` then `<section class="platform-summary">…`. Insert the home section immediately AFTER the `</header>` (topbar close) and BEFORE `<section class="platform-summary">`:

```html
<section id="home" class="home-view-panel">
  <div class="home-hero">
    <p class="eyebrow" data-i18n="eyebrow">AI 平台模型数据库</p>
    <h2 class="home-title" data-i18n="homeTitle">挑 AI 模型，先来 Check 一下</h2>
    <p class="home-lead" data-i18n="homeLead">对比 60+ 平台、1700+ 模型的能力、价格与上下文。用左侧搜索，或选一家公司开始。</p>
  </div>
  <div class="home-dash">
    <section class="home-card">
      <h3><span class="home-dot"></span><span data-i18n="homeLatest">最新动态</span></h3>
      <!-- HOME_LATEST:start -->
      <div class="home-news"></div>
      <!-- HOME_LATEST:end -->
    </section>
    <section class="home-card">
      <h3><span class="home-dot"></span><span data-i18n="homePopular">热门模型</span></h3>
      <!-- HOME_POPULAR:start -->
      <div class="home-pop"></div>
      <!-- HOME_POPULAR:end -->
    </section>
  </div>
  <div class="home-row2">
    <section class="home-card">
      <h3><span class="home-dot"></span><span data-i18n="homeScenario">按场景选模型</span></h3>
      <div class="home-topics">
        <a class="home-topic" href="/zh/topics/best-ai-models-for-coding/">写代码</a>
        <a class="home-topic" href="/zh/topics/ai-models-for-writing/">长文写作</a>
        <a class="home-topic" href="/zh/topics/cheapest-ai-api-models/">便宜大碗</a>
        <a class="home-topic" href="/zh/topics/long-context-ai-models/">长上下文</a>
        <a class="home-topic" href="/zh/topics/open-source-ai-models/">本地部署</a>
        <a class="home-topic" href="/zh/topics/ai-models-with-web-access/">联网</a>
      </div>
    </section>
    <section class="home-card">
      <h3><span class="home-dot"></span><span data-i18n="homeArticles">深度文章</span></h3>
      <!-- HOME_ARTICLES:start -->
      <div class="home-arts"></div>
      <!-- HOME_ARTICLES:end -->
    </section>
  </div>
</section>
```

- [ ] **Step 3: Add the i18n keys used above**

In `app.js`, the `zh` object (lines 2-11) and `en` object (12-21) need new keys. Add to the `zh` literal: `home: '主页', homeTitle: '挑 AI 模型，先来 Check 一下', homeLead: '对比 60+ 平台、1700+ 模型的能力、价格与上下文。用左侧搜索，或选一家公司开始。', homeLatest: '最新动态', homePopular: '热门模型', homeScenario: '按场景选模型', homeArticles: '深度文章',`. Add to `en`: `home: 'Home', homeTitle: 'Pick an AI model — Check first', homeLead: 'Compare capabilities, price and context across 60+ platforms and 1700+ models. Search on the left, or pick a company.', homeLatest: 'Latest', homePopular: 'Popular', homeScenario: 'Pick by scenario', homeArticles: 'Articles',`. (Other languages fall back to en via the spread — acceptable.)

- [ ] **Step 4: Add home dashboard styles + show/hide rules to `styles.css`**

Append to `styles.css`:

```css
/* T3 home-in-tool: rail home button + dashboard */
.home-button{display:flex;align-items:center;gap:8px;width:100%;min-height:44px;border:1px solid var(--accent);background:var(--paper);color:#0c6f68;border-radius:8px;padding:0 13px;font-weight:800;font-size:16px;margin-bottom:12px;cursor:pointer}
.home-button.active{background:var(--accent);color:#fff;border-color:var(--accent)}
.home-view-panel{display:none}
body.home-view #home{display:block}
body.home-view .platform-summary,body.home-view .tabs-row,body.home-view .panel{display:none!important}
/* In home view, hide the topbar's company title/eyebrow (keep data-status + language switch). Scope to .topbar so #home's own .eyebrow is unaffected. */
body.home-view .topbar .eyebrow,body.home-view #platformTitle{display:none!important}
.home-hero{margin-bottom:22px;max-width:760px}
.home-title{margin:6px 0 10px;color:var(--ink);font-size:clamp(32px,4.5vw,52px);line-height:1.03}
.home-lead{margin:0;color:var(--muted);font-size:17px}
.home-dash{display:grid;grid-template-columns:1.3fr 1fr;gap:16px;margin-bottom:16px}
.home-row2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.home-card{border:1px solid var(--line);background:var(--paper);border-radius:12px;box-shadow:var(--shadow);padding:18px}
.home-card h3{margin:0 0 13px;color:var(--ink);font-size:17px;display:flex;align-items:center;gap:8px}
.home-dot{width:8px;height:8px;border-radius:50%;background:var(--accent)}
.home-news,.home-pop,.home-arts{display:grid;gap:8px}
.home-newsc{display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid var(--line);border-radius:9px;padding:11px 13px}
.home-newsc:hover{border-color:var(--accent);background:#fbfffd}
.home-newsc strong{color:var(--ink);font-size:14.5px}
.home-newsc .maker{display:block;color:var(--muted);font-size:12px;margin-top:2px}
.home-newsc .when{color:#fff;background:var(--accent);border-radius:999px;padding:2px 9px;font-size:11px;font-weight:700;white-space:nowrap}
.home-popi{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:8px;padding:9px 11px}
.home-popi:hover{border-color:var(--accent)}
.home-popi .rk{width:22px;height:22px;border-radius:6px;background:#eef5f3;color:var(--accent);font-weight:900;font-size:12px;display:grid;place-items:center}
.home-popi strong{color:var(--ink);font-weight:700;font-size:14px}
.home-popi .maker{color:var(--muted);font-size:12px;margin-left:auto}
.home-topics{display:flex;flex-wrap:wrap;gap:7px}
.home-topic{border:1px solid #8ec7bd;background:#e8f5f1;color:#0c6f68;border-radius:999px;padding:7px 13px;font-weight:700;font-size:13.5px}
.home-arti{display:flex;gap:8px;border:1px solid var(--line);border-radius:8px;padding:9px 11px;font-size:13.5px;color:var(--ink)}
.home-arti:hover{border-color:var(--accent)}
@media(max-width:980px){.home-dash,.home-row2{grid-template-columns:1fr}}
```

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css app.js
git commit -m "feat(t3v2): static #home dashboard section + rail 主页 button + styles"
```

(No test run here — behavior comes in Task 3. The `#home` is `display:none` until `body.home-view` is set, so the page is unchanged at runtime for now.)

---

## Task 3: `app.js` — home view default + 主页 button + switch-to-detail

**Files:**
- Modify: `app.js`
- Create: `tests/e2e/home-view.spec.mjs`

- [ ] **Step 1: Add a `setView` helper + view state**

In `app.js`, after the state declarations (the `let lang = initialLang(), activePlatform = 'openai', …` line ~117), add:

```js
let view = 'home';
function setView(v) {
  view = v;
  document.body.classList.toggle('home-view', v === 'home');
  const hb = document.getElementById('homeButton');
  if (hb) hb.classList.toggle('active', v === 'home');
}
```

- [ ] **Step 2: Switch to detail when a company is selected**

In the platform-card click handler inside `renderList()` (currently):
```js
  document.querySelectorAll('.platform-card').forEach((b) => b.onclick = () => {
    activePlatform = b.dataset.id;
    if (window.innerWidth <= 760) { … }
    render();
  });
```
add `setView('detail');` as the first line of the handler (before `activePlatform = …`). Do the same in the model-result click path: in `renderList()` the `.model-result` buttons call `openModel(...)` which opens the detail MODAL (not the workspace), so leave those. Only the `.platform-card` handler needs `setView('detail')`.

- [ ] **Step 3: Wire the 主页 button**

Near the other top-level event wiring (e.g. after the `$('globalCompareButton').onclick = …` line ~710), add:

```js
const homeBtn = document.getElementById('homeButton');
if (homeBtn) homeBtn.onclick = () => { setView('home'); try { history.replaceState(null, '', '/'); } catch (_) {} };
```

- [ ] **Step 4: Default to home on load**

The init tail currently is:
```js
const urlQ = new URLSearchParams(location.search).get('q');
if (urlQ) $('platformSearch').value = urlQ;
render(); loadLive(); loadModelSlugs();
```
Replace with:
```js
const urlQ = new URLSearchParams(location.search).get('q');
if (urlQ) $('platformSearch').value = urlQ;
setView('home');
render(); loadLive(); loadModelSlugs();
```
(`render()` still populates the hidden detail DOM; `body.home-view` keeps it hidden and shows `#home`. A `?q=` link pre-fills the rail search and filters the company list while the home view stays shown — the user clicks a result to go to detail. Acceptable for v1.)

- [ ] **Step 5: Write the e2e spec**

Create `tests/e2e/home-view.spec.mjs`:

```js
import { test, expect } from '@playwright/test';

test.describe('home view', () => {
  test('/ lands on the home view, no company auto-selected', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('h3', { hasText: '最新动态' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '热门模型' })).toBeVisible();
    await expect(page.locator('.platform-summary')).toBeHidden();
    await expect(page.locator('#homeButton')).toHaveClass(/active/);
  });

  test('selecting a company shows detail and hides home', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#platformList .platform-card');
    await page.locator('#platformList .platform-card').first().click();
    await expect(page.locator('#home')).toBeHidden();
    await expect(page.locator('.platform-summary')).toBeVisible();
  });

  test('主页 button returns to the home view', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#platformList .platform-card');
    await page.locator('#platformList .platform-card').first().click();
    await expect(page.locator('#home')).toBeHidden();
    await page.locator('#homeButton').click();
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('.platform-summary')).toBeHidden();
  });
});
```

- [ ] **Step 6: Update the reverted home.spec.mjs if it now conflicts**

The reverted `tests/e2e/home.spec.mjs` (pre-#62) tests the `/zh/` hub search → `/?q=` and then the SPA showing platform results. After this task, `/?q=…` lands on the HOME view (not auto-detail), so a test asserting a platform-detail/`#platformList` result from `/?q=` may need its expectation relaxed to "rail shows the filtered company" rather than a selected detail. Read `home.spec.mjs`; if a test navigates to `/?q=…` and asserts detail/`#platformTitle`, change it to assert the company appears in `#platformList` (the rail) instead. If the test only checks the `/zh/` hub has a search box + latest section, leave it.

- [ ] **Step 7: Run e2e — expect green**

Run: `npm run test:e2e`
Expected: all pass including `home-view.spec.mjs`.

- [ ] **Step 8: Commit**

```bash
git add app.js tests/e2e/home-view.spec.mjs tests/e2e/home.spec.mjs
git commit -m "feat(t3v2): SPA defaults to home view; 主页 button; company select shows detail"
```

---

## Task 4: Re-add Latest/Popular/Articles injection targeting the home section

Re-introduce #62's deduped `injectLatest` + `injectPopular` + `MAKER_EN` (the revert removed them), retargeted at `index.html`'s `HOME_*` markers, and keep filling the `/en/` hub.

**Files:**
- Modify: `scripts/build-model-pages.mjs`
- Modify: `scripts/build-articles.mjs`
- Modify: `tests/e2e/home-view.spec.mjs`

- [ ] **Step 1: Add `MAKER_EN` + `makerEn` to `build-model-pages.mjs`**

Near the existing `MAKER_ZH` map / `makerZh` function, add:
```js
const MAKER_EN = {
  openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google', deepseek: 'DeepSeek',
  xai: 'xAI', qwen: 'Alibaba (Qwen)', mistral: 'Mistral', moonshot: 'Moonshot AI',
  zhipu: 'Zhipu', minimax: 'MiniMax', meta: 'Meta',
};
function makerEn(name) { return MAKER_EN[brandOfName(name)] || ''; }
```

- [ ] **Step 2: Add a home-targeted `injectHomeLatest`**

The reverted script has the pre-#62 `injectLatest(file, lang)` that fills `LATEST:start/end` in the hubs with `<li>` items. Keep that for the hubs. Add a NEW function for the home section's card markup + dedup:

```js
function injectHomeLatest(file) {
  if (!existsSync(file)) return;
  let html = readFileSync(file, 'utf8');
  const START = '<!-- HOME_LATEST:start -->', END = '<!-- HOME_LATEST:end -->';
  if (!html.includes(START) || !html.includes(END)) return;
  const norm = (s) => s.toLowerCase().replace(/^[^:]+:\s*/, '').replace(/[^a-z0-9]/g, '');
  const seen = new Set();
  const latest = [];
  for (const x of [...groups.values()]
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
```

- [ ] **Step 3: Add a home-targeted `injectHomePopular`**

```js
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
```

(`groups`, `INDEXABLE`, `bestListing`, `escAttr`, `makerZh` are all module-level in the reverted script — confirm by reading. If `INDEXABLE` is local to `main()`, call these from inside `main()` after it's defined.)

- [ ] **Step 4: Call the home injectors in `main()`**

In `main()`, alongside the existing hub `injectLatest('zh/index.html','zh')` / `injectLatest('en/index.html','en')` calls, add:
```js
  injectHomeLatest('index.html');
  injectHomePopular('index.html');
```

- [ ] **Step 5: Fill `HOME_ARTICLES` in `index.html` from `build-articles.mjs`**

In `scripts/build-articles.mjs`, find the function that injects the article `<ul>` between `ARTICLES:start/end` (the reverted `injectHub('zh/index.html','zh')` etc). Add a call/branch that also fills `index.html`'s `HOME_ARTICLES:start/end` with article links styled as `.home-arti`. Add this helper and call it in `main()`:
```js
function injectHomeArticles(file) {
  if (!existsSync(file)) return;
  let html = readFileSync(file, 'utf8');
  const START = '<!-- HOME_ARTICLES:start -->', END = '<!-- HOME_ARTICLES:end -->';
  if (!html.includes(START) || !html.includes(END)) return;
  const items = publishedZh.map((a) => `<a class="home-arti" href="/zh/articles/${a.slug}/">${esc(a.zh.title)}</a>`).join('\n');
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n<div class="home-arts">\n${items}\n</div>\n${END}`);
  writeFileSync(file, html);
}
```
Adapt `publishedZh` / `esc` / `a.zh.title` to the script's actual variable names for the published-zh-articles list and its HTML-escape helper (read the file to confirm — it already builds the zh hub article list, so the same data is in scope). Call `injectHomeArticles('index.html');` in `main()`.

- [ ] **Step 6: Run the builds + verify markers filled**

```bash
node scripts/build-model-pages.mjs
node scripts/build-articles.mjs
```
Grep `index.html`: `HOME_LATEST` block has `.home-newsc` cards (≤6, deduped — no two near-identical names), `HOME_POPULAR` has `.home-popi` cards (≤6), `HOME_ARTICLES` has `.home-arti` links.

- [ ] **Step 7: Idempotency**

Re-run both builds; `git diff --stat index.html` must be empty on the second run.

- [ ] **Step 8: Add card-link assertions to `home-view.spec.mjs`**

Append:
```js
test('home latest + popular cards link to real model pages', async ({ page }) => {
  await page.goto('/');
  const latest = await page.locator('#home .home-newsc').first().getAttribute('href');
  expect(latest).toMatch(/^\/models\/.+\/$/);
  expect((await page.goto(latest)).status()).toBe(200);
  await page.goto('/');
  const pop = await page.locator('#home .home-popi').first().getAttribute('href');
  expect(pop).toMatch(/^\/models\/.+\/$/);
  expect((await page.goto(pop)).status()).toBe(200);
});
```

- [ ] **Step 9: Run e2e — expect green**

Run: `npm run test:e2e`

- [ ] **Step 10: Commit (stage index.html + scripts + test; the model-page regen is byte-identical to the reverted baseline, so restore it to keep the commit focused)**

```bash
git checkout -- models/ compare/ zh/compare/ sitemap.xml 2>/dev/null || true
git add index.html scripts/build-model-pages.mjs scripts/build-articles.mjs tests/e2e/home-view.spec.mjs en/index.html zh/index.html
git diff --cached --stat   # CRLF-flip scan; renormalize if needed
git commit -m "feat(t3v2): inject latest/popular/articles into the home dashboard"
```
(Note: `injectLatest`/`injectHub` also refill the `/zh/` `/en/` hubs — staging `en/index.html` + `zh/index.html` captures that; Task 5 converts `zh/index.html` to a redirect anyway. If the hub refill produced no change, those files just won't be in the diff.)

---

## Task 5: URL cleanup — `/zh/` + `/app/` → `/`, sitemap, en hub, .gitattributes

**Files:**
- Create: `_redirects`
- Modify: `zh/index.html` (→ redirect stub), `en/index.html`, `scripts/build-sitemap.mjs`, `.gitattributes`
- Create/Modify: `tests/e2e/home-view.spec.mjs` (redirect assertions optional — static server can't run `_redirects`)

- [ ] **Step 1: Create `_redirects`**

```
/zh/   /   301
/app/  /   301
/app/*  /   301
```

- [ ] **Step 2: Replace `zh/index.html` with a markerless redirect stub**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Check.AI</title>
<link rel="canonical" href="https://checkaimodels.com/">
<meta http-equiv="refresh" content="0; url=/">
<script>location.replace('/' + location.search);</script>
</head>
<body><p>正在跳转到 <a href="/">Check.AI 首页</a>…</p></body>
</html>
```
(No `seo-header` → the nav audit skips it; the file must still exist so generated pages' `brand-link="/zh/"` resolve.)

- [ ] **Step 3: Point the en hub's zh references at `/`**

In `en/index.html`: change `<link rel="alternate" hreflang="zh" href="https://checkaimodels.com/zh/">` → `…href="https://checkaimodels.com/"`; the nav toggle `<a href="/zh/">中文</a>` → `<a href="/">中文</a>`; the footer `<a href="/zh/">中文版</a>` → `<a href="/">中文版</a>`. (The en hub's "Compare"/hero-search → `/` are already correct post-revert.)

- [ ] **Step 4: Sitemap — drop `/zh/`**

In `scripts/build-sitemap.mjs`, after the URL list is assembled, filter out the bare zh hub:
```js
const finalUrls = urls.filter((u) => u !== `${ORIGIN}/zh/`);
```
and write `finalUrls`. (Confirm the variable name `urls` + `ORIGIN` in the file; `app/` is not in `WALK_DIRS` post-revert so nothing to remove there. `/` and `/en/` stay.)

- [ ] **Step 5: Re-add `.gitattributes`**

Create `.gitattributes`:
```
* text=auto eol=lf
*.png binary
*.jpg binary
*.ico binary
*.svg text eol=lf
```

- [ ] **Step 6: Regenerate sitemap + run audit**

```bash
node scripts/build-sitemap.mjs
node scripts/audit-nav.mjs
```
Verify `sitemap.xml` has `<loc>https://checkaimodels.com/</loc>` + `/en/`, NOT bare `/zh/` (but keeps `/zh/articles/…`). Audit → `0 problem(s)`.

- [ ] **Step 7: e2e**

Run: `npm run test:e2e` → green. (Optionally add an assertion that `_redirects` contains `/zh/` and `/app/` rules; the static test server doesn't process `_redirects`, so don't assert live 301 here — Gate B covers it.)

- [ ] **Step 8: Commit**

```bash
git add _redirects zh/index.html en/index.html scripts/build-sitemap.mjs sitemap.xml .gitattributes
git diff --cached --stat   # CRLF scan
git commit -m "feat(t3v2): /zh/ + /app/ 301 to /; sitemap drops /zh/; restore .gitattributes"
```

---

## Task 6: Full validation + PR

- [ ] **Step 1: Full gate**

```bash
node scripts/audit-nav.mjs
node --test tests/unit/*.mjs
npm run test:e2e
```
Expected: audit 0; unit pass; e2e all pass.

- [ ] **Step 2: Build idempotency sweep**

```bash
node scripts/build-model-pages.mjs && node scripts/build-articles.mjs && node scripts/build-compare-pages.mjs && node scripts/build-sitemap.mjs
git status --short
```
Expected: clean working tree (no drift). Investigate any modified file before proceeding.

- [ ] **Step 3: Push + PR**

```bash
git push -u origin t3-home-in-tool
gh pr create --title "T3 v2: home dashboard inside the tool at / (revert portal)" --body "$(cat <<'EOF'
## Summary
- Reverts #62 (portal-at-/). The SPA compare tool is the homepage at `/` again.
- `/` now lands on a **home dashboard** in the center workspace (Latest / Popular / Pick-by-scenario / Articles), styled as cards.
- Left rail gains a **「🏠 主页」** button; selecting a company shows its detail, 主页 returns to the dashboard. Single search (the rail's).
- Home content is statically injected (`HOME_LATEST`/`HOME_POPULAR`/`HOME_ARTICLES`) so `/` stays crawlable.
- `/zh/` and `/app/` 301 → `/`; `/en/` stays the English static home (its zh links point at `/`). Sitemap: `/` + `/en/`.

## Test plan
- [ ] `node scripts/audit-nav.mjs` → 0
- [ ] `node --test tests/unit/*.mjs` pass
- [ ] `npm run test:e2e` pass (home view default, company-select→detail, 主页 button, card links 200)
- [ ] Build idempotent (clean tree after rebuild)
- [ ] POST-DEPLOY (Gate B): `/` 200 shows the dashboard; selecting a company works; `/app/` + `/zh/` 301→`/`; `/en/` 200

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Notes for the implementer
- **Revert is the baseline** (Task 1). Do not try to forward-patch the URL/nav flips — the revert restores them for free.
- **CRLF/BOM**: repo is `autocrlf=true`; use plain `git add`. Never edit HTML with PowerShell in-place (it injects a BOM). Scan `git diff --cached --stat` for whole-file rewrites before each commit.
- **Don't mass-commit `models/`**: Task 4's build run regenerates model pages byte-identically to the reverted baseline; restore them so commits stay focused (the only real change is `index.html`'s home markers).
- **POST-DEPLOY (Gate B) is mandatory** before declaring done.
