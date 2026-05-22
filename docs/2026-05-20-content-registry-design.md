# Content registry — design spec

Date: 2026-05-20
Status: approved (brainstorming complete, pending writing-plans)

## Problem

Check.AI has 6 hand-written zh articles in `zh/articles/`. Each article's
metadata (publish date, author, title) lives only inside that file's JSON-LD.
There is no central record, no English articles, and the hub article lists are
hand-coded in `zh/index.html`. Consequences:

- The zh hub article list must be hand-maintained and can drift from reality.
- No way to track which articles have/need English versions.
- The en hub can't show article translations and the zh↔en correspondence is
  unmanaged (visible bug: en hub lists no articles, says "Chinese only").
- Write date vs publish date vs last-modified aren't separable.
- Distribution records (Juejin, SegmentFault) aren't tracked anywhere.

## Decisions (locked during brainstorming)

1. **Registry is the single source of truth.** `data/articles.json` drives the
   hub lists AND each article page's metadata (JSON-LD, byline).
2. **Template + body separation (refactor).** Each article = a registry entry
   (metadata) + a hand-written `body.html` (prose). A build script assembles
   the full `index.html`.
3. **Body format: HTML fragment, zero dependency.** `body.html` is the existing
   `<main>` inner content; no markdown renderer is added (keeps the pure-static,
   no-build-framework property).

## A. File structure

```
data/articles.json                 # registry — single source of truth
zh/articles/<slug>/body.html       # zh prose fragment (hand-written; inner <main> content below the H1)
en/articles/<slug>/body.html       # en prose fragment (exists only when an en version is written)
scripts/build-articles.mjs         # NEW: reads registry + body → writes index.html + injects hub lists
zh/articles/<slug>/index.html      # GENERATED (committed, never hand-edited)
en/articles/<slug>/index.html      # GENERATED when en status = published
zh/index.html, en/index.html       # hub article-list section injected between markers
```

## B. Registry schema (`data/articles.json`)

Array of article objects:

```json
{
  "slug": "rag-vs-long-context-vs-fine-tune-2026",
  "topic": "深度对比",
  "author": "zayuerweb-dev",
  "authorUrl": "https://github.com/zayuerweb-dev",
  "written": "2026-05-13",
  "published": "2026-05-15",
  "modified": "2026-05-15",
  "zh": { "title": "...", "description": "...", "status": "published" },
  "en": { "title": "...", "description": "...", "status": "none" },
  "distribution": [
    { "platform": "juejin", "url": "https://juejin.cn/post/7641165819036762152", "date": "2026-05-16" }
  ]
}
```

- `status` per language: `none` (no version in this language) | `todo`
  (planned/untranslated) | `draft` (written, not live) | `published` (live).
- Body path is derived by convention (`<lang>/articles/<slug>/body.html`), not
  stored.
- `topic` is the hub section label / eyebrow category.

## C. build-articles.mjs

For each article × each language where `status == "published"`:
1. Read `<lang>/articles/<slug>/body.html`.
2. Assemble `index.html` from a template:
   - `<head>`: title/description from registry; JSON-LD `Article` with
     `datePublished`=published, `dateModified`=modified, `author` from registry,
     `inLanguage` per language; canonical + hreflang (hreflang en/zh emitted
     only for languages whose status is `published`).
   - `<header class="seo-header">`: the canonical nav (matches audit-nav.mjs
     rules). zh article gets an EN toggle **only if** `en.status == "published"`;
     en article gets a 中文 toggle only if `zh.status == "published"`.
   - eyebrow byline: `${topic} · ${published} · 作者 @${author}`.
   - `<h1>`: the registry title.
   - `<main>` body: the body.html fragment.
   - footer: canonical per-language footer.
3. Write `index.html`.

Then regenerate the hub article lists:
- zh hub: list every article with `zh.status == "published"`, injected into
  `zh/index.html` between `<!-- ARTICLES:start -->` / `<!-- ARTICLES:end -->`
  markers.
- en hub: list every article with `en.status == "published"` between the same
  markers in `en/index.html`. When none are published, emit the existing
  "editorial deep-dives are Chinese only — see 中文" line.

## D. Hub correspondence & language toggles

The zh↔en article correspondence is driven entirely by `en.status`:
- en.status `none`/`todo`/`draft` → no en page generated; the zh article page
  has no EN toggle; en hub does not list it.
- en.status `published` → en page generated; zh article page grows an EN toggle
  to the en counterpart; en hub lists it.

This is what fixes the reported "中英对不上 / 按钮不对" — correspondence stops
being hand-edited and becomes a function of the registry.

## E. Migration of the 6 existing articles + source-of-truth boundaries

Migration (one-time, per article):
1. Extract the inner `<main>` content **below the H1** into
   `zh/articles/<slug>/body.html`.
2. Extract metadata (title, description, dates, author, topic, any known
   distribution links) into a `data/articles.json` entry with
   `zh.status = "published"`, `en.status = "none"`.
3. Run `build-articles.mjs` and confirm the regenerated `index.html` matches the
   original in content (allow whitespace/attribute-order differences).

Source-of-truth boundaries:
- `data/articles.json` — canonical for metadata, correspondence, distribution.
- `<lang>/articles/<slug>/body.html` — canonical for prose only.
- `index.html` — a build artifact: committed (Cloudflare serves it) but never
  hand-edited.

Validation: after build, run `node scripts/audit-nav.mjs` to confirm generated
article pages obey the nav rules (no dead language toggle, brand → /zh/ or /en/,
canonical nav identical within a language).

## Out of scope (YAGNI)

- Authoring/translating any English articles (registry just records `none`).
- A markdown pipeline (HTML fragments only).
- Related-article "see also" links (footer stays the generic
  "返回中文首页"); can be added later via a `relatedSlugs` field.
- Auto-generating model/compare pages (separate existing scripts, unchanged).
