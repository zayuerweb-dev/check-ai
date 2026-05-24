# Home redesign (T3) — design spec

Date: 2026-05-23
Status: approved (brainstorming complete, pending writing-plans)

## Positioning frame

T3 of the original 4-thread decomposition (T1 positioning ✅, T2 model search + model
pages ✅, T3 home, T4 plan-data freshness). The site's front doors are currently split:
the SPA tool at `/` has the interactive company + model search (T2), while the static
hubs `/zh/` and `/en/` have article + topic links but no search and no "latest" signal.
This sub-project turns the hubs into proper home pages.

## Problem

- The interactive search (company + model) lives only in the SPA at `/`.
- The static hubs (`/zh/`, `/en/`) have `按场景选模型` (topics), `深度对比` (articles),
  `关于数据` — but no search entry and no freshness signal.
- There is no "latest models / news" surface anywhere.

## Decisions (locked during brainstorming)

1. **The hubs become the home.** Upgrade `/zh/` and `/en/` (static, SEO-strong, already
   hold articles + topics). The SPA stays at `/` as the deep "tool".
2. **Search box routes to the SPA.** A hero search box; on Enter it navigates to
   `/?q=<query>` (and `?lang` for the en hub). The SPA reads `?q=`, prefills its search,
   and shows results. Reuses T2's search; no duplicate search logic on the static page.
3. **"Latest" = auto newest models.** A `最新模型` / `Latest models` section, generated
   from `data/models.json` by release date (newest ~8 that have a model page). Zero
   manual maintenance; refreshes with the daily sync. No manual news blurbs.

## A. Home layout (both `/zh/` and `/en/`)

Top to bottom:
1. **Hero + search** (new): tagline + a search box (placeholder zh `搜公司或模型…` /
   en `Search a company or model…`). Enter → `/?q=<encoded query>` (en hub appends
   `&lang=en`).
2. **最新模型 / Latest models** (new): newest ~8 models by release date that have a
   generated page, each linking to `/models/<slug>/`. Injected between
   `<!-- LATEST:start -->` / `<!-- LATEST:end -->` markers.
3. **深度对比 / Editorial deep-dives** (existing article list — unchanged).
4. **按场景选模型 / Pick by scenario** (existing topic links — unchanged).
5. **关于数据 / About the data** (existing — unchanged).

## B. SPA `?q=` support (`app.js`)

On load, read `?q=` from the URL (alongside the existing `?lang=` / `?compare=`). If
present, set `#platformSearch.value` to it and run `renderList()` so platform + model
results show immediately. One small addition near the existing URL-param handling; no
new UI.

## C. Latest-models injection (build)

A build step (extend `scripts/build-model-pages.mjs`, which already loads
`data/models.json` and computes the model groups + the slug manifest) injects the
`最新模型` list into both hubs between the `LATEST` markers — mirroring how
`build-articles.mjs` injects the article list between `ARTICLES` markers.

- Source: the `groups` already built; pick the newest ~8 by `release_date` whose slug is
  in the generated set (so every link resolves to a real page).
- zh hub: zh labels. en hub: en labels (the section heading + "released" wording).
- Both link to `/models/<slug>/`.

## D. v1 limitation (accepted)

Model pages are Chinese (from T2). The en hub's `Latest models` links to those zh model
pages — a minor language jump for en visitors. Building 1787 en model pages is out of
scope. Accepted for v1; revisit later (either en model pages, or point the en hub's
latest-models at the SPA).

## E. Testing

- `node scripts/audit-nav.mjs --static` → 0 problems (the hubs gain a search box + a
  section but keep the canonical nav/footer).
- New e2e: on `/zh/`, typing in the hero search + Enter navigates to `/?q=...` and the
  SPA shows results for that query.
- Re-run `npm run test:e2e` (full suite) before SHIP.
- Build idempotency: re-running the build produces no diff.

## Out of scope (YAGNI)

- **Inline live search on the static hub** (the box routes to the SPA instead).
- **English model pages** (the en hub's latest-models accepts the zh-page link for v1).
- **Manual news blurbs** (latest = auto newest models only).
- **Reworking the SPA's layout** (it stays the tool; only `?q=` is added).
