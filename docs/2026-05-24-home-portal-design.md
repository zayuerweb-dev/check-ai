# Home portal (T3, redesign) — design spec

Date: 2026-05-24
Status: approved (brainstorming complete, pending writing-plans)

> Supersedes `docs/2026-05-23-home-redesign-design.md`. That version upgraded the
> `/zh/` `/en/` hubs in place; the user rejected it ("这和我想得不一样"). The real
> intent: `/` itself becomes a **portal homepage** with panels (news / model /
> company / articles) that route into the compare tool, model pages, and articles.

## Positioning frame

T3 of the 4-thread roadmap (T1 positioning ✅, T2 model search + model pages ✅,
T3 home, T4 plan-data freshness). Today `/` IS the SPA compare tool, and the only
real "home" surfaces are the thin static hubs `/zh/` `/en/`. This turns `/` into a
proper portal and gives the tool a dedicated home.

## Locked decisions

1. **Tool placement = option A.** The portal takes `/`. The SPA compare tool moves
   to `/app/`, with a `301` from any old deep entry. The portal is the front door;
   the tool is the destination of "开始对比 / Start comparing".
2. **Panels route, they don't duplicate.** Each panel is a thin index that links
   into existing surfaces (model pages, the tool, articles). No new data model, no
   new search logic on the portal — search routes to the tool via `/app/?q=`.
3. **"Latest" = auto newest models.** The 最新动态 / Latest panel is generated from
   `data/models.json` by release date. Zero manual news maintenance.
4. **Bilingual via the existing hub pattern.** The portal exists as `/zh/` (also the
   canonical `/`) and `/en/`, mirroring the current hub bilingual + hreflang setup.

## A. Portal layout (`/` = zh, `/en/` = en)

Top to bottom:

1. **Top nav** — brand · `开始对比 → /app/` · 文章 · 关于数据 · 中文/EN toggle.
   Reuses the canonical nav/footer so `audit-nav.mjs` stays green.
2. **Hero + search** — tagline + one search box. Enter → `/app/?q=<encoded>` (en
   appends `&lang=en`). This is the primary entry into the tool.
3. **📰 最新动态 / Latest** — newest ~6 models by `release_date` that have a
   generated page. Card = name · maker (via `makerZh`) · release date · one-line.
   Each links to `/models/<slug>/`. Injected between `<!-- LATEST:start/end -->`.
   De-duplicated (see C) — the raw feed has near-dup names (e.g. several
   "Qwen3.7 Max" rows).
4. **🧠 热门模型 / Popular models** — ~8 of the flagship indexable set
   (`model-subset.mjs`). Grid; each → `/models/<slug>/`. Injected between
   `<!-- POPULAR:start/end -->`.
5. **🏢 按公司浏览 / By company** — the major brands (`MAJOR_BRANDS`). Each →
   `/app/?q=<brand>` so the tool opens filtered to that company (no standalone
   company pages exist; the tool is the company aggregator). Static markup; brand
   list small and stable, so hand-authored in the template is acceptable.
6. **📄 深度对比 / Deep-dives** — existing article list, unchanged injection
   (`<!-- ARTICLES:start/end -->`).
7. **🎯 按场景选 / Pick by scenario** — existing topic links, unchanged.
8. **📊 关于数据 / About the data** — existing, unchanged.

## B. Tool relocation `/` → `/app/`

- Move the SPA (`index.html` + it already loads `app.js`, `styles.css`,
  `data/models-dev.json`) to `/app/index.html`. Assets stay at root (absolute
  paths), so only the HTML doc moves.
- `app.js` already reads `?q=`, `?lang=`, `?compare=` from the URL — no JS change
  for the search-routing contract; it just lives at `/app/` now.
- **301 redirects:** old links/bookmarks to `/` and any `/?compare=…` deep links
  must reach the tool. Cloudflare Pages `_redirects`: map the *tool's* old deep
  forms to `/app/`. The bare `/` now legitimately serves the portal (not a
  redirect). Concretely: `/?compare=:rest  /app/?compare=:rest  301` style rules
  for the query-bearing tool URLs; bare `/` is the portal.
- Update internal references that point at the tool-at-root (nav "开始对比",
  hero search target, company-panel links) to `/app/`.
- The relocated tool's `<link rel="canonical">`, `og:url`, and `application/ld+json`
  `url` (currently `https://checkaimodels.com/`) update to `…/app/`; the portal at
  `/` gets its own canonical. Verified: no existing `_redirects` file — create one.
- `sitemap.xml`: add `/app/`; `/` stays (now the portal). Re-run sitemap build.

## C. Build injection (extend `scripts/build-model-pages.mjs`)

That script already loads `data/models.json`, builds model groups, and computes the
generated-slug set; it already has `injectLatest()` from the prior attempt. Extend
it to inject into the portal pages:

- **Latest:** newest ~6 by `release_date` whose slug is in the generated set.
  **De-dup** by canonical slug AND by normalized display name (collapse
  "Qwen 3.7 Max" / "Qwen3.7 Max" → one) so the panel shows distinct models.
- **Popular:** ~8 from `indexableSlugs()` (the flagship set), stable order.
- zh page → zh labels; en page → en labels (heading + "released/新发布" wording).
- Both panels link to `/models/<slug>/` (zh model pages; en v1 limitation below).
- Idempotent: re-running the build produces no diff.

## D. v1 limitations (accepted)

- **Model pages are Chinese** (from T2). The en portal's Latest/Popular link to zh
  model pages — minor language jump for en visitors. Building en model pages is out
  of scope; accepted for v1.
- **No manual news.** Latest = auto newest models only.
- **No standalone company pages.** Company panel routes into the tool.

## E. Testing

- `node scripts/audit-nav.mjs --static` → 0 problems (portal keeps canonical
  nav/footer; gains panels).
- Build idempotency: re-run build → no diff.
- e2e (Playwright), new/updated specs:
  - On `/`, the hero search + Enter navigates to `/app/?q=<query>`, and the tool
    shows results for that query.
  - The tool loads and works at `/app/` (smoke: search renders, a compare opens).
  - A `/?compare=…` deep link 301s to `/app/?compare=…` (or, if `_redirects` can't
    be exercised by the static test server, assert the `_redirects` rule exists).
  - A Latest card and a Popular card link to a real `/models/<slug>/` (slug in the
    generated set → 200 on the static server).
  - A company chip links to `/app/?q=<brand>`.
- Re-run full `npm run test:e2e` before SHIP.

## F. Out of scope (YAGNI)

- Inline live search on the portal (routes to the tool instead).
- English model pages.
- Manual news blurbs / editorial curation of Latest.
- Reworking the tool's internal layout (only its URL changes).
- Standalone per-company pages.
