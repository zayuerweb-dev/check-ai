# Model search + revive model pages — design spec

Date: 2026-05-22
Status: approved (brainstorming complete, pending writing-plans)

## Positioning frame (the lens this serves)

Check.AI's chosen positioning: **a Chinese-first AI selection + subscription-decision
site**, differentiated by 中文 + 实时 + covering both models/API and consumer plans.
Within that frame, the 1787 `/models/<slug>/` pages are meant to be **SEO long-tail +
lookup depth** that feeds the decision. This sub-project (T2) is the first of four
(T2 model search, T3 home, T4 plan-data freshness).

## Problem

- The site has 1787 `/models/<slug>/` pages (generated from the models.dev snapshot),
  but they are **orphans**: `noindex,follow`, excluded from `sitemap.xml`, and not
  linked or reachable from any UI. The model records exist; nobody can find them.
- The pages are **English, templated, boilerplate-heavy** ("Quick facts", generic
  "How to use this model") → thin content. They were deliberately `noindex`'d because
  1700+ near-identical pages on a low-authority domain trip Google's thin-content
  classifier and starve crawl budget.
- The SPA search box (`#platformSearch`) searches **platforms only** (it matches a
  platform by its models, but never surfaces a specific model as a result). There is
  no way to search for a model and open its record.

## Decisions (locked during brainstorming)

1. **Display = hybrid (C).** A model search result opens the existing in-SPA detail
   modal (radar + spec quick-view), which gains a **「查看完整页 →」** link to
   `/models/<slug>/` — shown only when that page exists.
2. **Indexing = curated subset (B).** ~80 high-value models are made rich, set to
   `index`, and added to the sitemap. The long tail stays `noindex` but remains
   searchable + clickable in-site.
3. **Search entry = unified box, grouped results.** One search box; results split into
   a 「平台」group and a 「模型」group.
4. **Rich page recipe (all four):** full 中文 localization + data-driven unique content
   + peer comparison table + 中文 verdict/use-cases.

## A. Architecture & file structure

```
app.js                         # add filteredModels() + render a 模型 results group;
                               #   model result → openModel() modal + 「查看完整页」link
data/model-pages.json          # NEW (optional): per-model editorial overrides
                               #   (hand-written zh verdict) for the top ~20 — YAGNI rest
scripts/build-model-pages.mjs  # REWRITE: zh output, data-driven unique sections, peer
                               #   table, verdict; emit index|noindex per subset rule
scripts/build-sitemap.mjs      # include ONLY indexable model pages (subset), still
                               #   exclude the long tail
scripts/lib/model-subset.mjs   # NEW: the indexable-subset rule (shared by build-model-
                               #   pages + build-sitemap so they agree)
models/<slug>/index.html       # GENERATED (committed) — now zh + richer for the subset
tests/e2e/model-search.spec.mjs# NEW: search → 模型 group → modal → 完整页 link
```

## B. Indexable-subset rule (`scripts/lib/model-subset.mjs`)

A pure function `isIndexable(model, allModels)` so `build-model-pages` and
`build-sitemap` never disagree. Rule (data-driven + rule-based, auto-maintained by the
daily sync — new flagships qualify automatically, stale ones drop out):

- Model belongs to a **major brand** (allowlist of platform ids: openai, anthropic,
  google, deepseek, xai, qwen/alibaba, mistral, meta/llama, plus a small extensible
  list), AND
- Ranks in the **top N by quality/arena within its brand** (e.g. top 6 per brand), OR
  was **released within the last ~9 months**.
- Hard cap at ~80 total (if over, keep highest quality + most recent).
- The set is recomputed on every build, so it tracks the synced data automatically.

`indexable` is **derived**, not stored — no manual list to maintain.

## C. Search integration (`app.js`)

- Add `filteredModels()` mirroring `filteredPlatforms()`: reuse the existing
  separator-insensitive `norm()`; match on `${name} ${id} ${platform} ${capabilities}`.
- `renderList()` renders two labelled groups inside `#platformList` (or a sibling): the
  existing platform cards under 「平台」and up to ~12 model rows under 「模型」.
- A model row click calls the existing `openModel(key)` (no new modal needed).
- `openModel()` modal (`#modelDetailContent`) gains a **「查看完整页 →」** link to
  `/models/<canonSlug(name)>/`, rendered only if that slug has a generated page
  (guard against models without a page, e.g. brand-new ones not yet on models.dev).
- Empty query → current behaviour (platforms only / full list).

## D. Rich page content model (`build-model-pages.mjs` rewrite)

Every generated page (subset and long tail) becomes **中文**. The subset additionally
gets the depth that makes it non-thin and indexable. Sections:

1. **中文 head + nav + footer** matching the site's canonical zh chrome (brand → /zh/,
   nav 对比工具·关于·联系; obeys audit-nav rules).
2. **数据驱动独特块** (computed from the full dataset, so every page's numbers differ):
   - price percentile ("同类中第 X 便宜 / 贵"), output/input ratio,
   - quality/arena rank within brand and overall, context-window percentile.
3. **同类对比表**: auto-select 3–5 peers (same brand or same price band), real numbers
   side by side, each row links into the compare tool (`/?compare=...`).
4. **中文点评 + 适合场景**: a template-generated verdict derived from capabilities +
   price tier by default; **optionally overridden** per model via `data/model-pages.json`
   for the top ~20 (hand-written). YAGNI: the rest use the generated verdict.
5. **FAQ** (zh), **related models** (existing prefix logic, zh labels).
6. `<meta name="robots">` = `index,follow` for the subset, `noindex,follow` otherwise.
   JSON-LD `inLanguage: zh-CN`.

## E. SEO / indexing mechanics + de-orphan

- **Sitemap**: `build-sitemap.mjs` currently excludes `models/` entirely. Change to
  include **only** `isIndexable` model pages; the long tail stays out.
- **robots meta**: per-page from the subset rule (D.6).
- **De-orphan internal links**: model pages become reachable from (a) the unified
  search 模型 group, (b) the in-SPA detail modal's 「查看完整页」link, (c) platform
  model rows (the existing `#modelRows` table can link the model name to its page).
  This gives the indexable subset real internal links instead of being orphans.

## F. Testing

- `node scripts/audit-nav.mjs --static` → 0 problems (model pages now carry the
  canonical zh nav, so they enter the audit's scope; ensure brand/nav/hreflang pass).
- New `tests/e2e/model-search.spec.mjs`: type a model name → 模型 group appears →
  click → modal opens → 「查看完整页」link points at `/models/<slug>/` and the page
  returns 200 (served by the static server). Regression-guard the grouped-results
  rendering.
- Re-run the full `npm run test:e2e` (CI gate) before SHIP.

## Out of scope (YAGNI)

- Hand-writing zh verdicts for more than ~20 models (generated default covers the rest).
- The new home page (T3) — model search is built as a capability here; T3 places it.
- Consumer-plan freshness (T4) — separate sub-project; model pages link to the existing
  plan display, not a new pipeline.
- Indexing the long tail or generating bespoke prose per model at scale.
