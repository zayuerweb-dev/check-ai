#!/usr/bin/env node
// Rebuild sitemap.xml from the filesystem. Discovers every index.html (and the
// top-level .html files) under the repo root, maps them to canonical URLs,
// applies sensible <priority>/<changefreq> values, and writes sitemap.xml.
// Run: node scripts/build-sitemap.mjs

import { readdirSync, writeFileSync, statSync, appendFileSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const ORIGIN = 'https://checkaimodels.com';
// Top-level static .html files we want indexed.
const TOP_LEVEL_HTML = ['index.html', 'about.html', 'contact.html', 'privacy.html'];
// Directories to walk for index.html pages.
// /models/ (1715 programmatic pages) is intentionally EXCLUDED. Submitting
// 1700+ near-identical template pages on a 0-authority domain starves crawl
// budget and trips Google's thin-content classifier, suppressing indexing of
// the whole site. Model pages stay live + crawlable via internal links but are
// noindex'd and kept out of the sitemap, so Google concentrates its budget on
// the ~85 high-value editorial/compare/topic pages.
const WALK_DIRS = ['topics', 'platforms', 'compare', 'zh', 'en'];
// Anything matching these is skipped.
const SKIP = new Set(['node_modules', '.git', '.github', 'data', 'scripts']);

function walk(dir, out) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (SKIP.has(e.name) || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && e.name === 'index.html') out.push(p);
  }
}

function urlFromPath(absPath) {
  const rel = relative(ROOT, absPath).replace(/\\/g, '/');
  if (rel === 'index.html') return `${ORIGIN}/`;
  if (rel.endsWith('/index.html')) return `${ORIGIN}/${rel.slice(0, -'/index.html'.length)}/`;
  // Top-level static pages (about.html etc.) 308-redirect to extensionless
  // clean URLs on Cloudflare Pages. Emit the canonical /about form so the
  // sitemap never lists redirecting URLs (Google flags those).
  if (/^[a-z0-9-]+\.html$/.test(rel)) return `${ORIGIN}/${rel.slice(0, -'.html'.length)}`;
  return `${ORIGIN}/${rel}`;
}

function priorityFor(url) {
  const path = url.replace(ORIGIN, '');
  if (path === '/' || path === '/zh/' || path === '/en/') return { p: '0.9', cf: 'weekly' };
  if (path.startsWith('/zh/articles/') || path.startsWith('/articles/') || path.startsWith('/en/articles/')) return { p: '0.9', cf: 'monthly' };
  if (path.startsWith('/topics/') || path.startsWith('/zh/topics/')) return { p: '0.8', cf: 'weekly' };
  if (path.startsWith('/compare/') || path.startsWith('/zh/compare/')) return { p: '0.7', cf: 'monthly' };
  if (path.startsWith('/models/')) return { p: '0.6', cf: 'weekly' };
  if (path.startsWith('/platforms/')) return { p: '0.7', cf: 'weekly' };
  return { p: '0.6', cf: 'monthly' };
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function main() {
  const files = [];
  for (const f of TOP_LEVEL_HTML) {
    const p = join(ROOT, f);
    try { if (statSync(p).isFile()) files.push(p); } catch {}
  }
  for (const d of WALK_DIRS) {
    walk(join(ROOT, d), files);
  }

  // Include ONLY the indexable model subset (data/model-slugs.json), never the
  // noindex long tail. Keeps crawl budget on high-value pages.
  let modelUrls = [];
  try {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'data', 'model-slugs.json'), 'utf8'));
    modelUrls = manifest.filter((m) => m.indexable).map((m) => `${ORIGIN}/models/${m.slug}/`);
  } catch { /* manifest absent on first run — skip */ }

  const allUrls = [...new Set([...files.map(urlFromPath), ...modelUrls])].sort();
  // Drop the bare /zh/ hub — it is now a markerless redirect stub to /.
  // Article/topic/compare pages under /zh/ are kept.
  const urls = allUrls.filter((u) => u !== `${ORIGIN}/zh/`);
  const lastmod = todayISO();

  const entries = urls.map((u) => {
    const { p, cf } = priorityFor(u);
    return `  <url><loc>${u}</loc><lastmod>${lastmod}</lastmod><changefreq>${cf}</changefreq><priority>${p}</priority></url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  writeFileSync(join(ROOT, 'sitemap.xml'), sitemap);
  console.log(`[build-sitemap] wrote ${urls.length} URLs to sitemap.xml`);

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `url_count=${urls.length}\n`);
  }
}

main();
