// Shared rule for which model pages are indexable (rich + in sitemap) vs the
// noindex long tail. Pure functions so build-model-pages and build-sitemap agree.
//
// Selection = flagship allowlist (A) + noise exclusion (B), then newest-N per
// brand, capped. Matching is on the canonical NAME, not the platform: a model's
// cheapest listing often sits on an aggregator/cloud (e.g. Claude Opus on Vertex),
// so platform is an unreliable brand signal.

export const MAJOR_BRANDS = new Set([
  'openai', 'anthropic', 'google', 'deepseek', 'xai', 'qwen', 'alibaba',
  'mistral', 'meta', 'llama', 'moonshot', 'zhipu', 'minimax',
]);

const PER_BRAND = 3;   // newest flagships kept per brand
const HARD_CAP = 25;   // conservative start; raise after GSC confirms clean indexing

// (A) Flagship name patterns — the current-generation models people actually
// search for. Specific to this gen so older/niche variants fall out naturally.
const FLAGSHIP = [
  /^gpt-5(\.\d)?( pro| chat)?( \(latest\))?$/,            // GPT-5, 5.x, 5.x Pro/Chat
  /^claude (opus|sonnet|haiku) 4(\.\d)?( \(latest\))?$/,  // Claude 4.x
  /^gemini 3(\.\d)? (pro|flash)( preview)?$/,             // Gemini 3.x Pro/Flash
  /^gemini 2\.5 (pro|flash)$/,                            // Gemini 2.5 Pro/Flash
  /^deepseek (v[34](\.\d)?|r\d|reasoner|chat)( pro| flash)?$/, // DeepSeek V3/V4/R1
  /^grok 4(\.\d+)?( \((reasoning|non-reasoning|multi-agent)\))?$/, // Grok 4.x
  /^qwen3(\.\d)? (max|plus)( preview)?$/,                 // Qwen3.x Max/Plus
  /^qwen3(\.\d)? coder( plus| next)?$/,                   // Qwen3 Coder
  /^mistral (large|medium) \d(\.\d)?$/,                   // Mistral Large/Medium
  /^(moonshot )?kimi k2(\.\d)?( thinking)?$/,             // Kimi K2.x
  /^glm-[45](\.\d)?$/,                                    // GLM-5 / 5.1 / 4.7
  /^minimax-m\d(\.\d)?$/i,                                // MiniMax M2.x
  /^llama[\s-]?4[\s-](maverick|scout)/,                   // Llama 4 Maverick/Scout
];

// (B) Noise: non-chat modalities and quantization/host variants. Deliberately
// NOT excluding pro/max/mini/turbo/lite/preview — those can be legit flagships.
const NOISE = /tts|realtime|image|imagen|video|imagine|embed|ocr|asr|\bvl\b|-vl|omni|distill|\bfp8\b|\bawq\b|\bint[48]\b|cerebras|\bgroq\b|\boss\b|whisper|transcrib|rerank|guard|moderation|nano.?banana|character|\bmath\b|spark|build|gemma|qvq|qwq|\bmt\b|-mt\b|doc turbo/i;

function bestOf(group) {
  return [...group.listings].sort(
    (a, b) => (a.price?.input ?? Infinity) - (b.price?.input ?? Infinity),
  )[0];
}

// A context/capability-derived score (mirrors the SPA's quality heuristic).
// Kept for tie-breaking and back-compat with callers/tests.
export function qualityProxy(listing) {
  const ctx = Number(listing?.limit?.context ?? 0);
  const caps = listing?.capabilities || [];
  const ctxBoost = ctx > 0 ? Math.min(12, Math.round(Math.log10(ctx) * 2)) : 0;
  const reasoning = caps.includes('reasoning') ? 6 : 0;
  const tools = caps.includes('tools') ? 3 : 0;
  return Math.max(60, Math.min(98, 70 + ctxBoost + reasoning + tools));
}

// True if the model NAME is a current-gen flagship and not a non-chat variant.
export function isFlagship(name) {
  const n = String(name || '').toLowerCase().trim();
  if (!n) return false;
  if (NOISE.test(n)) return false;
  return FLAGSHIP.some((re) => re.test(n));
}

// Brand inferred from the name (platform is unreliable across providers).
export function brandOfName(name) {
  const n = String(name || '').toLowerCase();
  if (/^gpt-|^o\d/.test(n)) return 'openai';
  if (/claude/.test(n)) return 'anthropic';
  if (/gemini/.test(n)) return 'google';
  if (/deepseek/.test(n)) return 'deepseek';
  if (/grok/.test(n)) return 'xai';
  if (/qwen/.test(n)) return 'qwen';
  if (/mistral|devstral/.test(n)) return 'mistral';
  if (/kimi|moonshot/.test(n)) return 'moonshot';
  if (/glm/.test(n)) return 'zhipu';
  if (/minimax/.test(n)) return 'minimax';
  if (/llama/.test(n)) return 'meta';
  return 'other';
}

// Family key to dedupe near-identical variants (e.g. "Gemini 3.1 Pro Preview"
// vs "...Custom Tools") so they don't both eat a slot. Keeps the version.
function familyKey(name) {
  return String(name || '').toLowerCase()
    .replace(/\(latest\)|preview|custom tools|non-reasoning|reasoning|multi-agent|thinking|chat|moonshot/g, '')
    .replace(/[()]/g, '')
    .replace(/[\s\-_.]+/g, ' ')
    .trim();
}

function recencyScore(group) {
  const d = Date.parse(bestOf(group)?.release_date || '');
  return Number.isNaN(d) ? 0 : d;
}

// Returns the Set of slugs that are indexable, computed once over all groups.
export function indexableSlugs(allGroups) {
  const flagships = allGroups.filter((g) => isFlagship(g.displayName));
  // Group by brand, keep the newest PER_BRAND (dedupe variant families).
  const byBrand = new Map();
  for (const g of flagships) {
    const b = brandOfName(g.displayName);
    if (!byBrand.has(b)) byBrand.set(b, []);
    byBrand.get(b).push(g);
  }
  const picked = [];
  for (const [, groups] of byBrand) {
    groups.sort((a, b) => recencyScore(b) - recencyScore(a) || qualityProxy(bestOf(b)) - qualityProxy(bestOf(a)));
    const seen = new Set();
    for (const g of groups) {
      const key = familyKey(g.displayName);
      if (seen.has(key)) continue;
      seen.add(key);
      picked.push(g);
      if (seen.size >= PER_BRAND) break;
    }
  }
  // Global cap: newest first across brands.
  picked.sort((a, b) => recencyScore(b) - recencyScore(a) || qualityProxy(bestOf(b)) - qualityProxy(bestOf(a)));
  return new Set(picked.slice(0, HARD_CAP).map((g) => g.slug));
}

// Convenience single-group check (used by tests). O(n) per call — for bulk use
// indexableSlugs(allGroups) once instead.
export function isIndexable(group, allGroups) {
  return indexableSlugs(allGroups).has(group.slug);
}
