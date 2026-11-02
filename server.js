// Serveur HTTP ultra-léger et ultra-rapide pour FemCurrent
// -----------------------------------------------------------------------------
// Correctifs appliqués (audit sécurité) :
//   S1 — refus de toute résolution de chemin hors de la racine (path traversal) -> 403
//   S2 — 404 réelle pour les assets inexistants (fin des soft-404 en 200 + HTML)
//   S3 — compression gzip/deflate + en-têtes de sécurité + politique de cache
//   S4 — Content-Security-Policy réelle : nonce par requête injecté dans le
//        HTML servi (<style>/<script>), donc PLUS de 'unsafe-inline'.
// -----------------------------------------------------------------------------
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

// Marqueur présent dans index.html, remplacé par le nonce à chaque réponse.
const NONCE_TOKEN = '__CSP_NONCE__';

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=UTF-8',
  '.xml': 'application/xml; charset=UTF-8',
  '.webmanifest': 'application/manifest+json; charset=UTF-8'
};

// S2 : une URL portant une de ces extensions est un asset. Si le fichier
// n'existe pas, on répond 404 au lieu de renvoyer index.html en 200.
const ASSET_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif',
  '.css', '.js', '.mjs', '.json', '.map', '.woff', '.woff2', '.ttf', '.otf', '.eot'
]);

// S3 : types pour lesquels la compression est pertinente
const COMPRESSIBLE = new Set([
  'text/html', 'text/css', 'text/plain', 'text/xml', 'application/xml',
  'application/javascript', 'application/json', 'application/manifest+json',
  'image/svg+xml'
]);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

/* S4 · Politique CSP. Le site est un SPA monofichier : CSS et JS sont inline.
   Un nonce non prévisible par requête protège les balises <script> et <style>.
   Les 457 attributs style="…" encore présents dans le HTML nécessitent
   temporairement style-src-attr 'unsafe-inline' (directive limitée aux
   attributs CSS; script-src reste sans unsafe-inline). À supprimer après
   migration de ces styles vers des classes CSS.
   Les gestionnaires inline du type onclick= ont été retirés du HTML pour la
   même raison ; ils sont désormais attachés en JS (bindCommon). */
function cspHeader(nonce) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self' https://admin.femcurrent.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'"
  ].join('; ');
}

function makeNonce() { return crypto.randomBytes(18).toString('base64'); }

// S3 : cache — index.html toujours revalidé ; seuls /public/** et /logo/**
// bénéficient d'un cache long (ce sont des assets statiques).
function cacheControlFor(urlPath, ext) {
  if (ext === '.html' || ext === '') return 'no-cache';
  if (urlPath.startsWith('/public/') || urlPath.startsWith('/logo/')) return 'public, max-age=31536000, immutable';
  return 'no-cache';
}

function send(res, status, buf, contentType, cacheControl, acceptEncoding, isHead, nonce) {
  const baseType = contentType.split(';')[0].trim();
  let encoding = null;
  if (buf.length > 1024 && COMPRESSIBLE.has(baseType)) {
    const ae = (acceptEncoding || '').toLowerCase();
    if (ae.includes('gzip')) encoding = 'gzip';
    else if (ae.includes('deflate')) encoding = 'deflate';
  }

  const headers = Object.assign({}, SECURITY_HEADERS, {
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
    'Vary': 'Accept-Encoding'
  });
  // S4 : la CSP n'a de sens que sur les documents HTML
  if (nonce) headers['Content-Security-Policy'] = cspHeader(nonce);

  const finish = (body, enc) => {
    if (enc) headers['Content-Encoding'] = enc;
    headers['Content-Length'] = Buffer.isBuffer(body) ? body.length : Buffer.byteLength(body);
    res.writeHead(status, headers);
    res.end(isHead ? undefined : body);
  };

  if (!encoding) return finish(buf, null);
  const compress = encoding === 'gzip' ? zlib.gzip : zlib.deflate;
  compress(buf, { level: 6 }, (err, out) => {
    if (err || !out || out.length >= buf.length) return finish(buf, null);
    finish(out, encoding);
  });
}

const server = http.createServer((req, res) => {
  const method = req.method || 'GET';
  // S4 : un nonce cryptographique par requête
  let nonce = makeNonce();

  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, Object.assign({ 'Content-Type': 'text/plain; charset=UTF-8', 'Allow': 'GET, HEAD' }, SECURITY_HEADERS));
    return res.end('405 Method Not Allowed');
  }

  let urlPath = (req.url || '/').split('?')[0];
  try {
    urlPath = decodeURIComponent(urlPath);
  } catch (e) {
    res.writeHead(400, Object.assign({ 'Content-Type': 'text/plain; charset=UTF-8' }, SECURITY_HEADERS));
    return res.end('400 Bad Request');
  }
  // Caractère nul : jamais accepté dans un chemin
  if (urlPath.indexOf('\0') !== -1) {
    res.writeHead(400, Object.assign({ 'Content-Type': 'text/plain; charset=UTF-8' }, SECURITY_HEADERS));
    return res.end('400 Bad Request');
  }

  // S1 : résolution confinée à la racine du projet.
  // '.' + urlPath garantit que tout reste relatif à ROOT, puis on vérifie
  // que le chemin obtenu est bien ROOT lui-même ou l'un de ses descendants.
  const target = urlPath === '/' ? '/index.html' : urlPath;
  let resolved;
  try {
    resolved = path.resolve(ROOT, '.' + target);
  } catch (e) {
    res.writeHead(403, Object.assign({ 'Content-Type': 'text/plain; charset=UTF-8' }, SECURITY_HEADERS));
    return res.end('403 Forbidden');
  }
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    res.writeHead(403, Object.assign({ 'Content-Type': 'text/plain; charset=UTF-8' }, SECURITY_HEADERS));
    return res.end('403 Forbidden');
  }

  const serveFile = (file, urlForCache, ext) => fs.readFile(file, (readErr, content) => {
    if (readErr) {
      res.writeHead(500, Object.assign({ 'Content-Type': 'text/plain; charset=UTF-8' }, SECURITY_HEADERS));
      return res.end('500 Server Error');
    }
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    let body = content;
    // S4 : injection du nonce dans le HTML servi (2 occurrences : <style>, <script>).
    // Un HTML sans marqueur ne reçoit aucune CSP plutôt qu'une CSP qui le
    // bloquerait intégralement.
    if (ext === '.html' && content.indexOf(NONCE_TOKEN) !== -1) {
      body = Buffer.from(content.toString('utf8').split(NONCE_TOKEN).join(nonce), 'utf8');
    } else {
      nonce = null;
    }
    send(res, 200, body, contentType, cacheControlFor(urlForCache, ext), req.headers['accept-encoding'], method === 'HEAD', nonce);
  });

  fs.stat(resolved, (err, stats) => {
    if (!err && stats.isFile()) {
      return serveFile(resolved, urlPath, path.extname(resolved).toLowerCase());
    }

    // S2 : fichier absent. Si l'URL porte une extension d'asset -> vraie 404.
    const ext = path.extname(urlPath).toLowerCase();
    if (ext && ASSET_EXT.has(ext)) {
      res.writeHead(404, Object.assign({ 'Content-Type': 'text/plain; charset=UTF-8' }, SECURITY_HEADERS));
      return res.end('404 Not Found');
    }

    // Sinon : route SPA -> fallback légitime vers index.html
    return serveFile(path.join(ROOT, 'index.html'), '/index.html', '.html');
  });
});

server.listen(PORT, () => {
  console.log(`FemCurrent server running on port ${PORT}`);
});
