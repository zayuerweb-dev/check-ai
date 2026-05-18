#!/usr/bin/env node
// Submit all sitemap URLs to IndexNow (Bing + Yandex + Naver + Seznam).
// IndexNow is a real-time index protocol: instead of waiting for crawlers to
// re-discover the site, we ping "these URLs changed, come crawl them now".
// Google does NOT use IndexNow; this is purely a Bing/Yandex accelerator.
//
// Key verification: IndexNow requires a {key}.txt file hosted at the site root
// containing the key. That file lives at repo root and deploys with the site.
//
// Run: node scripts/indexnow-ping.mjs
// CI: invoked after every deploy that changes sitemap.xml.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const HOST = 'checkaimodels.com';
const KEY = '07697af45b929e55c9c6a134bf7926cb';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function sitemapUrls() {
  const xml = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const urlList = sitemapUrls();
  if (urlList.length === 0) {
    console.log('[indexnow] no URLs in sitemap, skipping');
    return;
  }
  // IndexNow accepts up to 10,000 URLs per request.
  const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  // 200 = accepted, 202 = accepted (pending), 422 = URLs don't match host/key
  console.log(`[indexnow] submitted ${urlList.length} URLs -> HTTP ${res.status}`);
  if (res.status >= 400) {
    const body = await res.text().catch(() => '');
    console.log(`[indexnow] response body: ${body.slice(0, 300)}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('[indexnow] failed:', e.message);
  process.exit(1);
});
