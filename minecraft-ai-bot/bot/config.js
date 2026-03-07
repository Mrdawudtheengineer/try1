import dotenv from 'dotenv';

dotenv.config();

// Parse command line arguments
function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = process.argv[i + 1];
      if (value && !value.startsWith('--')) {
        args[key] = value;
        i++; // skip next
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

const cliArgs = parseArgs();

export const config = {
  // Minecraft Server
  minecraft: {
    host: cliArgs.host || process.env.MINECRAFT_HOST || 'stackables.aternos.me',
    port: parseInt(cliArgs.port) || parseInt(process.env.MINECRAFT_PORT) || 39639,
    username: cliArgs.username || process.env.MINECRAFT_USERNAME || 'Dawud',
    password: cliArgs.password || process.env.MINECRAFT_PASSWORD || '',
    version: cliArgs.version || process.env.MINECRAFT_VERSION || '1.20.1',
    auth: cliArgs.auth || 'microsoft' // or 'offline'
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    // prefer the latest fast model; can be overridden via OPENAI_MODEL in .env
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  },

  // Dashboard
  dashboard: {
    port: parseInt(process.env.DASHBOARD_PORT) || 3000,
    password: process.env.DASHBOARD_PASSWORD || 'admin123',
    apiToken: process.env.DASHBOARD_API_TOKEN || 'changeme',
    rateLimit: {
      windowMs: 60000,
      max: 60
    }
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },

  // Bot AI
  ai: {
    updateInterval: 2000, // ms - update perception every 2 seconds
    perceptionRange: 32, // blocks
    memoryPersistInterval: 5000, // ms
    maxMemorySize: 10000, // max stored memories
    chatRateLimit: {
      windowMs: 10000, // 10 seconds window
      max: 5           // max requests per window per player
    }
  },

  // Reconnection
  reconnection: {
    enabled: true,
    maxAttempts: 50,
    initialDelay: 1000, // ms
    maxDelay: 30000, // ms
    delayMultiplier: 1.5
  }
};

export default config;
