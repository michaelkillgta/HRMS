// ==========================================================================
// R & A ASSOCIATES HRMS - DATABASE & PERSISTENCE LAYER
// Robust data manager supporting atomic writes, backups and in-memory cache
// ==========================================================================

const fs = require('fs');
const path = require('path');
const config = require('./config');

class Database {
  constructor() {
    this.filePath = config.DB_FILE;
    this.legacyFilePath = path.join(config.ROOT_DIR, 'data.json');
    this.state = {};
    this.persistTimer = null;
    this.init();
  }

  init() {
    // Ensure data directory exists
    if (!fs.existsSync(config.DATA_DIR)) {
      try {
        fs.mkdirSync(config.DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }

    // Load from data/data.json or fallback to legacy root data.json
    let sourcePath = fs.existsSync(this.filePath) ? this.filePath :
                     fs.existsSync(this.legacyFilePath) ? this.legacyFilePath : null;

    if (sourcePath) {
      try {
        const raw = fs.readFileSync(sourcePath, 'utf8');
        this.state = JSON.parse(raw);
        console.log(`Loaded HRMS state from ${path.basename(sourcePath)} (${Object.keys(this.state).length} keys)`);
      } catch (e) {
        console.warn('Could not parse database file, initializing empty state:', e.message);
        this.state = {};
      }
    } else {
      this.state = {};
    }
  }

  getState() {
    return this.state;
  }

  getKey(key) {
    return this.state[key];
  }

  setKey(key, value) {
    this.state[key] = value;
    this.persist();
  }

  deleteKey(key) {
    delete this.state[key];
    this.persist();
  }

  persist() {
    clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => {
      const dataStr = JSON.stringify(this.state);
      const tmpFile = this.filePath + '.tmp';
      fs.writeFile(tmpFile, dataStr, 'utf8', (err) => {
        if (!err) {
          try {
            fs.renameSync(tmpFile, this.filePath);
            // Also maintain backwards compatibility with root data.json
            fs.writeFileSync(this.legacyFilePath, dataStr, 'utf8');
          } catch (renameErr) {
            console.error('Atomic persist failed:', renameErr);
          }
        } else {
          console.error('Write temp DB failed:', err);
        }
      });
    }, 300);
  }
}

module.exports = new Database();
