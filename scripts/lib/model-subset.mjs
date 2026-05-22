// Shared rule for which model pages are indexable (rich + in sitemap) vs the
// noindex long tail. Pure functions so build-model-pages and build-sitemap agree.

export const MAJOR_BRANDS = new Set([
  'openai', 'anthropic', 'google', 'deepseek', 'xai', 'qwen', 'alibaba',
  'mistral', 'meta', 'llama', 'moonshot', 'zhipu',
]);

const TOP_PER_BRAND = 4;
const RECENT_MONTHS = 9;
const HARD_CAP = 25; // conservative start; raise to 80 after GSC confirms these index cleanly

// A context/capability-derived score (mirrors the SPA's quality heuristic so
// ranking is consistent). data/models.json has no stored quality field.
export function qualityProxy(listing) {
  const ctx = Number(listing?.limit?.context ?? 0);
  const caps = listing?.capabilities || [];
  const ctxBoost = ctx > 0 ? Math.min(12, Math.round(Math.log10(ctx) * 2)) : 0;
  const reasoning = caps.includes('reasoning') ? 6 : 0;
  const tools = caps.includes('tools') ? 3 : 0;
  return Math.max(60, Math.min(98, 70 + ctxBoost + reasoning + tools));
}

function bestOf(group) {
  return [...group.listings].sort(
    (a, b) => (a.price?.input ?? Infinity) - (b.price?.input ?? Infinity),
  )[0];
}

function brandOf(group) {
  return bestOf(group).platform;
}

function isRecent(group) {
  const d = Date.parse(bestOf(group).release_date || '');
  if (Number.isNaN(d)) return false;
  const cutoff = Date.now() - RECENT_MONTHS * 30 * 24 * 60 * 60 * 1000;
  return d >= cutoff;
}

// Returns the Set of slugs that are indexable, computed once over all groups.
export function indexableSlugs(allGroups) {
  const byBrand = new Map();
  for (const g of allGroups) {
    const brand = brandOf(g);
    if (!MAJOR_BRANDS.has(brand)) continue;
    if (!byBrand.has(brand)) byBrand.set(brand, []);
    byBrand.get(brand).push(g);
  }
  const picked = new Set();
  for (const [, groups] of byBrand) {
    const ranked = [...groups].sort((a, b) => qualityProxy(bestOf(b)) - qualityProxy(bestOf(a)));
    ranked.forEach((g, i) => { if (i < TOP_PER_BRAND || isRecent(g)) picked.add(g.slug); });
  }
  // Hard cap: keep highest quality across the picked set.
  if (picked.size > HARD_CAP) {
    const ordered = allGroups
      .filter((g) => picked.has(g.slug))
      .sort((a, b) => qualityProxy(bestOf(b)) - qualityProxy(bestOf(a)))
      .slice(0, HARD_CAP)
      .map((g) => g.slug);
    return new Set(ordered);
  }
  return picked;
}

// Convenience single-group check (used by tests). O(n) per call — for bulk use
// indexableSlugs(allGroups) once instead.
export function isIndexable(group, allGroups) {
  return indexableSlugs(allGroups).has(group.slug);
}
