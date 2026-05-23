# Content Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Note:** Task 3 (first SOP run) is interactive — it needs web research + human fact-verification and is NOT a fire-and-forget subagent task.

**Goal:** Operationalize the content SOP (docs/2026-05-22-content-workflow-design.md): add a `sources` field + rendered 参考来源 section to the article pipeline, commit a reusable SOP checklist the assistant follows each run, then do the first real run.

**Architecture:** The registry (`data/articles.json`) gains a per-language `sources` array; `build-articles.mjs` renders it as a 参考来源 card and adds `citation` to the Article JSON-LD. The SOP itself lives as a committed checklist (`docs/content-sop.md`) referenced from `CLAUDE.md`, so any session producing content follows the same gates. Content creation then runs that SOP.

**Tech Stack:** Node ESM build script, no new deps. Verification by building + grepping (matches how the other build scripts are verified).

---

## File Structure

| File | Responsibility |
|---|---|
| `scripts/build-articles.mjs` | MODIFY: add `sourcesSection()` render + `citation` in JSON-LD |
| `data/articles.json` | MODIFY: add `sources` to articles (back-fill the Claude review as the worked example) |
| `docs/content-sop.md` | NEW: the repeatable checklist the assistant follows each content run |
| `CLAUDE.md` | MODIFY/CREATE: a "Content production" pointer to the SOP |

---

## Task 1: `sources` field + 参考来源 rendering

**Files:**
- Modify: `scripts/build-articles.mjs`
- Modify: `data/articles.json` (back-fill one article as the worked example)

- [ ] **Step 1: Add the `sourcesSection` helper**

In `scripts/build-articles.mjs`, after `footerFor` (line 59) add:

```javascript
function sourcesSection(lang, c) {
  if (!c.sources || !c.sources.length) return '';
  const label = lang === 'zh' ? '参考来源' : 'Sources';
  const items = c.sources.map((s) =>
    `<li><a href="${esc(s.url)}" target="_blank" rel="noopener nofollow">${esc(s.claim)}</a>${s.checked ? ` <span style="color:var(--muted)">· ${esc(s.checked)}</span>` : ''}</li>`
  ).join('\n');
  return `\n<section class="seo-card"><h2>${label}</h2><ul>\n${items}\n</ul></section>`;
}
```

- [ ] **Step 2: Render it in `renderArticle` (after the body, before footer)**

In `renderArticle` (line 90–95), change the `<main>` block so the sources card
renders after `${body}`:

```javascript
<main class="seo-main">
<p class="eyebrow">${eyebrow}</p>
<h1>${esc(c.title)}</h1>
${body}
${sourcesSection(lang, c)}
</main>
```

- [ ] **Step 3: Add `citation` to the Article JSON-LD**

In `articleJsonLd` (line 35–44), add a `citation` array when sources exist.
Replace the function body's return with:

```javascript
function articleJsonLd(lang, art, c) {
  const headline = c.headline || c.title;
  const obj = {
    '@context': 'https://schema.org', '@type': 'Article', inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
    headline, description: c.description,
    datePublished: art.published, dateModified: art.modified,
    author: { '@type': 'Person', name: art.author, url: art.authorUrl, sameAs: [art.authorUrl] },
    publisher: { '@type': 'Organization', name: 'Check.AI', url: 'https://checkaimodels.com/' },
  };
  if (c.sources && c.sources.length) {
    obj.citation = c.sources.map((s) => ({ '@type': 'CreativeWork', name: s.claim, url: s.url }));
  }
  return JSON.stringify(obj);
}
```

- [ ] **Step 4: Back-fill sources on the Claude review (worked example)**

In `data/articles.json`, find the `claude-opus-4-7-review-2026` entry's `zh`
object and add a `sources` array (these are the sources its lead already names):

