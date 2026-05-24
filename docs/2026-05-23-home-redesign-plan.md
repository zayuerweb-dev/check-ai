# Home Redesign (T3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static hubs (`/zh/`, `/en/`) into home pages with a hero search box (routes to the SPA tool) and an auto-generated "latest models" section, while the SPA at `/` stays the tool.

**Architecture:** The hub search is a plain HTML `<form action="/" method="get">` — submitting navigates to `/?q=<value>` natively (no JS on the static page). The SPA (`app.js`) reads `?q=` on load, prefills its search, and renders results. The "latest models" list is injected into both hubs by `build-model-pages.mjs` (which already loads the model data), between `<!-- LATEST:start/end -->` markers — mirroring the existing `ARTICLES` injection in `build-articles.mjs`.

**Tech Stack:** Static HTML + native form GET; vanilla JS (`app.js`); Node ESM build script; Playwright e2e.

---

## File Structure

| File | Responsibility |
|---|---|
| `app.js` | Read `?q=` on load → prefill `#platformSearch` → render |
| `zh/index.html`, `en/index.html` | Add hero `<form>` search + `<!-- LATEST:start/end -->` markers |
| `styles.css` | `.home-search` styles |
| `scripts/build-model-pages.mjs` | Inject the latest-models list into both hubs |
| `index.html` | Bump `app.js` cache-bust |
| `tests/e2e/home.spec.mjs` | `?q=` prefill + hub-search navigation |

---

## Task 1: SPA `?q=` prefill

**Files:**
- Modify: `app.js`
- Modify: `index.html` (cache-bust)
- Test: `tests/e2e/home.spec.mjs`

- [ ] **Step 1: Write the failing e2e test**

Create `tests/e2e/home.spec.mjs`:

```javascript
import { test, expect } from '@playwright/test';
import { ready } from './helpers.mjs';

test.describe('home search routing', () => {
  test('SPA prefills search from ?q= and shows results', async ({ page }) => {
    await page.goto('/?q=gpt-5.5');
    await page.waitForSelector('#platformList .platform-card');
    await expect(page.locator('#platformSearch')).toHaveValue('gpt-5.5');
    await expect(page.locator('#platformList .platform-card strong').first()).toHaveText('OpenAI');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test home.spec.mjs`
Expected: FAIL — `#platformSearch` value is empty (no `?q=` handling yet).

- [ ] **Step 3: Add `?q=` prefill in app.js**

