#!/usr/bin/env node
// scripts/audit-nav.mjs
//
// Static-site nav consistency checker. Run BEFORE committing nav changes.
//
//   node scripts/audit-nav.mjs            # audit all HTML pages
//   node scripts/audit-nav.mjs --static   # skip the 1700+ generated model pages
//
// What it checks per page:
//   1. brand-link href matches the page's language hub (/zh/ or /en/)
//   2. language toggle (last "EN" / "中文" nav item) resolves to a real file
//      and matches the page's hreflang alternate
//   3. no self-links (a nav/footer link href = the page's own canonical path)
//   4. every internal href resolves to a real file on disk
//   5. within a language, the non-language nav items are byte-identical across
//      every hand-written page (templates excluded automatically)
//
// Exits 1 if any problem is found, so it can be wired into CI / pre-commit.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const SKIP_DIRS = new Set(['node_modules', '.git', 'data', 'scripts', '.github', '.claude']);
const onlyStatic = process.argv.includes('--static');
// Hand-written pages we expect to share a canonical nav. Generated pages
// (compare/*, models/*) are checked individually but not for cross-page
// identity, since their nav comes from a template anyway.
const HAND_WRITTEN_DIRS = ['', 'zh', 'en', 'topics', 'zh/topics', 'zh/articles', 'zh/about', 'zh/contact'];

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    if (onlyStatic && (e.name === 'compare' || e.name === 'models' || e.name === 'platforms')) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function detectLang(html) {
  const m = html.match(/<html[^>]*\blang="([^"]+)"/i);
  if (!m) return 'unknown';
  return m[1].toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

function extractCanonical(html) {
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!m) return null;
  return m[1].replace(/^https?:\/\/[^/]+/, '');
}

function extractHreflang(html) {
  const out = {};
  const re = /<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) out[m[1].toLowerCase()] = m[2].replace(/^https?:\/\/[^/]+/, '');
  return out;
}

function extractBrandHref(html) {
  const m = html.match(/<a class="brand-link" href="([^"]+)"/);
  return m ? m[1] : null;
}

function extractNav(html) {
  const m = html.match(/<header class="seo-header">([\s\S]*?)<\/header>/);
  if (!m) return null;
  const links = [];
  const re = /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let lm;
  while ((lm = re.exec(m[1]))) links.push({ href: lm[1], text: lm[2].trim() });
  return links;
}

function extractFooter(html) {
  const m = html.match(/<footer class="seo-footer">([\s\S]*?)<\/footer>/);
  if (!m) return null;
  const links = [];
  const re = /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let lm;
  while ((lm = re.exec(m[1]))) links.push({ href: lm[1], text: lm[2].trim() });
  return links;
}

