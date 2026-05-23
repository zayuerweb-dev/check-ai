# Content production workflow (SOP) — design spec

Date: 2026-05-22
Status: approved (brainstorming complete, pending writing-plans)

## Problem

Check.AI has 6 strong hand-written zh articles and needs more, plus per-model
verdicts (the T2 indexable subset's `verdictZh`). Today there is no repeatable
process: each piece is ad-hoc. The bar going forward: content must be **high
quality, current (实时), and free of AI tells (没有 AI 味)**. Two structural
constraints shape everything:

1. **Knowledge cutoff.** The assistant's training cutoff is 2025-08; the models
   covered (GPT-5.5, Claude Opus 4.7, Gemini 3.x, etc.) are 2026. Accurate
   "real-time" content therefore *cannot* come from the model's memory — it must
   be sourced from current data.
2. **AI tells.** Drafts written by an LLM carry recognizable patterns. A de-AI
   step plus a human gate are mandatory, not optional.

## Decisions (locked during brainstorming)

1. **Scope:** one shared workflow producing **two content types** — long-form
   articles (like the existing 6) and short model verdicts (`verdictZh`). Same
   pipeline, different depth.
2. **Sourcing = hybrid:** quantitative backbone from our daily-synced
   `data/models.json` (prices, context, release dates — already current);
   benchmarks / news / qualitative from assistant web research **with a cited
   source per claim**; the human verifies high-risk facts.
3. **No-AI = three gates:** `humanizer-zh` (tool) → AI-tell self-check
   (assistant) → human final read. **No AI-detector tools** (unreliable; gaming
   them ≠ good writing).
4. **Sources are recorded** in the registry so a stale citation can be found and
   rechecked when the underlying data changes.

## A. The pipeline (6 steps)

Articles run the full pipeline; verdicts run a compressed version (steps 2–5 on a
single paragraph). Each step has a clear owner.

| # | Step | Owner | Output |
|---|---|---|---|
| 1 | **Topic + angle** | human picks, or assistant proposes candidates from data/news for human to choose | a one-line angle + target zh SEO query |
| 2 | **Gather facts (实时)** | assistant | a **fact table**: each row = claim → value → source. Quantitative rows pull from `data/models.json`; benchmark/news/qualitative rows from web research with a URL. |
| 3 | **Draft** | assistant | zh draft following the article template (see C), using ONLY numbers from the fact table |
| 4 | **De-AI** | assistant (`humanizer-zh`) + self-check (B) | a draft with AI tells removed |
| 5 | **Verify** | human verifies the **high-risk subset** of the fact table (prices, benchmark scores, dates, breaking changes); assistant lists exactly those rows | confirmed/corrected facts |
| 6 | **Publish** | assistant | registry entry + `body.html` (article) or `verdictZh` (verdict) → `node scripts/build-articles.mjs` (+ `build-model-pages.mjs` for verdicts) → `audit-nav` + `e2e` → PR |

The **fact table** is the connective artifact: it is produced in step 2, drives
step 3, is the thing the human checks in step 5, and its sources are persisted in
step 6.

## B. AI-tell self-check (the concrete checklist)

`humanizer-zh` does the heavy lifting; this checklist is the assistant's explicit
self-review before the human read. Reject/rewrite any of these:

- 套话与空泛形容词堆砌（"强大的""卓越的""革命性的"无信息量修饰）
- 排比三连 / 过度对仗（"不仅…而且…更…"、强行三段式）
- 无信息量过渡句（"值得注意的是""总而言之""在……的今天""综上所述"）
- 总分总八股结构、每段都先总述再分述的机械节奏
- 把数字包在空话里而不是直接给（"显著提升了性能" → 给具体分数）
- 中英混排腔、翻译腔（"它提供了一种……的方式"）
- 结尾强行升华 / 喊口号

Pass test: every sentence carries information (a number, a comparison, a
recommendation, a caveat) — if a sentence could be deleted without losing
information, delete it.

## C. Article template (the quality structure)

Reuse the proven structure of the existing 6 articles:

- `seo-lead` 段：一句话说清这篇解决什么 + 引用 2–3 个关键数字 + 标来源出处
- 目录（`article-toc`）
- 30 秒结论（场景化的"该不该用"列表）
- 核心规格 / 关键跑分（表格，带 vs 上一代和竞品）
- N 个真正重要的变化 / 决策树
- 真实成本估算
- 未来 6 个月观察点
- 相关阅读（内链到其他文章 / 对比页 / model 页）
- FAQ（喂 FAQPage JSON-LD）

Verdicts (`verdictZh`) = a compressed 2–4 sentence version: brand + 主打能力 +
价格档位（数据驱动）+ 适合场景 + 链到相关文章（若有）。

## D. Sources recorded in the registry

Add a `sources` field per article in `data/articles.json` and (optionally) per
verdict override, holding the fact-table source rows:

```json
"sources": [
  { "claim": "SWE-bench Pro 64.3%", "url": "https://...", "checked": "2026-05-22" }
]
```

This makes staleness auditable: when `data/models.json` sync changes a cited
price/spec, the article carrying that source can be flagged for recheck.

## E. Roles (summary)

- **Assistant:** propose topics, gather facts (data + web, cited), draft, de-AI,
  self-check, list high-risk rows for verification, publish via PR.
- **Human:** approve the angle, verify high-risk facts, final read, merge.

## F. Cadence

- Articles: ~1 per week.
- Verdicts: batched with the T2 subset (~25 at once), then incremental as new
  flagships qualify.

## Out of scope (YAGNI)

- **Auto-recheck automation** (sync flags articles whose cited data changed):
  desirable but deferred; the `sources` field makes it *possible* later without
  building the trigger now.
- **AI-detector integration:** explicitly rejected.
- **Non-zh content / translation:** the workflow is zh-first; en is a later
  concern.
- **A CMS / editor UI:** content stays in the registry + `body.html` files.
