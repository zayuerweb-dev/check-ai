#!/usr/bin/env node
// Generate /compare/{a}-vs-{b}/ (English) + /zh/compare/{a}-vs-{b}/ (Chinese)
// static pages for every pair of tracked models. One source list, two locales.
// Run: node scripts/build-compare-pages.mjs

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const MODELS = [
  {
    slug: 'gpt-5-5', platform: 'openai', id: 'gpt-5.5', name: 'GPT-5.5', vendor: 'OpenAI', vendorZh: 'OpenAI',
    input: 5, output: 30, context: 1_100_000, release: '2026-04-23',
    capabilities: ['reasoning', 'code', 'vision'],
    swebench: 65, humaneval: 96, lmarena: 1442,
    open: false,
    en: {
      strengths: 'Frontier reasoning, broad ecosystem, strong tool use, multimodal in/out.',
      weaknesses: 'Premium pricing, occasional over-editing in agent loops.',
      bestFor: 'Hard reasoning, ambiguous specs, system design, agent planners.',
    },
    zh: {
      strengths: '前沿推理能力、生态最广、工具调用稳、多模态输入输出。',
      weaknesses: '价格不便宜，agent 模式偶尔过度修改无关代码。',
      bestFor: '硬推理、模糊需求、系统设计、agent 主控。',
    },
  },
  {
    slug: 'gpt-5-5-pro', platform: 'openai', id: 'gpt-5.5-pro', name: 'GPT-5.5 Pro', vendor: 'OpenAI', vendorZh: 'OpenAI',
    input: 30, output: 180, context: 1_100_000, release: '2026-04-23',
    capabilities: ['reasoning', 'code', 'vision'],
    swebench: 70, humaneval: 97, lmarena: 1465,
    open: false,
    en: {
      strengths: 'Top-tier reasoning, asks better clarifying questions, deepest analysis.',
      weaknesses: '6× the price of GPT-5.5 standard, slower.',
      bestFor: 'High-stakes one-off problems, system design, math research.',
    },
    zh: {
      strengths: '当前推理最强，会主动反问，分析最深入。',
      weaknesses: '比标准版贵 6 倍、响应慢。',
      bestFor: '高价值的一次性难题、系统设计、数学研究。',
    },
  },
  {
    slug: 'claude-sonnet-4-6', platform: 'anthropic', id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', vendor: 'Anthropic', vendorZh: 'Anthropic',
    input: 3, output: 15, context: 1_000_000, release: '2026-03-12',
    capabilities: ['reasoning', 'code', 'vision'],
    swebench: 70, humaneval: 94, lmarena: 1438,
    open: false,
    en: {
      strengths: 'Best agentic coding, restrained edits, strong tool calling, default in Cursor / Cline / Aider.',
      weaknesses: 'Pricier than DeepSeek; slower than Haiku tier.',
      bestFor: 'Agentic coding, multi-file refactors, structured output, Cursor power-users.',
    },
    zh: {
      strengths: '当前 agent 编程最强，编辑克制不乱改，工具调用稳，是 Cursor / Cline / Aider 默认。',
      weaknesses: '比 DeepSeek 贵；比 Haiku 慢。',
      bestFor: 'agent 编程、多文件重构、结构化输出、Cursor 重度用户。',
    },
  },
  {
    slug: 'gemini-2-5-pro', platform: 'google', id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', vendor: 'Google', vendorZh: 'Google',
    input: 1.25, output: 10, context: 2_000_000, release: '2025-06-17',
    capabilities: ['reasoning', 'code', 'vision'],
    swebench: 60, humaneval: 92, lmarena: 1420,
    open: false,
    en: {
      strengths: 'Largest context window (2M), strong multimodal, generous AI Studio free tier.',
      weaknesses: 'Recall drops past 500K, weaker on agentic edits than Claude / GPT.',
      bestFor: 'Whole-repo Q&A, long PDFs, multimodal, free prototyping.',
    },
    zh: {
      strengths: '上下文最长（200 万 token）、多模态强、AI Studio 免费额度大方。',
      weaknesses: '500K 之后召回率掉、agent 编辑弱于 Claude / GPT。',
      bestFor: '整库 Q&A、长 PDF、多模态、免费原型验证。',
    },
  },
  {
    slug: 'grok-4', platform: 'xai', id: 'grok-4', name: 'Grok 4', vendor: 'xAI', vendorZh: 'xAI',
    input: 3, output: 15, context: 256_000, release: '2025-07-09',
    capabilities: ['reasoning', 'web'],
    swebench: 55, humaneval: 90, lmarena: 1400,
    open: false,
    en: {
      strengths: 'Real-time X/Twitter access, strong math, edgy persona.',
      weaknesses: 'Thin IDE/tool ecosystem, weaker code than Claude/GPT-5.',
      bestFor: 'Breaking news, social analysis, math, X-integrated workflows.',
    },
    zh: {
      strengths: 'X（推特）实时数据独家、数学强、人设敢怼。',
      weaknesses: 'IDE 和工具生态薄弱，代码能力弱于 Claude/GPT-5。',
      bestFor: '突发新闻、舆情分析、数学、X 集成工作流。',
    },
  },
  {
    slug: 'deepseek-r1', platform: 'deepseek', id: 'deepseek-r1', name: 'DeepSeek R1', vendor: 'DeepSeek', vendorZh: 'DeepSeek',
    input: 0.55, output: 2.19, context: 128_000, release: '2025-01-20',
    capabilities: ['reasoning', 'code', 'cheap'],
    swebench: 52, humaneval: 93, lmarena: 1418,
    open: true,
    en: {
      strengths: 'Best price-to-quality, open weights, strong math + code, self-hostable.',
      weaknesses: 'Weaker tool calling, smaller context, China-hosted official API.',
      bestFor: 'Cost-sensitive production, batch jobs, self-hosted privacy use.',
    },
    zh: {
      strengths: '性价比之王、开放权重、数学和代码强、可自托管。',
      weaknesses: '工具调用稍弱、上下文较小、官方 API 在中国托管。',
      bestFor: '成本敏感的生产、批量任务、自部署隐私场景。',
    },
  },
  {
    slug: 'qwen3-max', platform: 'alibaba', id: 'qwen3-max', name: 'Qwen3 Max', vendor: 'Alibaba', vendorZh: '阿里',
    input: 1, output: 4, context: 1_000_000, release: '2025-09-05',
    capabilities: ['reasoning', 'code', 'vision'],
    swebench: 50, humaneval: 91, lmarena: 1410,
    open: true,
    en: {
      strengths: 'Best Chinese-language quality, multilingual, 1M context, fast in Asia.',
      weaknesses: 'Smaller English ecosystem, fewer integrations.',
      bestFor: 'Chinese / multilingual products, Asia-region deployments, multilingual RAG.',
    },
    zh: {
      strengths: '中文质量最佳、多语言强、1M 上下文、亚洲低延迟。',
      weaknesses: '英文生态较小、集成方案更少。',
      bestFor: '中文 / 多语言产品、亚洲部署、多语言 RAG。',
    },
  },
  {
    slug: 'mistral-large', platform: 'mistral', id: 'mistral-large', name: 'Mistral Large', vendor: 'Mistral', vendorZh: 'Mistral',
    input: 2, output: 6, context: 128_000, release: '2025-02-01',
    capabilities: ['code'],
    swebench: 45, humaneval: 88, lmarena: 1380,
    open: true,
    en: {
      strengths: 'EU-hosted, Apache-licensed open variants, solid tool use, predictable.',
      weaknesses: 'Behind frontier on reasoning benchmarks.',
      bestFor: 'EU compliance, on-prem deployments, mid-range workloads.',
    },
    zh: {
      strengths: '欧盟托管、开源版本 Apache 授权、工具调用稳、行为可预测。',
      weaknesses: '推理跑分略低于前沿。',
      bestFor: '欧盟合规、私有化部署、中等量级工作负载。',
    },
  },
];

