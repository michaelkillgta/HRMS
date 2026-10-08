// ==========================================================================
// R & A ASSOCIATES HRMS - SERVER ENTRY POINT
// ==========================================================================

const http = require('http');
const config = require('./src/config');
const { createAppHandler } = require('./src/app');

const server = http.createServer(createAppHandler());

server.listen(config.PORT, () => {
  console.log(`=======================================================`);
  console.log(`  R & A Associates HRMS Server Running`);
  console.log(`  URL: http://localhost:${config.PORT}`);
  console.log(`  Data storage: ${config.DB_FILE}`);
  console.log(`=======================================================`);
});

module.exports = server;
