// ==========================================================================
// R & A ASSOCIATES HRMS - STATE SYNC API ROUTES
// Handles state persistence and client synchronization
// ==========================================================================

const db = require('../db');

function handleStateRoutes(req, res, url) {
  // GET /api/state
  if (url === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.getState()));
    return true;
  }

  // PUT /api/state/hrms_...
  const match = /^\/api\/state\/(hrms_[\w-]+)$/.exec(url);
  if (match) {
    const key = match[1];

    if (req.method === 'PUT') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 50e6) { // 50 MB limit for photos / face embeddings
          req.destroy();
        }
      });
      req.on('end', () => {
        db.setKey(key, body);
        res.writeHead(204);
        res.end();
      });
      return true;
    }

    if (req.method === 'DELETE') {
      db.deleteKey(key);
      res.writeHead(204);
      res.end();
      return true;
    }
  }

  return false;
}

module.exports = { handleStateRoutes };
