# Home-in-tool (T3 redesign v2) — design spec

Date: 2026-05-24
Status: approved (brainstorming complete, pending writing-plans)

> Supersedes `docs/2026-05-24-home-portal-design.md` and reverses the just-merged
> [#62](https://github.com/zayuerweb-dev/check-ai/pull/62). That PR made `/` a static
> portal and moved the SPA tool to `/app/`. The user rejected that ("还是希望对比工具
> 为主页" + "很难看"). New intent: **the compare tool stays the homepage at `/`**, and
> its default center view IS the home dashboard. Selecting a company swaps the center to
> that company's detail; a "主页" button returns to the dashboard.

## Positioning frame

T3 of the 4-thread roadmap (T1 ✅, T2 ✅, T3 home, T4 plan-data freshness). The goal is
unchanged — give the site a real "home" with latest/popular/articles surfaces and a
clear entry — but the form changes: instead of a separate static portal page, the home
lives **inside the tool** as its landing view. One app, one URL, one search.

## Locked decisions (from brainstorming + visual mockups)

1. **`/` is the SPA tool.** Its default landing view (no company selected, no
   `?compare=`) is the **home dashboard** rendered in the center workspace.
2. **Left rail = the single search + navigation.** Top of the rail gets a **「🏠 主页」**
   button; below it the existing search box, 比较 button, filters, and company list.
   There is **exactly one search** — the rail's persistent `#platformSearch`. The home
   hero has **no** search box (removing the earlier mockup's duplicate).
3. **Center workspace has three states:** (a) **home** (default), (b) **company detail**
   (today's behavior, shown when a company is selected), (c) compare modal (unchanged).
   The 主页 button returns to (a); selecting a company switches to (b).
4. **Home content is statically injected for SEO**, not JS-only. A static `#home`
   section in `index.html` holds the dashboard markup with real crawlable links; the SPA
   shows/hides it. Build injects the dynamic lists (latest/popular) between markers.
5. **Articles stay as a dashboard link block** → existing static article pages
   (`/zh/articles/<slug>/`). No in-app article reading (kept out of scope per user).
6. **`/en/` stays the English static home**; `/zh/` and `/app/` 301-redirect to `/`.

## A. Home dashboard (center workspace default view)

A card-based dashboard styled to match the tool's chrome (cream/teal palette, `--shadow`
cards) — the visual upgrade the user asked for. Top to bottom:

1. **Hero** — eyebrow (`AI 平台选型数据库 · 2026 年 5 月更新`) + headline
   (`挑 AI 模型，先来 Check 一下`) + one-line subtitle. **No search box** (use the rail).
2. **最新动态 / Latest** — newest ~6 models by release date (deduped), each → its model
   page. Card shows name · maker · "N-N 新发布" badge. Injected between
   `<!-- HOME_LATEST:start/end -->`.
3. **热门模型 / Popular** — ~5–8 from the flagship indexable set, ranked list, each → its
   model page. Injected between `<!-- HOME_POPULAR:start/end -->`.
4. **按场景选模型 / Pick by scenario** — the 6 topic chips → `/zh/topics/<slug>/`.
5. **深度文章 / Articles** — the article list → `/zh/articles/<slug>/`. Injected between
   `<!-- HOME_ARTICLES:start/end -->` (reusing the existing article injector).

(Company browsing is the left rail's company list, so the dashboard has no separate
company panel.)

## B. Left rail

Existing rail (brand, `#platformSearch`, 比较 button, quick/function filters, company
list) gains, at the very top below the brand, a **「🏠 主页」 button** (`#homeButton`).
- Active/highlighted when the home view is showing.
- Click → show the home view, clear the selected-company state, update the URL to `/`
  (no `?compare`), and visually mark itself active.

## C. SPA behavior (`app.js`)

- **Default view = home.** On load with no `?compare=` and no explicit company in the
  URL, show `#home` and DO NOT auto-select a default platform (today it auto-selects the
  first platform e.g. OpenAI). The platform-detail DOM (`.platform-summary`, tabs,
  panels) is hidden while home is showing.
- **Selecting a company** (clicking a `.platform-card`, or a search result, or the
  company filter) hides `#home` and shows the platform-detail view as today.
- **「🏠 主页」** hides the detail view, shows `#home`, deselects, sets URL to `/`.
- **Search** stays the rail's existing behavior (filters the company list + model
  results); when the user acts on a result the view switches to detail. Typing in search
  does not need to leave home until a result is chosen (acceptable either way; keep the
  existing filter behavior).
- **`?compare=` deep links** still open the compare modal as today.
- **Language switch** (`#languageSelect`): the home view's static labels
  (最新动态 / 热门模型 / 按场景 / 深度文章, hero copy) translate via the existing i18n map;
  model names are language-neutral; topic/article links point at the zh pages in the
  zh-injected `/` (en visitors get `/en/` as their home — see E).

## D. Build injection (`scripts/build-model-pages.mjs`)

Reuse the deduped `injectLatest` and `injectPopular` from #62, but retarget them at the
tool's home section in `index.html` (markers `HOME_LATEST`, `HOME_POPULAR`) instead of
the removed portal page. The article injector (`build-articles.mjs`) fills
`HOME_ARTICLES` in `index.html`. The `/en/` hub keeps its own `LATEST`/`POPULAR`/
`ARTICLES` injection as today. All injections idempotent.

## E. URL architecture (reversing #62)

- **`/`** = the SPA tool with the home view. Canonical `/`. Statically injected home
  content makes it crawlable (latest/popular/article/topic links in the initial HTML).
- **`/app/`** → 301 → `/` (it was the tool for a few hours post-#62; redirect old links).
- **`/zh/`** → 301 → `/` (the zh home is the tool itself).
- **`/en/`** = kept as the **English static home/hub** (the en portal from #62), but its
  tool links (`Compare`, hero search, company chips, CTAs) point at **`/`** (not `/app/`).
  This is the English SEO home; the bilingual jump for en users to the (zh-labelled)
  in-tool home is avoided by keeping `/en/` static.
- **Sitemap**: `/` and `/en/`; drop `/app/` and `/zh/`.
- **Sitewide nav**: the "对比工具 / Compare" link on all generated + hand-written pages
  points back to **`/`** (reverting #62's repoint to `/app/`).

## F. Implementation shape (for the plan)

Cleanest path: **revert #62** to restore tool-at-`/` + the `/zh/` `/en/` hubs and the
`对比工具 → /` nav, THEN layer the new work on top:
1. Add the static `#home` dashboard section + markers to `index.html`; restyle (cards).
2. `app.js`: default-to-home, `#homeButton` handler, hide/show logic, no auto-select.
3. Re-apply the deduped `injectLatest`/`injectPopular` (from #62) targeting the home
   markers; wire `build-articles` to fill `HOME_ARTICLES`.
4. `/app/` 301 (the only URL artifact to keep from #62, inverted) + `/zh/` 301; sitemap.
5. `/en/` hub: keep its panels; ensure its tool links point to `/`.

(The plan decides revert-vs-forward concretely; revert is the assumed baseline.)

## G. Testing

- e2e (Playwright):
  - `/` loads → home view visible (`#home` shown, `最新动态` + `热门模型` present), and
    NO platform auto-selected (platform-detail hidden).
  - Clicking a company card → detail shows, `#home` hidden.
  - 「🏠 主页」 → home shown again, URL is `/`.
  - A latest card and a popular card link to a real `/models/<slug>/` (200).
  - `?compare=…` still opens the compare modal.
  - `/app/` 301→`/`; `/zh/` 301→`/`.
  - Rail search still filters the company list (existing test).
- `node scripts/audit-nav.mjs` → 0 problems.
- `node --test tests/unit/*.mjs` → pass.
- Build idempotency: re-running build scripts yields no diff.
- POST-DEPLOY (Gate B): curl 200 on `/`, `/en/`; `/app/` + `/zh/` 301→`/`; `/` renders
  the home dashboard with latest/popular; a card opens a real model page.

## H. Out of scope (YAGNI)

- In-app article reading (articles link to existing static pages).
- English in-tool home dashboard (en home stays the static `/en/` hub for v1).
- A separate static portal page (the home lives in the tool).
- Reworking the company-detail / compare views (only the default landing + 主页 button +
  home dashboard are new).
