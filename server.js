// R & A Associates HRMS – tiny shared-data server (no npm packages needed)
// Run:  node server.js        then open  http://localhost:3000
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000, DB = path.join(__dirname, 'data.json'), PAGE = path.join(__dirname, 'index.html');
let state = {}; try { state = JSON.parse(fs.readFileSync(DB, 'utf8')); } catch {}
let timer = null;
const persist = () => { clearTimeout(timer); timer = setTimeout(() => fs.writeFile(DB + '.tmp', JSON.stringify(state), e => { if (!e) fs.renameSync(DB + '.tmp', DB); }), 300); };
const FILES = { '/manifest.webmanifest': 'application/manifest+json', '/sw.js': 'application/javascript', '/icon-192.png': 'image/png', '/icon-512.png': 'image/png', '/icon-maskable.png': 'image/png' };
const MIME = { '.js': 'application/javascript', '.json': 'application/json', '.bin': 'application/octet-stream', '.txt': 'text/plain' };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/' || url === '/index.html') return fs.readFile(PAGE, (e, b) => { res.writeHead(e ? 404 : 200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(e ? 'index.html not found' : b); });
  if (/^\/faceapi\/(face-api\.js|model\/[\w.\-]+)$/.test(url)) return fs.readFile(path.join(__dirname, url.slice(1)), (e, b) => { res.writeHead(e ? 404 : 200, { 'Content-Type': MIME[path.extname(url)] || 'application/octet-stream', 'Cache-Control': 'public, max-age=604800' }); res.end(e ? 'missing' : b); });
  if (FILES[url]) return fs.readFile(path.join(__dirname, url.slice(1)), (e, b) => { res.writeHead(e ? 404 : 200, { 'Content-Type': FILES[url] }); res.end(e ? 'missing ' + url : b); });
  if (url === '/api/state' && req.method === 'GET') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(state)); }
  const m = /^\/api\/state\/(hrms_[\w-]+)$/.exec(url);
  if (m && req.method === 'PUT') { let body = ''; req.on('data', c => { body += c; if (body.length > 40e6) req.destroy(); }); req.on('end', () => { state[m[1]] = body; persist(); res.writeHead(204); res.end(); }); return; }
  if (m && req.method === 'DELETE') { delete state[m[1]]; persist(); res.writeHead(204); return res.end(); }
  res.writeHead(404); res.end();
}).listen(PORT, () => console.log(`HRMS running on http://localhost:${PORT}  (data saved in data.json)`));
