import logger from '../bot/logger.js';

export function isAuthenticated(req) {
  return req.session && req.session.user;
}

export function ensureAdmin(req, res, next) {
  if (isAuthenticated(req)) return next();
  res.status(401).json({ ok: false, error: 'Unauthorized' });
}
