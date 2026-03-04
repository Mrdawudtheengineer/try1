import fs from 'fs';
import path from 'path';
import { getSocket } from '../dashboard/socket.js';

const logDir = 'data';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'logs.json');
let logs = [];

// Load existing logs
if (fs.existsSync(logFile)) {
  try {
    logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
  } catch (e) {
    logs = [];
  }
}

const levels = {
  'error': 0,
  'warn': 1,
  'info': 2,
  'debug': 3
};

const colors = {
  'error': '\x1b[31m',    // Red
  'warn': '\x1b[33m',     // Yellow
  'info': '\x1b[36m',     // Cyan
  'debug': '\x1b[35m',    // Magenta
  'reset': '\x1b[0m'      // Reset
};

class Logger {
  constructor(level = 'info') {
    this.level = level;
  }

  log(level, message, data = null) {
    if (levels[level] > levels[this.level]) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    // Console output
    const color = colors[level] || '';
    console.log(`${color}[${level.toUpperCase()}] ${timestamp} - ${message}${colors.reset}`, data ? data : '');

    // File logging
    logs.push(logEntry);
    if (logs.length > 10000) {
      logs = logs.slice(-5000); // Keep last 5000
    }

    if (logs.length % 100 === 0) {
      this.persistLogs();
    }

    // send to dashboard socket if available
    try {
      const io = getSocket();
      if (io) {
        io.emit('log', `[${level.toUpperCase()}] ${timestamp} - ${message}`);
      }
    } catch (e) {
      // ignore
    }
  }

  error(message, data) {
    this.log('error', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  info(message, data) {
    this.log('info', message, data);
  }

  debug(message, data) {
    this.log('debug', message, data);
  }

  persistLogs() {
    try {
      fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    } catch (e) {
      console.error('Failed to persist logs:', e.message);
    }
  }
}

export default new Logger('info');
