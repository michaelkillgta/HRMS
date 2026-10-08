// ==========================================================================
// R & A ASSOCIATES HRMS - SERVER CONFIGURATION
// ==========================================================================

const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_FILE = path.join(DATA_DIR, 'data.json');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');
const FACEAPI_DIR = path.join(PUBLIC_DIR, 'faceapi');

module.exports = {
  PORT: process.env.PORT || 3000,
  ROOT_DIR,
  DATA_DIR,
  DB_FILE,
  PUBLIC_DIR,
  CLIENT_DIR,
  FACEAPI_DIR,
  PAGE_FILE: path.join(ROOT_DIR, 'index.html'),
  CLIENT_PAGE_FILE: path.join(CLIENT_DIR, 'index.html'),
  MIME_TYPES: {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.bin': 'application/octet-stream',
    '.txt': 'text/plain; charset=utf-8',
    '.webmanifest': 'application/manifest+json'
  }
};
