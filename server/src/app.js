// ==========================================================================
// R & A ASSOCIATES HRMS - HTTP APPLICATION DISPATCHER
// Zero-dependency server handler (ready for Express middleware upgrade)
// ==========================================================================

const fs = require('fs');
const path = require('path');
const config = require('./config');
const { handleStateRoutes } = require('./routes/state.routes');

function createAppHandler() {
  return (req, res) => {
    // Enable CORS for modern dev setups (Vite / Next.js)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const rawUrl = decodeURIComponent(req.url.split('?')[0]);

    // 1. API Routes
    if (rawUrl.startsWith('/api/')) {
      if (rawUrl === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
      }

      if (handleStateRoutes(req, res, rawUrl)) {
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }

    // 2. Face API models & scripts (/faceapi/...)
    if (/^\/faceapi\/(face-api\.js|model\/[\w.\-]+)$/.test(rawUrl)) {
      // Check public/faceapi first, then root faceapi/
      let targetFile = path.join(config.PUBLIC_DIR, rawUrl);
      if (!fs.existsSync(targetFile)) {
        targetFile = path.join(config.ROOT_DIR, rawUrl);
      }

      return fs.readFile(targetFile, (err, data) => {
        if (err) {
          res.writeHead(404);
          return res.end('Face API asset not found');
        }
        const ext = path.extname(rawUrl);
        const mime = config.MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=604800'
        });
        res.end(data);
      });
    }

    // 3. Static public assets (manifest, sw, icons)
    const publicCandidate = path.join(config.PUBLIC_DIR, rawUrl);
    if (fs.existsSync(publicCandidate) && fs.statSync(publicCandidate).isFile()) {
      const ext = path.extname(publicCandidate);
      res.writeHead(200, { 'Content-Type': config.MIME_TYPES[ext] || 'application/octet-stream' });
      return fs.createReadStream(publicCandidate).pipe(res);
    }

    // 4. Client source assets (/client/...)
    if (rawUrl.startsWith('/client/')) {
      const clientFilePath = path.join(config.ROOT_DIR, rawUrl);
      if (fs.existsSync(clientFilePath) && fs.statSync(clientFilePath).isFile()) {
        const ext = path.extname(clientFilePath);
        res.writeHead(200, { 'Content-Type': config.MIME_TYPES[ext] || 'text/plain' });
        return fs.createReadStream(clientFilePath).pipe(res);
      }
    }

    // 5. Root page (serves client/index.html or index.html)
    if (rawUrl === '/' || rawUrl === '/index.html') {
      const pagePath = fs.existsSync(config.CLIENT_PAGE_FILE) ? config.CLIENT_PAGE_FILE : config.PAGE_FILE;
      return fs.readFile(pagePath, (err, content) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('index.html not found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
    }

    // 6. Direct file fallback from root directory
    const rootCandidate = path.join(config.ROOT_DIR, rawUrl.slice(1));
    if (fs.existsSync(rootCandidate) && fs.statSync(rootCandidate).isFile()) {
      const ext = path.extname(rootCandidate);
      res.writeHead(200, { 'Content-Type': config.MIME_TYPES[ext] || 'application/octet-stream' });
      return fs.createReadStream(rootCandidate).pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Resource not found: ' + rawUrl);
  };
}

module.exports = { createAppHandler };
