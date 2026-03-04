import express from 'express';
import http from 'http';
import path from 'path';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { Server as SocketIOServer } from 'socket.io';
import logger from '../bot/logger.js';
import config from '../bot/config.js';
import { initializeSocket } from './socket.js';

const app = express();
const server = http.createServer(app);
// Initialize Socket.IO using shared initializer
const io = initializeSocket(server);

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'minecraft-ai-bot', 'dashboard', 'public')));

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

app.get('/api/status', requireAuth, (req, res) => {
  // Would return bot status
  res.json({ ok: true, status: 'connected' });
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

  socket.on('buildcity', (type) => {
    socket.broadcast.emit('buildcity', type);
  });

  socket.on('disconnect', () => {
    logger.info('Dashboard client disconnected');
  });
});

const port = config.dashboard.port || 3000;
server.listen(port, () => {
  logger.info(`Dashboard server listening on port ${port}`);
});