const fmtMoney = (n) => `$${n.toFixed(2)}`;
const fmtCtx = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M` : `${Math.round(n / 1000)}K`;
const slugPair = (a, b) => [a.slug, b.slug].sort().join('-vs-');

function pickWinner(a, b, key, lowerWins = false) {
  if (a[key] === b[key]) return null;
  if (lowerWins) return a[key] < b[key] ? a : b;
  return a[key] > b[key] ? a : b;
}

const T = {
  en: {
    eyebrow: 'Model comparison · Updated May 2026',
    leadIntro: (a, b) => `A direct, dated comparison of <strong>${a.name}</strong> (${a.vendor}) and <strong>${b.name}</strong> (${b.vendor}). Every number below is sourced from official provider docs and public benchmarks. If you need to make this decision today, the verdict is at the top.`,
    verdict: '30-second verdict',
    cheaper: (w, lo, hi) => `<li><strong>Cheaper:</strong> ${w.name} (input ${fmtMoney(lo)} vs ${fmtMoney(hi)} per 1M tokens).</li>`,
    longer: (w, sm, lg) => `<li><strong>Longer context:</strong> ${w.name} at ${fmtCtx(lg)} vs ${fmtCtx(sm)}.</li>`,
    swe: (w, lo, hi) => `<li><strong>Stronger on SWE-bench Verified:</strong> ${w.name} (~${hi}% vs ~${lo}%).</li>`,
    arena: (w, lo, hi) => `<li><strong>Higher LMArena:</strong> ${w.name} (${hi} vs ${lo}).</li>`,
    open: (w) => `<li><strong>Open weights:</strong> ${w.name} can be self-hosted.</li>`,
    openTool: '→ Open both side-by-side in the Check.AI comparison tool',
    specsHead: 'Specs side-by-side',
    sourceLine: (a, b) => `Pricing from official ${a.vendor} and ${b.vendor} docs. Benchmark numbers from SWE-bench Verified, HumanEval, and LMArena public leaderboards as of May 2026.`,
    perModelHead: (m) => `${m.name} — strengths and weaknesses`,
    strengths: 'Strengths.',
    weaknesses: 'Weaknesses.',
    bestForLabel: 'Best for.',
    decideHead: 'Which one should you pick?',
    pickIf: (m) => `<p><strong>Pick ${m.name} if:</strong> ${m.en.bestFor.toLowerCase()}</p>`,
    bothLine: `<p><strong>Use both if:</strong> you're building an agent or content pipeline. Route the high-stakes / hard-reasoning calls to whichever scores higher on the axis you care about, and the bulk / cheap calls to the other. Most production AI products run a 2-3 model router rather than betting on one.</p>`,
    tryHead: 'Try them side-by-side',
    tryBody: (a, b, url) => `<p>The Check.AI comparison tool lets you put both models in one table with all the numbers, switch capability filters, and share the resulting URL with your team.</p><p><a class="section-link" href="${url}">→ Compare ${a.name} and ${b.name} in the live tool</a></p>`,
    relatedHead: 'Related',
    related: `<ul>
<li><a href="/topics/best-ai-models-for-coding/">Best AI models for coding (2026)</a></li>
<li><a href="/topics/cheapest-ai-api-models/">Cheapest AI API models (2026)</a></li>
<li><a href="/topics/long-context-ai-models/">Long context AI models (2026)</a></li>
<li><a href="/zh/articles/gpt-5-vs-claude-coding-2026/">GPT-5 vs Claude（中文深度对比）</a></li>
<li><a href="/zh/articles/deepseek-r1-vs-gpt-5-cost-2026/">DeepSeek R1 vs GPT-5 性价比（中文）</a></li>
</ul>`,
    nav: '<a href="/">Compare tool</a><a href="/zh/">中文</a><a href="/about.html">About</a>',
    footer: '<a href="/">Open the interactive comparison tool</a>',
    specCols: ['Spec', 'Vendor', 'Input price (per 1M tokens)', 'Output price', 'Context window', 'Release date', 'SWE-bench Verified', 'HumanEval', 'LMArena (approx)', 'Open weights', 'Capabilities'],
    yes: 'Yes', no: 'No',
  },
  zh: {
    eyebrow: '模型对比 · 2026 年 5 月更新',
    leadIntro: (a, b) => `<strong>${a.name}</strong>（${a.vendorZh}）与 <strong>${b.name}</strong>（${b.vendorZh}）的直接对比。所有数据来自厂商官方文档和公开 benchmark。今天就要做选择？结论放在最上面。`,
    verdict: '30 秒结论',
    cheaper: (w, lo, hi) => `<li><strong>更便宜：</strong>${w.name}（输入 ${fmtMoney(lo)} vs ${fmtMoney(hi)} 每百万 token）。</li>`,
    longer: (w, sm, lg) => `<li><strong>上下文更长：</strong>${w.name} 支持 ${fmtCtx(lg)}，对比 ${fmtCtx(sm)}。</li>`,
    swe: (w, lo, hi) => `<li><strong>SWE-bench Verified 更高：</strong>${w.name}（~${hi}% vs ~${lo}%）。</li>`,
    arena: (w, lo, hi) => `<li><strong>LMArena 更高：</strong>${w.name}（${hi} vs ${lo}）。</li>`,
    open: (w) => `<li><strong>开放权重：</strong>${w.name} 可自托管。</li>`,
    openTool: '→ 在 Check.AI 实时对比工具中并排打开两者',
    specsHead: '规格并排对比',
    sourceLine: (a, b) => `价格来自 ${a.vendorZh} 与 ${b.vendorZh} 官方文档；跑分来自 SWE-bench Verified、HumanEval、LMArena 公开榜单，截至 2026 年 5 月。`,
    perModelHead: (m) => `${m.name} — 优势与劣势`,
    strengths: '优势。',
    weaknesses: '劣势。',
    bestForLabel: '适合谁。',
    decideHead: '到底选哪个',
    pickIf: (m) => `<p><strong>选 ${m.name}：</strong>${m.zh.bestFor}</p>`,
    bothLine: `<p><strong>两个一起用：</strong>做 agent 或内容流水线时常见 — 高价值 / 复杂推理任务路由到强项一方，批量 / 便宜任务交给另一方。2026 年成熟产品都不押单一模型。</p>`,
    tryHead: '在实时工具中并排查看',
    tryBody: (a, b, url) => `<p>Check.AI 对比工具能把两个模型放在一张表，所有数据可见、可切能力过滤、可复制分享链接给同事。</p><p><a class="section-link" href="${url}">→ 在实时工具对比 ${a.name} 与 ${b.name}</a></p>`,
    relatedHead: '相关阅读',
    related: `<ul>
<li><a href="/zh/topics/best-ai-models-for-coding/">2026 年写代码最强 AI 模型</a></li>
<li><a href="/zh/topics/cheapest-ai-api-models/">2026 年最便宜的 AI API 模型</a></li>
<li><a href="/zh/topics/long-context-ai-models/">长上下文 AI 模型</a></li>
<li><a href="/zh/articles/gpt-5-vs-claude-coding-2026/">GPT-5 vs Claude：写代码选哪个</a></li>
<li><a href="/zh/articles/deepseek-r1-vs-gpt-5-cost-2026/">DeepSeek R1 vs GPT-5：性价比</a></li>
</ul>`,
    nav: '<a href="/">English</a><a href="/zh/">中文首页</a><a href="/about.html">关于</a>',
    footer: '<a href="/">打开实时对比工具</a>',
    specCols: ['项目', '厂商', '输入价（每 1M token）', '输出价', '上下文窗口', '发布日期', 'SWE-bench Verified', 'HumanEval', 'LMArena（近似）', '开放权重', '能力'],
    yes: '是', no: '否',
  },
};

