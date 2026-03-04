import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { Server as SocketIOServer } from 'socket.io';
import OpenAI from 'openai';
import logger from '../bot/logger.js';
import config from '../bot/config.js';
import { initializeSocket } from './socket.js';

const app = express();
const server = http.createServer(app);
// Initialize Socket.IO using shared initializer
const io = initializeSocket(server);

// require token on socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (token && token === config.dashboard.apiToken) {
    return next();
  }
  return next(new Error('Unauthorized'));
});

const openaiClient = (config.openai && config.openai.apiKey) ? new OpenAI({ apiKey: config.openai.apiKey }) : null;

// Session setup
app.use(session({
  secret: 'minecraft-ai-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Simple hard-coded admin - in production use a DB
const adminUser = {
  username: 'admin',
  passwordHash: bcrypt.hashSync(config.dashboard.password + '', 10)
};

// compute public directory relative to this file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

// authentication middleware for API tokens
function requireToken(req, res, next) {
  const token = req.headers['x-api-token'] || req.query.token;
  if (token && token === config.dashboard.apiToken) return next();
  return res.status(401).json({ ok: false, error: 'Unauthorized' });
}

// rate limiter
try {
  const rateLimit = (await import('express-rate-limit')).default;
  app.use(rateLimit({
    windowMs: config.dashboard.rateLimit.windowMs,
    max: config.dashboard.rateLimit.max
  }));
} catch (e) {
  logger.warn('Rate limit package not installed');
}

// ensure root always serves index
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === adminUser.username && bcrypt.compareSync(password, adminUser.passwordHash)) {
    req.session.user = { username };
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'Invalid credentials' });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// Basic auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/');
}

app.get('/api/status', requireAuth, requireToken, (req, res) => {
  // Would return bot status
  res.json({ ok: true, status: 'connected' });
});

// Bot control commands
const validCommands = ['pause','resume','reconnect','force-task'];
app.post('/bot/command', requireAuth, requireToken, (req, res) => {
  const { type, data } = req.body || {};
  if (!validCommands.includes(type)) {
    return res.status(400).json({ ok: false, error: 'Invalid command' });
  }
  io.emit('dashboard-command', { type, data });
  return res.json({ ok: true });
});