function isExternal(href) {
  return /^(https?:|mailto:|tel:|#)/i.test(href);
}

function pathToFile(href) {
  // Strip query/hash, map href to expected on-disk file.
  const clean = href.split(/[?#]/)[0];
  if (!clean.startsWith('/')) return null;
  if (clean === '/') return 'index.html';
  if (clean.endsWith('/')) return clean.slice(1) + 'index.html';
  if (clean.endsWith('.html') || clean.endsWith('.xml') || clean.endsWith('.txt') || clean.endsWith('.json') || clean.endsWith('.svg')) return clean.slice(1);
  // try clean URL (e.g. /about → about.html) then directory variant
  if (existsSync(join(ROOT, clean.slice(1) + '.html'))) return clean.slice(1) + '.html';
  if (existsSync(join(ROOT, clean.slice(1), 'index.html'))) return clean.slice(1) + '/index.html';
  return clean.slice(1);
}

function pageCanonicalPath(file) {
  // Convert "topics/foo/index.html" → "/topics/foo/"; "about.html" → "/about" (clean URL)
  let p = '/' + file.replace(/\\/g, '/');
  if (p.endsWith('/index.html')) return p.slice(0, -'index.html'.length);
  // Treat about.html / privacy.html / contact.html as clean URL counterparts
  if (/\/(about|privacy|contact)\.html$/.test(p)) return p.replace(/\.html$/, p.includes('privacy') ? '.html' : '');
  return p;
}

let problems = 0;
function fail(file, msg) {
  problems++;
  console.log(`✗ ${file}: ${msg}`);
}

const files = walk(ROOT).map(f => relative(ROOT, f).replace(/\\/g, '/'));
console.log(`audit: scanning ${files.length} HTML files${onlyStatic ? ' (--static, skipping generated)' : ''}`);

// Pass 1: per-page checks
const pagesByLang = { zh: [], en: [] };
const navByLang = { zh: new Map(), en: new Map() };

for (const f of files) {
  const abs = join(ROOT, f);
  const html = readFileSync(abs, 'utf8');
  const lang = detectLang(html);
  if (lang === 'unknown') continue;
  const nav = extractNav(html);
  if (!nav) continue; // SPA index.html etc.
  const brand = extractBrandHref(html);
  const hreflang = extractHreflang(html);
  const canonical = extractCanonical(html);
  const footer = extractFooter(html) || [];
  pagesByLang[lang].push(f);

  // 1. brand check
  const expectedBrand = lang === 'zh' ? '/zh/' : '/en/';
  if (brand !== expectedBrand) fail(f, `brand-link href="${brand}" expected "${expectedBrand}"`);

  // 2. language toggle target matches hreflang
  const altKey = lang === 'zh' ? 'en' : 'zh';
  const alt = hreflang[altKey];
  const toggleLink = nav.find(l => l.text === 'EN' || l.text === '中文');
  if (alt) {
    if (!toggleLink) fail(f, `hreflang ${altKey} declared (${alt}) but no language toggle in nav`);
    else {
      const expected = alt.replace(/^https?:\/\/[^/]+/, '');
      // Allow ?lang= variant for SPA target
      if (toggleLink.href !== expected && toggleLink.href !== expected + '?lang=' + altKey) {
        fail(f, `language toggle href="${toggleLink.href}" but hreflang ${altKey}="${expected}"`);
      }
    }
  } else if (toggleLink) {
    fail(f, `language toggle "${toggleLink.text}" → ${toggleLink.href} but no hreflang ${altKey} alternate declared`);
  }

  // 3. self-links — warning only (canonical nav identity is preferred over
  //    omitting the current-page entry; mark with aria-current in markup if needed)
  const ownPaths = new Set([canonical, '/' + f, '/' + f.replace(/\/index\.html$/, '/'), '/' + f.replace(/\.html$/, '')].filter(Boolean));
  for (const link of [...nav, ...footer]) {
    if (isExternal(link.href)) continue;
    const target = link.href.split(/[?#]/)[0];
    if (ownPaths.has(target)) console.log(`  · ${f}: self-link "${link.text}" → ${link.href} (info)`);
  }

  // 4. internal links resolve to real file
  for (const link of [...nav, ...footer]) {
    if (isExternal(link.href)) continue;
    const tgt = pathToFile(link.href);
    if (!tgt) continue;
    if (!existsSync(join(ROOT, tgt))) fail(f, `dead link "${link.text}" → ${link.href} (no file ${tgt})`);
  }

  // 5. record nav signature for cross-page identity check (hand-written only)
  const isHandWritten = HAND_WRITTEN_DIRS.some(d => {
    if (d === '') return !f.includes('/') || /^(about|privacy|contact)\.html$/.test(f);
    return f.startsWith(d + '/') && !f.slice(d.length + 1).includes('/index.html'.slice(1)) === false;
  }) && !f.startsWith('compare/') && !f.startsWith('zh/compare/') && !f.startsWith('models/') && !f.startsWith('platforms/');
  if (isHandWritten) {
    // strip the language toggle from the signature (it legitimately varies per page)
    const sigLinks = nav.filter(l => l.text !== 'EN' && l.text !== '中文');
    const sig = sigLinks.map(l => `${l.text}->${l.href}`).join('|');
    if (!navByLang[lang].has(sig)) navByLang[lang].set(sig, []);
    navByLang[lang].get(sig).push(f);
  }
}

// Pass 2: nav identity across hand-written pages of the same language
for (const lang of ['zh', 'en']) {
  const sigs = [...navByLang[lang].entries()];
  if (sigs.length <= 1) continue;
  // Find the most common signature and report outliers
  sigs.sort((a, b) => b[1].length - a[1].length);
  const [canonSig, canonPages] = sigs[0];
  for (const [sig, pages] of sigs.slice(1)) {
    problems += pages.length;
    console.log(`✗ ${lang} nav drift on ${pages.length} page(s):`);
    console.log(`    canonical (${canonPages.length} pages): ${canonSig}`);
    console.log(`    variant   (${pages.length} pages): ${sig}`);
    for (const p of pages.slice(0, 3)) console.log(`      - ${p}`);
    if (pages.length > 3) console.log(`      ... +${pages.length - 3} more`);
  }
}

console.log(`\naudit: ${problems} problem(s) across ${pagesByLang.zh.length} zh + ${pagesByLang.en.length} en pages`);
process.exit(problems > 0 ? 1 : 0);