function tldr(a, b, t) {
  const items = [];
  const cheaper = pickWinner(a, b, 'input', true);
  if (cheaper) items.push(t.cheaper(cheaper, cheaper.input, cheaper === a ? b.input : a.input));
  const longer = pickWinner(a, b, 'context');
  if (longer) items.push(t.longer(longer, longer === a ? b.context : a.context, longer.context));
  const swe = pickWinner(a, b, 'swebench');
  if (swe) items.push(t.swe(swe, swe === a ? b.swebench : a.swebench, swe.swebench));
  const arena = pickWinner(a, b, 'lmarena');
  if (arena) items.push(t.arena(arena, arena === a ? b.lmarena : a.lmarena, arena.lmarena));
  if (a.open !== b.open) items.push(t.open(a.open ? a : b));
  return items.join('\n');
}

function specTable(a, b, t, locale) {
  const vendorA = locale === 'zh' ? a.vendorZh : a.vendor;
  const vendorB = locale === 'zh' ? b.vendorZh : b.vendor;
  const yes = t.yes, no = t.no;
  const cols = t.specCols;
  return `<table style="width:100%;border-collapse:collapse;margin-top:8px">
<thead><tr style="border-bottom:1px solid var(--line)"><th style="text-align:left;padding:8px">${cols[0]}</th><th style="text-align:left;padding:8px">${a.name}</th><th style="text-align:left;padding:8px">${b.name}</th></tr></thead>
<tbody>
<tr><td style="padding:8px">${cols[1]}</td><td style="padding:8px">${vendorA}</td><td style="padding:8px">${vendorB}</td></tr>
<tr><td style="padding:8px">${cols[2]}</td><td style="padding:8px">${fmtMoney(a.input)}</td><td style="padding:8px">${fmtMoney(b.input)}</td></tr>
<tr><td style="padding:8px">${cols[3]}</td><td style="padding:8px">${fmtMoney(a.output)}</td><td style="padding:8px">${fmtMoney(b.output)}</td></tr>
<tr><td style="padding:8px">${cols[4]}</td><td style="padding:8px">${fmtCtx(a.context)}</td><td style="padding:8px">${fmtCtx(b.context)}</td></tr>
<tr><td style="padding:8px">${cols[5]}</td><td style="padding:8px">${a.release}</td><td style="padding:8px">${b.release}</td></tr>
<tr><td style="padding:8px">${cols[6]}</td><td style="padding:8px">~${a.swebench}%</td><td style="padding:8px">~${b.swebench}%</td></tr>
<tr><td style="padding:8px">${cols[7]}</td><td style="padding:8px">~${a.humaneval}%</td><td style="padding:8px">~${b.humaneval}%</td></tr>
<tr><td style="padding:8px">${cols[8]}</td><td style="padding:8px">${a.lmarena}</td><td style="padding:8px">${b.lmarena}</td></tr>
<tr><td style="padding:8px">${cols[9]}</td><td style="padding:8px">${a.open ? yes : no}</td><td style="padding:8px">${b.open ? yes : no}</td></tr>
<tr><td style="padding:8px">${cols[10]}</td><td style="padding:8px">${a.capabilities.join(', ')}</td><td style="padding:8px">${b.capabilities.join(', ')}</td></tr>
</tbody>
</table>`;
}