```json
"sources": [
  { "claim": "Claude Opus 4.7 官方发布与规格", "url": "https://www.anthropic.com/news", "checked": "2026-05-22" },
  { "claim": "SWE-bench / 跑分对比", "url": "https://artificialanalysis.ai/", "checked": "2026-05-22" },
  { "claim": "Vellum 实测", "url": "https://www.vellum.ai/", "checked": "2026-05-22" }
]
```

(Add it alongside the existing `faq`/`related` keys in that article's `zh` object. Keep valid JSON — comma placement.)

- [ ] **Step 5: Build and verify the section + JSON-LD render**

Run:
```bash
node scripts/build-articles.mjs
node -e "const fs=require('fs');const h=fs.readFileSync('zh/articles/claude-opus-4-7-review-2026/index.html','utf8');console.log('sources card?', h.includes('参考来源'));console.log('citation jsonld?', h.includes('\"citation\"'));console.log('nofollow?', h.includes('rel=\"noopener nofollow\"'));"
```
Expected: `sources card? true`, `citation jsonld? true`, `nofollow? true`.

- [ ] **Step 6: Verify articles without sources are unchanged (no empty card)**

Run:
```bash
node -e "const fs=require('fs');const h=fs.readFileSync('zh/articles/gpt-5-vs-claude-coding-2026/index.html','utf8');if(h.includes('参考来源'))throw new Error('unexpected sources card on article without sources');console.log('no spurious card OK');"
```
Expected: `no spurious card OK`.

- [ ] **Step 7: Nav audit + commit**

```bash
node scripts/audit-nav.mjs --static
git add scripts/build-articles.mjs data/articles.json zh/articles/claude-opus-4-7-review-2026/index.html
git -c core.autocrlf=false commit -m "feat(content): sources field → 参考来源 section + citation JSON-LD"
```
Expected: `audit: 0 problem(s)`.

---

## Task 2: Commit the SOP checklist + CLAUDE.md pointer

**Files:**
- Create: `docs/content-sop.md`
- Modify/Create: `CLAUDE.md`

- [ ] **Step 1: Write the SOP checklist**

Create `docs/content-sop.md` with this exact content:

```markdown
# Content production SOP (articles + model verdicts)

Spec: docs/2026-05-22-content-workflow-design.md. Follow these gates every run.
Two content types, same pipeline: long-form **article** (full) and **verdict**
(`verdictZh`, compressed — steps 2–5 on one paragraph).

## Hard constraints
- Real-time accuracy: the assistant's training is stale for 2026 models. NEVER
  state a 2026 number from memory. Quantitative facts come from
  `data/models.json` (synced daily); benchmarks/news/qualitative come from web
  research WITH a cited URL.
- No AI tells: de-AI is mandatory (humanizer-zh), then human read. No AI-detector
  tools.

## Pipeline
1. **Topic + angle.** Human picks, or assistant proposes candidates from data/news.
   Output: one-line angle + target zh SEO query.
2. **Gather facts → fact table.** Each row: claim → value → source URL. Pull
   prices/context/dates from `data/models.json`; web-research the rest, cite each.
3. **Draft (zh).** Follow the article template (below). Use ONLY numbers from the
   fact table. Specific, opinionated, every sentence carries information.
4. **De-AI.** Run humanizer-zh. Then self-check against the AI-tell list (below).
5. **Verify.** List the HIGH-RISK fact rows (prices, benchmark scores, dates,
   breaking changes) for the human to confirm/correct.
6. **Publish.** Article → `data/articles.json` entry + `zh/articles/<slug>/body.html`
   + `sources` array; Verdict → `data/model-pages.json` `verdictZh`. Then
   `node scripts/build-articles.mjs` (+ `build-model-pages.mjs` for verdicts) →
   `node scripts/audit-nav.mjs --static` → `npm run test:e2e` → open a PR.

## Article template
seo-lead (1 句 + 2–3 个数字 + 来源) → 目录 → 30 秒结论(场景化该不该用) →
规格/跑分表(vs 上代和竞品) → N 个关键变化/决策树 → 真实成本估算 →
未来 6 个月观察点 → 相关阅读(内链) → FAQ(喂 FAQPage JSON-LD)。
Verdict = 2–4 句:厂商 + 主打能力 + 价格档位(数据驱动) + 适合场景 + 链相关文章。

## AI-tell self-check (reject/rewrite any)
- 套话与空泛形容词("强大的""革命性的"无信息量修饰)
- 排比三连 / 过度对仗 / 强行三段式
- 无信息量过渡句("值得注意的是""综上所述""在……的今天")
- 总分总八股、每段先总后分的机械节奏
- 把数字包在空话里(给具体分数,别说"显著提升")
- 翻译腔("它提供了一种……的方式")
- 结尾强行升华 / 喊口号
Pass test: delete any sentence that loses no information when removed.
```

- [ ] **Step 2: Add a CLAUDE.md pointer**

If `CLAUDE.md` exists, append the section below; if not, create `CLAUDE.md` with it:

```markdown

## Content production

When writing or strengthening articles or model verdicts, follow the SOP in
`docs/content-sop.md` (sourcing → draft → de-AI via humanizer-zh → human verify
of high-risk facts → publish). Never state 2026 model numbers from memory —
source them from `data/models.json` or cited web research.
```

- [ ] **Step 3: Commit**

```bash
git add docs/content-sop.md CLAUDE.md
git -c core.autocrlf=false commit -m "docs: content SOP checklist + CLAUDE.md pointer"
```

---

## Task 3: First SOP run (INTERACTIVE — human-in-loop)

**Not a fire-and-forget subagent task.** This executes the SOP once to produce real
content. It requires web research and human verification of high-risk facts.

**Files (produced during the run):**
- Create: `zh/articles/<new-slug>/body.html` (if an article) OR
- Modify: `data/model-pages.json` (if the verdict batch)
- Modify: `data/articles.json` (article entry + sources)

- [ ] **Step 1: Pick the first piece with the human**

Ask the human to choose ONE to start: (a) article #7 on a chosen topic, or
(b) the ~25-model verdict batch (depends on T2 landing first). Get the angle +
target SEO query.

- [ ] **Step 2: Build the fact table**

Pull quantitative rows from `data/models.json`. Web-research benchmarks/news/
qualitative; record a source URL per row. Present the fact table to the human.

- [ ] **Step 3: Draft → de-AI**

Draft in zh per the template. Run humanizer-zh. Self-check against the AI-tell list.

- [ ] **Step 4: Human verifies high-risk rows**

List prices/benchmarks/dates/breaking-changes from the fact table; human confirms
or corrects. Apply corrections.

- [ ] **Step 5: Publish**

Write the registry entry + body.html (+ `sources`) or `verdictZh`. Then:
```bash
node scripts/build-articles.mjs   # (+ node scripts/build-model-pages.mjs for verdicts)
node scripts/audit-nav.mjs --static
npm run test:e2e
```
Expected: build OK, `audit: 0 problem(s)`, e2e green.

- [ ] **Step 6: Commit + PR**

```bash
git add data/ zh/articles/
git -c core.autocrlf=false commit -m "content: <piece title> (first SOP run)"
git push -u origin <branch>
gh pr create --title "..." --body "Follows docs/content-sop.md. Sources cited; high-risk facts human-verified."
```

---

## Self-review notes (addressed)

- **Spec coverage:** sources field + render (Task 1 ↔ spec D), SOP pipeline + AI-tell
  checklist + article template baked into the committed checklist (Task 2 ↔ spec A/B/C),
  hybrid sourcing + human verify + de-AI gates (Task 3 ↔ spec A/E), cadence noted in SOP.
- **No placeholders:** Task 1/2 have complete code/content; Task 3 is intentionally a
  procedure (interactive content work cannot be pre-written as code) and is flagged as such.
- **Consistency:** `sourcesSection(lang, c)`, `c.sources` shape `{claim,url,checked}`,
  and `citation` JSON-LD all use the same field names across tasks.