In `app.js`, the last line is:
```javascript
render(); loadLive(); loadModelSlugs();
```
Replace it with:
```javascript
const urlQ = new URLSearchParams(location.search).get('q');
if (urlQ) $('platformSearch').value = urlQ;
render(); loadLive(); loadModelSlugs();
```
(`render()` calls `renderList()`, which reads `#platformSearch.value` — so prefilling before the first render surfaces results immediately, and `loadLive()`'s later `render()` refreshes with full data.)

- [ ] **Step 4: Bump the cache-bust in index.html**

In `index.html`, find the current `app.js?v=...` version and increment it (e.g. `?v=20260522-3` → `?v=20260523-1`). Read the current value first; bump by one. Do the same for `styles.css?v=...` (it changes in Task 2).

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx playwright test home.spec.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app.js index.html tests/e2e/home.spec.mjs
git -c core.autocrlf=false commit -m "feat(home): SPA reads ?q= to prefill search + show results"
```

---

## Task 2: Hub hero search + LATEST markers

**Files:**
- Modify: `zh/index.html`, `en/index.html`
- Modify: `styles.css`

- [ ] **Step 1: Add the hero search form to `zh/index.html`**

In `zh/index.html`, right after the `<p class="seo-lead">…</p>` line (before the first `<section class="seo-card">`), insert:

```html
<form class="home-search" action="/" method="get" role="search">
<input type="search" name="q" placeholder="搜公司或模型…" aria-label="搜索 AI 公司或模型">
<button type="submit">搜索</button>
</form>
```

- [ ] **Step 2: Add the LATEST section to `zh/index.html`**

Immediately after the form (still before the first existing `<section>`), insert:

```html
<section class="seo-card">
<h2>最新模型</h2>
<!-- LATEST:start -->
<!-- LATEST:end -->
</section>
```

- [ ] **Step 3: Add the hero search form to `en/index.html`**

In `en/index.html`, after its `<p class="seo-lead">…</p>` line, insert (note the hidden `lang=en` so the SPA opens in English):

```html
<form class="home-search" action="/" method="get" role="search">
<input type="hidden" name="lang" value="en">
<input type="search" name="q" placeholder="Search a company or model…" aria-label="Search AI companies or models">
<button type="submit">Search</button>
</form>
```

- [ ] **Step 4: Add the LATEST section to `en/index.html`**

After the en form, insert:

```html
<section class="seo-card">
<h2>Latest models</h2>
<!-- LATEST:start -->
<!-- LATEST:end -->
</section>
```

- [ ] **Step 5: Add `.home-search` styles to `styles.css`**

Append to `styles.css` (near the other `.seo-*` rules):

```css
.home-search{display:flex;gap:8px;margin:18px 0 28px;max-width:560px}
.home-search input[type=search]{flex:1;min-height:46px;border:1px solid var(--line);border-radius:var(--radius);background:var(--paper);padding:0 14px;font-size:16px;font-family:var(--sans);color:var(--ink)}
.home-search input::placeholder{color:var(--muted)}
.home-search button{min-height:46px;padding:0 20px;border:0;border-radius:var(--radius);background:var(--accent-2);color:var(--on-accent);font-weight:700;font-family:var(--sans);cursor:pointer}
.home-search button:hover{background:var(--ink)}
```

- [ ] **Step 6: Verify the form routes correctly (manual reason-through, no build yet)**

The form is `action="/" method="get"` with `name="q"`, so submitting navigates to `/?q=<value>` (en adds `&lang=en` from the hidden input). This is native HTML — no JS. The SPA handles `?q=` (Task 1).

- [ ] **Step 7: Commit**

```bash
git add zh/index.html en/index.html styles.css
git -c core.autocrlf=false commit -m "feat(home): hero search form + latest-models section markers on both hubs"
```

---

## Task 3: Inject latest-models into the hubs

**Files:**
- Modify: `scripts/build-model-pages.mjs`

- [ ] **Step 1: Add the `injectLatest` function + calls**

In `scripts/build-model-pages.mjs`, inside `main()`, AFTER the manifest write (the `writeFileSync('data/model-slugs.json', ...)` block) and its `console.log`, add:

```javascript
  injectLatest('zh/index.html', 'zh');
  injectLatest('en/index.html', 'en');
```

Then define the function near the other top-level functions (e.g. after `relatedSlugs`):

```javascript
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
```

(`groups`, `bestListing`, `escAttr`, `readFileSync`, `writeFileSync`, `existsSync` are all already available in this file.)

- [ ] **Step 2: Build and verify both hubs got a non-empty list**

Run:
```bash
node scripts/build-model-pages.mjs
node -e "const fs=require('fs');for(const f of ['zh/index.html','en/index.html']){const h=fs.readFileSync(f,'utf8');const m=h.match(/LATEST:start[\s\S]*?LATEST:end/)[0];const n=(m.match(/\/models\//g)||[]).length;console.log(f,'latest items:',n);if(n<1)throw new Error('empty latest in '+f);}"
```
Expected: each hub shows ~8 latest items, all linking to `/models/<slug>/`.

- [ ] **Step 3: Confirm the linked model pages exist (no dead links)**

Run:
```bash
node -e "const fs=require('fs');const h=fs.readFileSync('zh/index.html','utf8');const m=h.match(/LATEST:start[\s\S]*?LATEST:end/)[0];const slugs=[...m.matchAll(/\/models\/([a-z0-9-]+)\//g)].map(x=>x[1]);for(const s of slugs)if(!fs.existsSync('models/'+s+'/index.html'))throw new Error('dead link: '+s);console.log('all '+slugs.length+' latest links resolve to real pages');"
```
Expected: all links resolve.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-model-pages.mjs zh/index.html en/index.html
git -c core.autocrlf=false commit -m "feat(home): inject auto latest-models list into both hubs"
```

---

## Task 4: Validation + PR

**Files:** none created — validates Tasks 1–3.

- [ ] **Step 1: Add the hub-search navigation e2e test**

Append to `tests/e2e/home.spec.mjs` (inside the existing `test.describe`):

```javascript
  test('zh hub search form routes to the SPA with the query', async ({ page }) => {
    await page.goto('/zh/');
    await page.fill('.home-search input[name="q"]', 'claude');
    await page.locator('.home-search button[type="submit"]').click();
    await page.waitForURL(/\/\?q=claude/);
    await page.waitForSelector('#platformList .platform-card');
    await expect(
      page.locator('#platformList .platform-card strong', { hasText: 'Anthropic Claude' }).first(),
    ).toBeVisible();
  });

  test('zh hub shows a latest-models section', async ({ page }) => {
    await page.goto('/zh/');
    const latest = page.locator('h2', { hasText: '最新模型' });
    await expect(latest).toBeVisible();
  });
```

- [ ] **Step 2: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: all pass (the existing 18 + the new home tests).

- [ ] **Step 3: Nav audit**

Run: `node scripts/audit-nav.mjs --static`
Expected: `0 problem(s)`. The hubs gained a form + a section but keep the canonical nav/footer, so it should pass.

- [ ] **Step 4: Idempotency**

Run:
```bash
node scripts/build-model-pages.mjs
git status --short zh/index.html en/index.html
```
Expected: empty (re-running the build produces no diff).

- [ ] **Step 5: Open the PR**

```bash
git push -u origin home-redesign
gh pr create --title "Home redesign (T3): hub becomes home with search + latest models" --body "Implements docs/2026-05-23-home-redesign-design.md. Hubs (/zh/, /en/) gain a hero search form (native GET → /?q=, SPA prefills + shows results) and an auto-generated latest-models section (newest 8 by release date, injected by build-model-pages, links to model pages). SPA stays the tool. unit+e2e+audit green; build idempotent."
```

---

## Self-review notes (addressed)

- **Spec coverage:** hub-as-home (Tasks 2–3), search→SPA via `?q=` (Tasks 1–2), auto latest-models (Task 3), SPA `?q=` support (Task 1), testing (Tasks 1,4). All spec sections map to a task.
- **No placeholders:** every step has concrete code/commands. Cache-bust step says "read current, bump by one" (the exact current value isn't hard-coded because it drifts; the action is explicit).
- **Consistency:** `?q=` param name, `.home-search` class, `<!-- LATEST:start/end -->` markers, and `injectLatest(file, lang)` are used identically across tasks. The en hub's hidden `lang=en` matches the SPA's existing `?lang=` handling.
- **v1 limitation (per spec):** the en hub's latest-models link to zh `/models/<slug>/` pages — accepted; no task builds en model pages.