function faqJson(a, b, locale) {
  const cheaper = pickWinner(a, b, 'input', true);
  const longer = pickWinner(a, b, 'context');
  const swe = pickWinner(a, b, 'swebench');
  const lo = locale === 'zh' ? a.zh : a.en;
  const lo2 = locale === 'zh' ? b.zh : b.en;
  let cases;
  if (locale === 'zh') {
    cases = [
      { q: `${a.name} 和 ${b.name} 哪个便宜？`, a: cheaper ? `${cheaper.name} 更便宜，输入 ${fmtMoney(cheaper.input)} / 输出 ${fmtMoney(cheaper.output)} 每百万 token，对比 ${fmtMoney(cheaper === a ? b.input : a.input)} / ${fmtMoney(cheaper === a ? b.output : a.output)}。` : '两者输入价相同。' },
      { q: '哪个上下文窗口更大？', a: longer ? `${longer.name} 支持 ${fmtCtx(longer.context)} 上下文，对比 ${fmtCtx(longer === a ? b.context : a.context)}。` : '两者上下文窗口相同。' },
      { q: '哪个更适合写代码 agent？', a: swe ? `${swe.name} SWE-bench Verified 更高（~${swe.swebench}% vs ~${swe === a ? b.swebench : a.swebench}%）。工具调用稳定性通常和 SWE-bench 正相关。` : '两者 SWE-bench 接近。' },
      { q: `什么时候选 ${a.name}？`, a: `${lo.bestFor} 优势：${lo.strengths}` },
      { q: `什么时候选 ${b.name}？`, a: `${lo2.bestFor} 优势：${lo2.strengths}` },
    ];
  } else {
    cases = [
      { q: `Which is cheaper, ${a.name} or ${b.name}?`, a: cheaper ? `${cheaper.name} is cheaper at ${fmtMoney(cheaper.input)} input / ${fmtMoney(cheaper.output)} output per 1M tokens, vs ${fmtMoney(cheaper === a ? b.input : a.input)} / ${fmtMoney(cheaper === a ? b.output : a.output)}.` : 'Both list at the same input price.' },
      { q: 'Which has longer context?', a: longer ? `${longer.name} supports ${fmtCtx(longer.context)} context vs ${fmtCtx(longer === a ? b.context : a.context)}.` : 'Both support the same context window.' },
      { q: 'Which is better for coding agents?', a: swe ? `${swe.name} scores higher on SWE-bench Verified (~${swe.swebench}% vs ~${swe === a ? b.swebench : a.swebench}%). Tool-use stability also favors the higher SWE-bench scorer in most cases.` : 'Both score similarly on SWE-bench Verified.' },
      { q: `When should I pick ${a.name}?`, a: `${lo.bestFor} Strengths: ${lo.strengths}` },
      { q: `When should I pick ${b.name}?`, a: `${lo2.bestFor} Strengths: ${lo2.strengths}` },
    ];
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en',
    mainEntity: cases.map((c) => ({ '@type': 'Question', name: c.q, acceptedAnswer: { '@type': 'Answer', text: c.a } })),
  });
}

