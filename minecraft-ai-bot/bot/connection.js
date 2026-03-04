import mineflayer from 'mineflayer';
import { pathfinder, Movements } from 'mineflayer-pathfinder';
import pvp from 'mineflayer-pvp';
import autoEat from 'mineflayer-auto-eat';
import armorManager from 'mineflayer-armor-manager';
import toolPlugin from 'mineflayer-tool';
import config from './config.js';
import logger from './logger.js';

export class BotConnection {
  constructor() {
    this.bot = null;
    this.reconnectAttempts = 0;
    this.reconnectDelay = config.reconnection.initialDelay;
    this.isIntentionallyClosed = false;
    this.eventListeners = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      logger.info(`Attempting to connect to ${config.minecraft.host}:${config.minecraft.port}`);

      const options = {
        host: config.minecraft.host,
        port: config.minecraft.port,
        username: config.minecraft.username,
        password: config.minecraft.password,
        version: config.minecraft.version,
        auth: config.minecraft.password ? 'microsoft' : 'offline'
      };

      try {
        this.bot = mineflayer.createBot(options);

        // Load plugins
        this.bot.loadPlugin(pathfinder);
        this.bot.loadPlugin(pvp);
        this.bot.loadPlugin(autoEat);
        this.bot.loadPlugin(armorManager);
        this.bot.loadPlugin(toolPlugin);

        // Connection events
        this.bot.once('login', () => {
          logger.info('Bot logged in successfully');
          this.reconnectAttempts = 0;
          this.reconnectDelay = config.reconnection.initialDelay;
          resolve(this.bot);
        });

        this.bot.on('spawn', () => {
          logger.info('Bot spawned', { pos: this.bot.entity.position });
          
          // Setup auto-eat
          this.bot.autoEat.enable();
          
          // Setup pathfinder movements
          const mcData = require('minecraft-data')(this.bot.version);
          const movements = new Movements(this.bot, mcData);
          this.bot.pathfinder.setMovements(movements);

          // Start mineflayer viewer for live 3D view (if available)
          try {
            const viewerPort = (config.dashboard && config.dashboard.port) ? config.dashboard.port + 1 : 3001;
            const viewerLib = require('mineflayer-viewer');
            const viewerFn = viewerLib.mineflayerViewer || viewerLib;
            viewerFn(this.bot, { port: viewerPort, firstPerson: false });
            logger.info('Viewer started', { port: viewerPort });
          } catch (e) {
            logger.warn('Viewer not available or failed to start', { error: e.message });
          }
        });

        this.bot.on('end', () => {
          logger.warn('Bot disconnected from server');
          if (!this.isIntentionallyClosed && config.reconnection.enabled) {
            this.scheduleReconnect();
          }
        });

        this.bot.on('error', (err) => {
          logger.error('Bot connection error', { error: err.message });
          if (!this.isIntentionallyClosed && config.reconnection.enabled) {
            this.scheduleReconnect();
          }
        });

        this.bot.on('kicked', (reason) => {
          logger.warn('Bot kicked from server', { reason });
        });

        this.bot.on('message', (jsonMsg) => {
          const msg = jsonMsg.toString();
          logger.debug('Chat message received', { msg });
          if (this.eventListeners.length > 0) {
            this.eventListeners.forEach(listener => {
              if (listener.event === 'chat') {
                listener.callback(msg);
              }
            });
          }
        });

      } catch (err) {
        logger.error('Failed to create bot', { error: err.message });
        this.scheduleReconnect();
        reject(err);
      }
    });
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= config.reconnection.maxAttempts) {
      logger.error('Max reconnection attempts reached. Giving up.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(config.reconnection.delayMultiplier, this.reconnectAttempts - 1),
      config.reconnection.maxDelay
    );

    logger.warn(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${config.reconnection.maxAttempts})`);

    setTimeout(() => {
      this.connect().catch(err => {
        logger.error('Reconnection failed', { error: err.message });
      });
    }, delay);
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.bot) {
      this.bot.quit();
      this.bot = null;
    }
  }

  on(event, callback) {
    if (this.bot) {
      this.bot.on(event, callback);
    }
    this.eventListeners.push({ event, callback });
  }

  getBot() {
    return this.bot;
  }

  isConnected() {
    return this.bot && this.bot.entity && this.bot.entity.position;
  }
}

export default BotConnection;
