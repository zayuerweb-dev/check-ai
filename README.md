# Check.AI — AI 模型对比数据库 / AI Model Comparison Database

**🌐 Live site: [checkaimodels.com](https://checkaimodels.com)**

中立、有时效、可追溯的 AI 模型对比。并排比较 GPT-5、Claude、Gemini、DeepSeek、
Qwen、Mistral 的价格、上下文窗口、能力和跑分。中英双语，每周更新。

A neutral, dated, sourced AI model comparison database. Side-by-side pricing,
context windows, capabilities and benchmarks across every major provider.
Bilingual (English / 中文), updated weekly.

---

## What's inside

- **[Live comparison tool](https://checkaimodels.com)** — filter 118 providers / 1700+ models by price, capability, context
- **1715 model reference pages** — auto-synced daily from [models.dev](https://models.dev) + provider docs
- **Editorial deep-dives (中文)** — hand-written, sourced, no AI slop:
  - [本地部署开源大模型完全指南 2026](https://checkaimodels.com/zh/articles/local-llm-deployment-guide-2026/)
  - [RAG vs 长上下文 vs Fine-tune 怎么选](https://checkaimodels.com/zh/articles/rag-vs-long-context-vs-fine-tune-2026/)
  - [Claude Opus 4.7 深度评测](https://checkaimodels.com/zh/articles/claude-opus-4-7-review-2026/)
  - [GPT-5 vs Claude 写代码哪个强](https://checkaimodels.com/zh/articles/gpt-5-vs-claude-coding-2026/)
  - [DeepSeek R1 vs GPT-5 性价比](https://checkaimodels.com/zh/articles/deepseek-r1-vs-gpt-5-cost-2026/)
  - [2026 年国产 AI 模型全景](https://checkaimodels.com/zh/articles/china-ai-models-landscape-2026/)

## Stack

Pure static HTML/CSS/JS. No build step, no framework. Hosted on Cloudflare
Pages. Model + pricing data syncs daily via GitHub Actions from the open
[models.dev](https://models.dev) dataset.

## Data sources

Pricing and specs from official provider documentation and the open-source
models.dev dataset. Benchmark numbers from LMArena, SWE-bench, MMLU, and
provider-published evals. Editorial verdicts written by the maintainer.

## License

Content © Check.AI. Code MIT.