function articleJson(a, b, title, locale, desc) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en',
    headline: title,
    description: desc,
    datePublished: '2026-05-10',
    dateModified: '2026-05-10',
    author: { '@type': 'Organization', name: 'Check.AI' },
    publisher: { '@type': 'Organization', name: 'Check.AI', url: 'https://checkaimodels.com/' },
  });
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function pageHtml(a, b, locale) {
  const t = T[locale];
  const slug = slugPair(a, b);
  const isZh = locale === 'zh';
  const lang = isZh ? 'zh-CN' : 'en';
  const path = isZh ? `/zh/compare/${slug}/` : `/compare/${slug}/`;
  const url = `https://checkaimodels.com${path}`;
  const altPath = isZh ? `/compare/${slug}/` : `/zh/compare/${slug}/`;
  const altUrl = `https://checkaimodels.com${altPath}`;
  const navHtml = isZh
    ? `<a href="/zh/">中文首页</a><a href="/">对比工具</a><a href="/zh/about/">关于</a><a href="/contact">联系</a><a href="${altPath}">EN</a>`
    : `<a href="/">Compare</a><a href="/about">About</a><a href="/privacy.html">Privacy</a><a href="/contact">Contact</a><a href="${altPath}">中文</a>`;
  const title = isZh
    ? `${a.name} vs ${b.name}：价格、上下文、跑分对比（2026）`
    : `${a.name} vs ${b.name}: Price, Context, Benchmarks (2026)`;
  const desc = isZh
    ? `${a.name} 与 ${b.name} 并排对比：API 价格、上下文窗口、SWE-bench / HumanEval / LMArena 跑分、各自最适合的场景。`
    : `Side-by-side: ${a.name} vs ${b.name}. Compare API pricing, context window, SWE-bench / HumanEval / LMArena scores, and which model wins on which task.`;
  const compareUrl = `/?compare=${a.platform}:${a.id},${b.platform}:${b.id}`;
  const lo = isZh ? a.zh : a.en;
  const lo2 = isZh ? b.zh : b.en;
  const ogTitle = isZh ? `${a.name} vs ${b.name}（2026）` : title;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title} | Check.AI</title>
