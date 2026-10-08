const fs = require('fs');
const path = require('path');

// 1. client/index.html
const clientHtmlPath = path.join(__dirname, '..', 'client', 'index.html');
if (fs.existsSync(clientHtmlPath)) {
  let html = fs.readFileSync(clientHtmlPath, 'utf8');
  // Remove base64 logo image from modal headers
  html = html.replace(/<div class="mh-brand"><img src="data:image\/png;base64,[^"]+" alt="[^"]*" \/><div><div class="mh-co">[^<]+<\/div>/g, '<div class="mh-brand"><div><div class="mh-co">HRMS</div>');
  // Replace R & A Associates in mh-co
  html = html.replace(/<div class="mh-co">R &(?:amp;)? A Associates<\/div>/g, '<div class="mh-co">HRMS</div>');
  fs.writeFileSync(clientHtmlPath, html, 'utf8');
  console.log('client/index.html updated');
}

// 2. index.html (root)
const rootHtmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(rootHtmlPath)) {
  let html = fs.readFileSync(rootHtmlPath, 'utf8');
  html = html.replace(/<div class="mh-brand"><img src="data:image\/png;base64,[^"]+" alt="[^"]*" \/><div><div class="mh-co">[^<]+<\/div>/g, '<div class="mh-brand"><div><div class="mh-co">HRMS</div>');
  html = html.replace(/<div class="mh-co">R &(?:amp;)? A Associates<\/div>/g, '<div class="mh-co">HRMS</div>');
  fs.writeFileSync(rootHtmlPath, html, 'utf8');
  console.log('index.html updated');
}

// 3. client/js/app.js
const appJsPath = path.join(__dirname, '..', 'client', 'js', 'app.js');
if (fs.existsSync(appJsPath)) {
  let js = fs.readFileSync(appJsPath, 'utf8');
  js = js.replace(/R &amp; A Associates/g, 'HRMS');
  js = js.replace(/doc\.text\('R & A Associates',/g, "doc.text('HRMS',");
  js = js.replace(/â€“ R & A Associates/g, '– HRMS');
  js = js.replace(/– R & A Associates/g, '– HRMS');
  fs.writeFileSync(appJsPath, js, 'utf8');
  console.log('client/js/app.js updated');
}

// 4. nextjs
const letterJsxPath = path.join(__dirname, '..', 'nextjs', 'app', 'letters', 'page.jsx');
if (fs.existsSync(letterJsxPath)) {
  let jsx = fs.readFileSync(letterJsxPath, 'utf8');
  jsx = jsx.replace(/R &amp; A Associates/g, 'HRMS');
  jsx = jsx.replace(/R & A Associates/g, 'HRMS');
  fs.writeFileSync(letterJsxPath, jsx, 'utf8');
  console.log('nextjs/app/letters/page.jsx updated');
}

const layoutJsxPath = path.join(__dirname, '..', 'nextjs', 'app', 'layout.jsx');
if (fs.existsSync(layoutJsxPath)) {
  let jsx = fs.readFileSync(layoutJsxPath, 'utf8');
  jsx = jsx.replace(/R & A Associates HRMS/g, 'HRMS');
  fs.writeFileSync(layoutJsxPath, jsx, 'utf8');
  console.log('nextjs/app/layout.jsx updated');
}

console.log('All branding cleanups completed successfully!');
