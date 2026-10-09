const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'client', 'js', 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

// Replace all broken mojibake strings in app.js
appJs = appJs
  .replace(/Â·/g, '·')
  .replace(/Â/g, '')
  .replace(/â€“/g, '—')
  .replace(/â€”/g, '—')
  .replace(/â€¢/g, '•')
  .replace(/â‚¹/g, '₹')
  .replace(/â†’/g, '→')
  .replace(/âœ•/g, '✕')
  .replace(/âœ”/g, '✔')
  .replace(/â€/g, '—')
  .replace(/’/g, "'")
  .replace(/‘/g, "'")
  .replace(/“/g, '"')
  .replace(/”/g, '"');

// Also fix default empty dash in tables
appJs = appJs.replace(/'\?"'/g, "'-'");
appJs = appJs.replace(/r\?\.inTime \? to12h\(r\.inTime\) : '[^']+'/g, "r?.inTime ? to12h(r.inTime) : '-'");
appJs = appJs.replace(/r\?\.outTime \? to12h\(r\.outTime\) : '[^']+'/g, "r?.outTime ? to12h(r.outTime) : '-'");
appJs = appJs.replace(/r \? lateBadge\(r\) : '[^']+'/g, "r ? lateBadge(r) : '-'");

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('client/js/app.js mojibake cleaned successfully');

// Clean client/index.html as well
const clientHtmlPath = path.join(__dirname, '..', 'client', 'index.html');
let html = fs.readFileSync(clientHtmlPath, 'utf8');
html = html
  .replace(/Â·/g, '·')
  .replace(/Â/g, '')
  .replace(/â€“/g, '—')
  .replace(/â€”/g, '—')
  .replace(/â€¢/g, '•')
  .replace(/â‚¹/g, '₹')
  .replace(/â†’/g, '→')
  .replace(/âœ•/g, '✕')
  .replace(/âœ”/g, '✔')
  .replace(/â€/g, '—');
fs.writeFileSync(clientHtmlPath, html, 'utf8');
console.log('client/index.html mojibake cleaned successfully');