// Chat endpoint - processes chat messages, returns AI reply with command detection
app.post('/api/chat', async (req, res) => {
  const { 
    message = '', 
    aiName = 'Dawud', 
    personality = 'helpful', 
    temperature = 0.7,
    history = []
  } = req.body || {};
  
  const t = (message || '').toString().trim();
  if (!t) return res.json({ success: false, error: 'Empty message' });

  const low = t.toLowerCase();
  let isCommand = false;
  let commandType = null;
  let commandData = null;
  let reply = null;

  // Detect Minecraft commands
  if (low.startsWith('go to ') || low.startsWith('goto ') || /go\s+to\s+\d/.test(low)) {
    const match = t.match(/go\s+to\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/i) || 
                  t.match(/goto\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/i);
    if (match) {
      isCommand = true;
      commandType = 'force-task';
      commandData = {
        type: 'move',
        x: parseFloat(match[1]),
        y: parseFloat(match[2]),
        z: parseFloat(match[3])
      };
      reply = `Alright, heading to ${match[1]}, ${match[2]}, ${match[3]}!`;
    }
  } else if (low.includes('dig') || low.includes('mine')) {
    isCommand = true;
    commandType = 'force-task';
    commandData = { type: 'mine', oreType: 'diamond' };
    reply = `Got it! I'll start mining. This might take a while...`;
  } else if (low.includes('farm') || low.includes('grow')) {
    isCommand = true;
    commandType = 'force-task';
    commandData = { type: 'farm' };
    reply = `Time to work on the farm! I'll take care of the crops.`;
  } else if (low.includes('build') || low.includes('construct')) {
    isCommand = true;
    commandType = 'force-task';
    commandData = { type: 'build' };
    reply = `I'll start building right away!`;
  } else if (low.includes('fight') || low.includes('combat') || low.includes('attack')) {
    isCommand = true;
    commandType = 'force-task';
    commandData = { type: 'attack' };
    reply = `Time for combat! Let me prepare my weapons!`;
  } else if (low.includes('pause') || low.includes('stop')) {
    isCommand = true;
    commandType = 'pause';
    reply = `Pausing all activities...`;
  } else if (low.includes('resume') || low.includes('continue')) {
    isCommand = true;
    commandType = 'resume';
    reply = `Resuming operations!`;
  }

  // If no command matched, use AI response
  if (!reply) {
    // Simple rule-based responses
    if (low.includes('what are you doing') || low.includes('status')) {
      reply = `I'm ${aiName}, your Minecraft AI assistant. Currently monitoring the world and ready for tasks!`;
    } else if (low.includes('who are you') || low.includes("what's your name") || low.includes('your name')) {
      reply = `I'm ${aiName}, your dedicated Minecraft AI assistant. ${
        personality === 'funny' ? '👾 Ready to have some fun!' : 
        personality === 'aggressive' ? '⚔️ Ready for action!' :
        personality === 'cautious' ? '🛡️ Proceeding carefully!' :
        'Ready to help!'
      }`;
    } else if (low.includes('help')) {
      reply = `I can help with: mining, farming, building, combat, navigation. Just ask me to do something!`;
    }

    // If no rule matched and OpenAI is available, query it
    if (!reply && openaiClient) {
      try {
        const systemPrompt = `You are ${aiName}, a Minecraft AI assistant. Personality: ${personality}. Be concise (max 2-3 sentences) and refer to yourself by name. Temperature: ${temperature}.`;
        
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-3), // include last 3 messages for context
          { role: 'user', content: t }
        ];

        const chatResp = await openaiClient.chat.completions.create({
          model: config.openai.model || 'gpt-3.5-turbo',
          messages,
          max_tokens: 150,
          temperature: Math.max(0, Math.min(1, temperature))
        });

        if (chatResp?.choices?.[0]?.message?.content) {
          reply = chatResp.choices[0].message.content.trim();
        }
      } catch (e) {
        logger.warn('OpenAI chat failed', { error: e.message });
        reply = `I'm thinking about that... but I ran into a technical issue. Give me a moment!`;
      }
    }
  }

  // fallback generic
  if (!reply) {
    reply = `I'm ${aiName} and I'm here to help! You can ask me to mine, farm, build, or navigate. What would you like me to do?`;
  }

  // broadcast to connected socket clients
  try { io.emit('chat', `${aiName}: ${reply}`); } catch (e) { /* ignore */ }

  return res.json({ 
    success: true, 
    message: reply,
    isCommand, 
    commandType, 
    commandData
  });
});


io.on('connection', (socket) => {
  logger.info('Dashboard client connected');

  socket.on('control', (data) => {
    // Relay controls to bot
    logger.debug('Control event', data);
    socket.broadcast.emit('control', data);
  });

  socket.on('chat', (msg) => {
    logger.debug('Chat from dashboard', msg);
    socket.broadcast.emit('chat', msg);
  });

  socket.on('ai-command', (data) => {
    logger.debug('AI command from dashboard', data);
    socket.broadcast.emit('ai-command', data);
  });

  socket.on('goto', (payload) => {
    logger.debug('Goto event', payload);
    socket.broadcast.emit('goto', payload);
  });

  socket.on('buildcity', (type) => {
    socket.broadcast.emit('buildcity', type);
  });

  socket.on('disconnect', () => {
    logger.info('Dashboard client disconnected');
  });
});

const port = process.env.DASHBOARD_PORT || config.dashboard.port || 3333;
// bind to localhost only
server.listen(port, '127.0.0.1', () => {
  logger.info(`Dashboard server listening on http://127.0.0.1:${port}`);
});
