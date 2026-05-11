# Check.AI — Handoff & Local Setup

This doc is for the maintainer (`@zayuerweb-dev`) to keep working on the project locally without me.

---

## 1. What this project is

**checkaimodels.com** — a comparison database for AI platforms, models, and API prices. Bilingual (English / 中文). Pure static HTML/CSS/JS. Hosted on Cloudflare Pages from the `main` branch of this repo.

**Strategic position:** "Editorial / Industrial" comparison site, neutral, dated, sourced. Targeting Chinese AI buyers as the primary moat (~no real competition in zh).

---

## 2. Current state (as of 2026-05-11)

| Layer | Count | Notes |
|---|---|---|
| Sitemap URLs | 1800 | Auto-rebuilt daily |
| Topic pages (en + zh) | 12 | 6 each, ~1000 words |
| Compare pages (en + zh) | 56 | 28 each, generated from `scripts/build-compare-pages.mjs` |
| Model detail pages | 1715 | Generated from `data/models.json` |
| zh flagship articles | 3 | Hand-written, humanized |
| Platform pages | 8 | Pre-existing |
| About / Privacy / Contact | 4 | en + zh About |

**Daily automation pipeline:**
1. `06:00 UTC` GitHub Action `Sync models.dev` runs
2. Pulls `models.dev/api.json` into `data/`
3. If changed, regenerates `models/` (1715 pages) and `sitemap.xml`
4. Commits to `main` → Cloudflare auto-deploys

Result: model prices update within 24h of upstream. Zero manual work.

---

## 3. Repo structure

```
check-ai/
├── index.html                  # main comparison tool (SPA, vanilla JS)
├── about.html                  # About (English)
├── privacy.html, contact.html  # legal/contact stubs
├── app.js                      # comparison app logic (568 lines)
├── share.js                    # ?compare= URL handling + Copy link button
├── styles.css                  # editorial/industrial design system (single file)
├── sitemap.xml                 # auto-rebuilt
├── robots.txt
├── favicon.svg, site.webmanifest
│
├── topics/                     # EN topic pages (6 × ~1000 words)
├── zh/
│   ├── index.html              # Chinese hub
│   ├── about/                  # Chinese About
│   ├── topics/                 # zh topic pages (6)
│   ├── articles/               # zh flagship articles (3)
│   └── compare/                # zh programmatic compare pages (28)
├── compare/                    # EN programmatic compare pages (28)
├── models/                     # 1715 auto-generated model detail pages
├── platforms/                  # 8 pre-existing platform pages
│
├── data/                       # auto-synced from models.dev
│   ├── models-dev.json         # raw upstream snapshot
│   ├── models.json             # transformed for use
│   └── sync-meta.json          # fetch metadata
│
├── scripts/
│   ├── sync-models-dev.mjs     # fetch + transform models.dev
│   ├── build-model-pages.mjs   # regenerate /models/X/ from data
│   ├── build-compare-pages.mjs # regenerate /compare/X-vs-Y/ (en+zh)
│   └── build-sitemap.mjs       # rebuild sitemap.xml from filesystem
│
└── .github/workflows/
    └── sync-models-dev.yml     # daily cron + push trigger
```

---

## 4. Local setup

### Prerequisites
- **Git**, **Node 20+**, **a browser**.
- macOS / Linux preferred. Windows works via WSL.

### Clone & install
```bash
git clone https://github.com/zayuerweb-dev/check-ai.git
cd check-ai
# No npm dependencies needed — vanilla site.
```

### Run locally (preview the site)
Any static server works. Pick one:
```bash
# Python (built-in)
python3 -m http.server 8000

# Node (no deps)
npx serve@latest -p 8000

# Or just open index.html in browser (most things work, /data/ fetch may CORS-fail)
```
Then open http://localhost:8000.

### Regenerate generated pages
```bash
node scripts/sync-models-dev.mjs       # pull fresh data (needs internet)
node scripts/build-model-pages.mjs     # rebuild /models/
node scripts/build-compare-pages.mjs   # rebuild /compare/
node scripts/build-sitemap.mjs         # rebuild sitemap.xml
```

---

## 5. How to make changes

### Add a new article (most common task)
1. Create `zh/articles/<slug>/index.html` (copy an existing article as template)
2. Add a `<link>` from `zh/index.html` to it
3. Commit. Sitemap auto-includes it on the next sync run, or run `node scripts/build-sitemap.mjs` immediately.

