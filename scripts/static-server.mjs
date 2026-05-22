#!/usr/bin/env node
// Zero-dependency static file server for local dev + e2e tests. Serves the repo
// root so the SPA can fetch /data/models-dev.json the same way it does in prod.
// Cross-platform (Windows + Linux CI) — used as Playwright's webServer.
// Run: node scripts/static-server.mjs [port]

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize, sep } from 'node:path';

const ROOT = process.cwd();
const PORT = Number(process.argv[2]) || 8799;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = normalize(join(ROOT, pathname));
    // Path traversal guard: resolved file must stay inside ROOT.
    if (file !== ROOT && !file.startsWith(ROOT + sep)) {
      res.writeHead(403, { 'content-type': 'text/plain' }).end('Forbidden');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
  }
}).listen(PORT, () => console.log(`[static-server] http://localhost:${PORT} serving ${ROOT}`));