<meta name="description" content="${escAttr(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="${isZh ? 'zh' : 'en'}" href="${url}">
<link rel="alternate" hreflang="${isZh ? 'en' : 'zh'}" href="${altUrl}">
<link rel="alternate" hreflang="x-default" href="${isZh ? altUrl : url}">
<meta property="og:title" content="${escAttr(ogTitle)}">
<meta property="og:description" content="${escAttr(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<link rel="stylesheet" href="/styles.css?v=20260514-2">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">${articleJson(a, b, title, locale, desc)}</script>
<script type="application/ld+json">${faqJson(a, b, locale)}</script>
</head>
<body class="seo-page">
<header class="seo-header"><a class="brand-link" href="${isZh ? '/zh/' : '/'}">Check.AI</a><nav>${navHtml}</nav></header>
<main class="seo-main">
<p class="eyebrow">${t.eyebrow}</p>
<h1>${title}</h1>
<p class="seo-lead">${t.leadIntro(a, b)}</p>

<section class="seo-card">
<h2>${t.verdict}</h2>
<ul>
${tldr(a, b, t)}
</ul>
<p><a class="section-link" href="${compareUrl}">${t.openTool}</a></p>
</section>

<section class="seo-card">
<h2>${t.specsHead}</h2>
${specTable(a, b, t, locale)}
<p style="margin-top:12px;font-size:13px;color:var(--muted)">${t.sourceLine(a, b)}</p>
</section>

