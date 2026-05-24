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

## Bilingual (zh + en)

zh is primary. **High-value articles also get an en version** (flagship comparisons,
high-intent buying guides); niche or fast-decaying pieces stay zh-only. Backfill
existing articles gradually, newest first.

How to add en for an article:
1. **Adapt, don't translate literally.** Same verified facts (no re-sourcing — language
   only), native English phrasing, and localize: trim sections that only matter to zh
   readers (e.g. mainland-China payment workarounds become a short "Availability" note).
2. **De-AI with slopbuster** (English). Watch em-dash overuse especially.
3. Write `en/articles/<slug>/body.html` and set `en.status: "published"` in the registry
   with en `title/metaTitle/description/og*/headline/faq/related/sources`.
4. `node scripts/build-articles.mjs` regenerates the en page + bidirectional hreflang,
   lists it in the en hub, and adds the EN/中文 toggle to both language pages.

Markdown distribution gotcha (Juejin etc.): platforms render `$...$` as LaTeX math, so
escape dollar signs in prices as `\$` (e.g. `\$20`) when posting markdown.