### Update editorial content on a topic page
1. Edit the file directly under `topics/` or `zh/topics/`
2. Bump cache-buster: if you changed CSS or want users to see the change immediately, search-and-replace `styles.css?v=20260510-4` → `?v=20260512-1` (or pick today's date) across all HTML.

### Tracking a new frontier model in topic / article / compare templates
1. Edit `scripts/build-compare-pages.mjs` — add the model to the `MODELS` array (with `slug`, `name`, `pricing`, `swebench`, `humaneval`, `strengths`, `weaknesses`, etc.)
2. `node scripts/build-compare-pages.mjs` → generates new compare pages
3. `node scripts/build-sitemap.mjs` → updates sitemap

### Pushing to production
```bash
git add .
git commit -m "what changed"
git push origin main          # if you have direct push
# OR
git push origin head:feat-x   # then open PR on GitHub
```
Cloudflare Pages deploys automatically from `main`.

---

## 6. Accounts you control (or need to)

| Service | What for | Action needed |
|---|---|---|
| GitHub (`@zayuerweb-dev/check-ai`) | Source of truth | ✅ already yours |
| Cloudflare Pages | Deploys `main` to `checkaimodels.com` | ✅ already yours |
| Cloudflare DNS | `checkaimodels.com` → Pages | ✅ already yours |
| Cloudflare Web Analytics | Traffic dashboard (token `df6bb0...d3c`) | ✅ already yours |
| Google Search Console | SEO indexing + impressions | ✅ already verified |
| Bing Webmaster Tools | Bing indexing | ✅ already verified |
| 百度站长 | Chinese SEO (optional) | ⚠️ requires phone — TODO |
| OpenRouter | Affiliate (mentioned in articles) | ⚠️ no public referral; UTM only |

**No paid services running.** Operating cost: $0 unless you upgrade Cloudflare or buy Plausible.

---

## 7. Skills (cloned to `~/.claude/skills/`)

Already on your machine after the local clones we did:

```
~/.claude/skills/
├── anthropics-skills/        skill-creator, frontend-design, …
├── vercel-labs-skills/       find-skills
├── superpowers/              TDD methodology (obra)
├── gstack/                   23 engineering role commands (garrytan)
├── mattpocock-skills/        TDD, diagnose, grill-me, caveman, …
├── ui-ux-pro-max/            design system, logo, banner (Gemini API)
├── humanizer/                blader/humanizer (English de-AI)
├── slopbuster/               multi-language de-AI
└── humanizer-zh-tw/          中文去 AI 味
```

**To activate in a new Claude Code session**, these auto-register. To invoke explicitly, type `/skillname` (e.g. `/humanizer-zh-tw`, `/qa`, `/review`).

**For gstack browse to work locally:**
```bash
cd ~/.claude/skills/gstack && ./setup
# Installs bun + Chrome for Testing. ~10s one-time.
```
Then in any chat, ask Claude Code to "browse https://checkaimodels.com" — it'll have a full headless browser.

---

## 8. Recurring tasks

### Weekly (~30 min/week)
- Write 1 new zh flagship article (the moat). Use the humanizer skill afterward.
- Review the daily-sync PRs (data is auto-pushed, but skim for sanity).
- Glance at GSC + Cloudflare Web Analytics for trend.

### Monthly
- Bump editorial dates on topic pages if claims still hold.
- Add 1-2 new frontier models to the `MODELS` array in `build-compare-pages.mjs`.

### Per major release (Claude 5, GPT-6, etc.)
- Update affected topic + compare + flagship article in the same week.

---

## 9. Outstanding items / next moves

| Priority | Task |
|---|---|
| 🔴 High | **Post to V2EX + HN to get first backlinks** (drafts already in conversation history) |
| 🔴 High | Write 4th and 5th zh flagship articles to keep cadence |
| 🟡 Med | Apply for real affiliates: Together AI, Cursor, Replicate (replaces empty OpenRouter UTMs) |
| 🟡 Med | Verify on 百度站长 once you have a phone number to verify |
| 🟢 Low | OG card image (`og-cover.png`) for social-share previews |
| 🟢 Low | Email newsletter capture (only after PV > 5k) |

---

## 10. SEO timeline reality

Day 0: deployed.
Day 7-14: Google finishes crawling 1800 URLs.
Day 30-60: long-tail words start showing in GSC impressions, 0 clicks.
Day 60-120: first hundred clicks/month.
Day 120+: scales with content cadence.

**Don't open GSC every day.** Check biweekly. The leading indicator is "are you publishing weekly?" not impression count.

---

## 11. Emergency / unstuck contacts

- **Cloudflare Pages broken:** Cloudflare dashboard → Pages → Deployments → revert to last good
- **Daily sync broken:** GitHub Actions → Sync models.dev → check log → usually a models.dev schema change
- **Site shows old content after deploy:** Cloudflare cache (purge from dashboard) or browser cache (bump `styles.css?v=...`)
- **Spam in issues:** repo settings → Issues → Limit interactions

---

## 12. What I built for you in this session (one-line summary)

> A bilingual AI-model comparison database with 1715 auto-generated model pages, 56 programmatic compare pages, 12 topic pages, 3 Chinese flagship articles, daily-syncing pricing data, editorial design system, structured-data SEO across 1800 URLs, and a humanizer-pass de-AI prose layer. Self-running. Single-developer maintainable in ~30 min/week.

Good luck.