<section class="seo-card">
<h2>${t.perModelHead(a)}</h2>
<p><strong>${t.strengths}</strong> ${lo.strengths}</p>
<p><strong>${t.weaknesses}</strong> ${lo.weaknesses}</p>
<p><strong>${t.bestForLabel}</strong> ${lo.bestFor}</p>
</section>

<section class="seo-card">
<h2>${t.perModelHead(b)}</h2>
<p><strong>${t.strengths}</strong> ${lo2.strengths}</p>
<p><strong>${t.weaknesses}</strong> ${lo2.weaknesses}</p>
<p><strong>${t.bestForLabel}</strong> ${lo2.bestFor}</p>
</section>

<section class="seo-card">
<h2>${t.decideHead}</h2>
${t.pickIf(a)}
${t.pickIf(b)}
${t.bothLine}
</section>

<section class="seo-card">
<h2>${t.tryHead}</h2>
${t.tryBody(a, b, compareUrl)}
</section>

<section class="seo-card">
<h2>${t.relatedHead}</h2>
${t.related}
</section>

</main>
<footer class="seo-footer">${t.footer}</footer>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "df6bb0324e4c458fb4e8b979d3feed3c"}'></script>
</body>
</html>
`;
}

function ensureDir(p) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }

function main() {
  const sorted = [...MODELS].sort((x, y) => x.slug.localeCompare(y.slug));
  let count = 0;
  const urls = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i], b = sorted[j];
      const slug = slugPair(a, b);
      // English
      ensureDir(`compare/${slug}`);
      writeFileSync(`compare/${slug}/index.html`, pageHtml(a, b, 'en'));
      urls.push({ loc: `https://checkaimodels.com/compare/${slug}/`, prio: '0.7' });
      // Chinese
      ensureDir(`zh/compare/${slug}`);
      writeFileSync(`zh/compare/${slug}/index.html`, pageHtml(a, b, 'zh'));
      urls.push({ loc: `https://checkaimodels.com/zh/compare/${slug}/`, prio: '0.7' });
      count += 2;
    }
  }
  console.log(`[build-compare] wrote ${count} pages (en + zh)`);
  for (const u of urls) {
    console.log(`  <url><loc>${u.loc}</loc><lastmod>2026-05-10</lastmod><changefreq>monthly</changefreq><priority>${u.prio}</priority></url>`);
  }
}

main();
